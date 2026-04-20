// api/webhook-midtrans.js
// POST /api/webhook-midtrans
// Menerima notifikasi dari Midtrans dan memproses vote

import crypto from 'crypto';
import { createSupabaseClient, getServerEnv } from './_lib/server-env.js';

function verifySignature(orderId, statusCode, grossAmount, received) {
  const { midtransServerKey } = getServerEnv();
  const hash = crypto
    .createHash('sha512')
    .update(`${orderId}${statusCode}${grossAmount}${midtransServerKey}`)
    .digest('hex');
  return hash === received;
}

export default async function handler(req, res) {
  // Midtrans hanya POST — tidak perlu CORS (server-to-server)
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const env      = getServerEnv();
    const supabase = createSupabaseClient(true);

    if (!env.midtransServerKey) {
      throw new Error('MIDTRANS_SERVER_KEY belum diset.');
    }

    const { order_id, transaction_status, fraud_status, status_code, gross_amount, signature_key } = req.body;

    // ── 1. Verifikasi signature (keamanan) ────────────────────
    if (!verifySignature(order_id, status_code, gross_amount, signature_key)) {
      console.error('[webhook] Invalid signature:', order_id);
      return res.status(403).json({ error: 'Invalid signature' });
    }

    // ── 2. Ambil transaksi ────────────────────────────────────
    const { data: trx, error: trxErr } = await supabase
      .from('payment_transactions')
      .select('*')
      .eq('order_id', order_id)
      .single();

    if (trxErr || !trx) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    // ── 3. Idempotency — jangan proses dua kali ───────────────
    if (['settlement', 'capture'].includes(trx.status)) {
      return res.status(200).json({ message: 'Already processed' });
    }

    // ── 4. Tentukan status baru ───────────────────────────────
    let newStatus = trx.status;

    if (transaction_status === 'capture') {
      newStatus = fraud_status === 'accept' ? 'settlement' : 'fraud';
    } else if (transaction_status === 'settlement') {
      newStatus = 'settlement';
    } else if (['cancel', 'deny', 'expire'].includes(transaction_status)) {
      newStatus = transaction_status;
    } else if (transaction_status === 'pending') {
      newStatus = 'pending';
    }

    // ── 5. Update status transaksi ────────────────────────────
    const { error: updateErr } = await supabase
      .from('payment_transactions')
      .update({
        status:                newStatus,
        paid_at:               newStatus === 'settlement' ? new Date().toISOString() : null,
        midtrans_notification: req.body,
      })
      .eq('id', trx.id);

    if (updateErr) throw new Error('Gagal update transaksi: ' + updateErr.message);

    // ── 6. Proses vote jika settlement ────────────────────────
    if (newStatus === 'settlement') {
      await processVote(supabase, trx);
    }

    return res.status(200).json({ message: 'OK', status: newStatus });

  } catch (err) {
    console.error('[webhook]', err);
    return res.status(500).json({ error: err.message });
  }
}

async function processVote(supabase, trx) {
  const { voter_name, school_id, vote_count, order_id, id: trx_id } = trx;

  // Upsert voter
  const { data: existing } = await supabase
    .from('voters')
    .select('id, total_votes')
    .eq('name', voter_name)
    .maybeSingle();

  let voter_id;

  if (existing) {
    voter_id = existing.id;
    await supabase
      .from('voters')
      .update({ total_votes: existing.total_votes + vote_count })
      .eq('id', voter_id);
  } else {
    const { data: newVoter, error } = await supabase
      .from('voters')
      .insert({ name: voter_name, total_votes: vote_count })
      .select()
      .single();
    if (error) throw new Error('Gagal buat voter: ' + error.message);
    voter_id = newVoter.id;
  }

  // Increment vote sekolah (atomic via RPC)
  const { error: rpcErr } = await supabase.rpc('increment_vote', {
    school_id,
    increment_by: vote_count,
  });
  if (rpcErr) throw new Error('Gagal increment vote: ' + rpcErr.message);

  // Catat vote record
  const { error: voteErr } = await supabase
    .from('votes')
    .insert({ voter_id, school_id, vote_count, payment_order_id: order_id });
  if (voteErr) throw new Error('Gagal insert vote: ' + voteErr.message);

  // Tandai transaksi sebagai vote_processed
  await supabase
    .from('payment_transactions')
    .update({ vote_processed: true })
    .eq('id', trx_id);

  console.log(`[webhook] ✓ ${vote_count} vote untuk school ${school_id} oleh ${voter_name}`);
}