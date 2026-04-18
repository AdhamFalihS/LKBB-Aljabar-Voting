// api/webhook-midtrans.js
// POST /api/webhook-midtrans
// Menerima notifikasi dari Midtrans dan memproses vote

import crypto from 'crypto';
import { createSupabaseClient, getServerEnv } from './_lib/server-env.js';

/**
 * Verifikasi signature Midtrans untuk mencegah webhook palsu
 * Formula: SHA512(order_id + status_code + gross_amount + server_key)
 */
function verifyMidtransSignature(orderId, statusCode, grossAmount, receivedSignature) {
  const { midtransServerKey } = getServerEnv();
  const rawString = `${orderId}${statusCode}${grossAmount}${midtransServerKey}`;
  const expectedSignature = crypto
    .createHash('sha512')
    .update(rawString)
    .digest('hex');
  return expectedSignature === receivedSignature;
}

export default async function handler(req, res) {
  // Midtrans hanya mengirim POST
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const env = getServerEnv();
    const supabase = createSupabaseClient(true);

    if (!env.midtransServerKey) {
      throw new Error('MIDTRANS_SERVER_KEY belum diset di environment server.');
    }

    const notification = req.body;

    const {
      order_id,
      transaction_status,
      fraud_status,
      status_code,
      gross_amount,
      signature_key
    } = notification;

    // ─── 1. Verifikasi Signature (Security Layer) ─────────────
    const isValidSignature = verifyMidtransSignature(
      order_id,
      status_code,
      gross_amount,
      signature_key
    );

    if (!isValidSignature) {
      console.error('[webhook] Invalid signature for order:', order_id);
      return res.status(403).json({ error: 'Invalid signature' });
    }

    // ─── 2. Ambil transaksi dari database ─────────────────────
    const { data: transaction, error: txError } = await supabase
      .from('payment_transactions')
      .select('*')
      .eq('order_id', order_id)
      .single();

    if (txError || !transaction) {
      console.error('[webhook] Transaction not found:', order_id);
      return res.status(404).json({ error: 'Transaction not found' });
    }

    // ─── 3. Cegah double-processing (idempotency) ─────────────
    if (transaction.status === 'settlement' || transaction.status === 'capture') {
      console.log('[webhook] Already processed:', order_id);
      return res.status(200).json({ message: 'Already processed' });
    }

    // ─── 4. Tentukan status berdasarkan notifikasi Midtrans ───
    let newStatus = transaction.status;

    if (transaction_status === 'capture') {
      newStatus = fraud_status === 'accept' ? 'settlement' : 'fraud';
    } else if (transaction_status === 'settlement') {
      newStatus = 'settlement';
    } else if (['cancel', 'deny', 'expire'].includes(transaction_status)) {
      newStatus = transaction_status; // cancel / deny / expire
    } else if (transaction_status === 'pending') {
      newStatus = 'pending';
    }

    // ─── 5. Update status transaksi ───────────────────────────
    const { error: updateTxError } = await supabase
      .from('payment_transactions')
      .update({
        status: newStatus,
        paid_at: newStatus === 'settlement' ? new Date().toISOString() : null,
        midtrans_notification: notification
      })
      .eq('id', transaction.id);

    if (updateTxError) throw new Error('Gagal update status transaksi');

    // ─── 6. Jika settlement → proses vote ─────────────────────
    if (newStatus === 'settlement') {
      await processVote(supabase, transaction);
    }

    return res.status(200).json({ message: 'OK', status: newStatus });

  } catch (error) {
    console.error('[webhook] Error:', error);
    return res.status(500).json({ error: error.message });
  }
}

/**
 * Proses vote setelah pembayaran berhasil
 * Menggunakan upsert + RPC increment untuk menghindari race condition
 */
async function processVote(supabase, transaction) {
  const { voter_name, school_id, vote_count } = transaction;

  // ─── Upsert voter (insert jika baru, update jika sudah ada) ──
  const { data: existingVoter } = await supabase
    .from('voters')
    .select('id, total_votes')
    .eq('name', voter_name)
    .maybeSingle();

  let voter_id;

  if (existingVoter) {
    voter_id = existingVoter.id;
    const { error } = await supabase
      .from('voters')
      .update({ total_votes: existingVoter.total_votes + vote_count })
      .eq('id', voter_id);
    if (error) throw new Error('Gagal update voter: ' + error.message);
  } else {
    const { data: newVoter, error } = await supabase
      .from('voters')
      .insert({ name: voter_name, total_votes: vote_count })
      .select()
      .single();
    if (error) throw new Error('Gagal buat voter: ' + error.message);
    voter_id = newVoter.id;
  }

  // ─── Update total votes sekolah via RPC (atomic) ──────────
  const { error: rpcError } = await supabase.rpc('increment_vote', {
    school_id: school_id,
    increment_by: vote_count
  });
  if (rpcError) throw new Error('Gagal increment vote sekolah: ' + rpcError.message);

  // ─── Catat vote record ─────────────────────────────────────
  const { error: voteError } = await supabase
    .from('votes')
    .insert({
      voter_id,
      school_id,
      vote_count,
      payment_order_id: transaction.order_id
    });
  if (voteError) throw new Error('Gagal insert vote record: ' + voteError.message);

  // ─── Mark transaksi sebagai vote_processed ─────────────────
  await supabase
    .from('payment_transactions')
    .update({ vote_processed: true })
    .eq('id', transaction.id);

  console.log(`[webhook] Vote processed: ${vote_count} votes for school ${school_id} by ${voter_name}`);
}
