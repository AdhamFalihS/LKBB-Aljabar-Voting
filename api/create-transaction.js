// api/create-transaction.js
// POST /api/create-transaction
// Membuat transaksi baru di Midtrans dan return QRIS

import crypto from 'crypto';
import { createSupabaseClient, getServerEnv } from './_lib/server-env.js';

const MIDTRANS_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://app.midtrans.com/snap/v1'
  : 'https://app.sandbox.midtrans.com/snap/v1';

// Harga per vote dalam rupiah
const PRICE_PER_VOTE = 1000;

// Batas waktu pembayaran (dalam menit)
const PAYMENT_EXPIRY_MINUTES = 15;

function formatMidtransStartTime(date) {
  const jakartaOffsetMinutes = 7 * 60;
  const jakartaDate = new Date(date.getTime() + jakartaOffsetMinutes * 60 * 1000);

  const year = jakartaDate.getUTCFullYear();
  const month = String(jakartaDate.getUTCMonth() + 1).padStart(2, '0');
  const day = String(jakartaDate.getUTCDate()).padStart(2, '0');
  const hours = String(jakartaDate.getUTCHours()).padStart(2, '0');
  const minutes = String(jakartaDate.getUTCMinutes()).padStart(2, '0');
  const seconds = String(jakartaDate.getUTCSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds} +0700`;
}

export default async function handler(req, res) {
  const env = getServerEnv();
  res.setHeader('Access-Control-Allow-Origin', env.frontendUrl || '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const supabase = createSupabaseClient(true);

    if (!env.midtransServerKey) {
      throw new Error('MIDTRANS_SERVER_KEY belum diset di environment server.');
    }

    const { voter_name, school_id, vote_count } = req.body;

    // ─── Validasi Input ───────────────────────────────────────
    if (!voter_name || typeof voter_name !== 'string' || voter_name.trim().length < 2) {
      return res.status(400).json({ error: 'Nama voter tidak valid (minimal 2 karakter)' });
    }
    if (!school_id || typeof school_id !== 'number') {
      return res.status(400).json({ error: 'school_id tidak valid' });
    }
    const parsedVoteCount = parseInt(vote_count);
    if (isNaN(parsedVoteCount) || parsedVoteCount < 1 || parsedVoteCount > 1000) {
      return res.status(400).json({ error: 'Jumlah vote harus antara 1 - 1000' });
    }

    // ─── Verifikasi sekolah ada di database ──────────────────
    const { data: school, error: schoolError } = await supabase
      .from('schools')
      .select('id, name')
      .eq('id', school_id)
      .single();

    if (schoolError || !school) {
      return res.status(404).json({ error: 'Sekolah tidak ditemukan' });
    }

    // ─── Cek apakah ada transaksi pending yang belum expired ──
    const { data: existingPending } = await supabase
      .from('payment_transactions')
      .select('id, order_id, expires_at')
      .eq('voter_name', voter_name.trim())
      .eq('school_id', school_id)
      .eq('status', 'pending')
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    // Jika ada transaksi pending yang masih aktif, tolak untuk cegah abuse
    if (existingPending) {
      return res.status(409).json({
        error: 'Masih ada transaksi yang belum dibayar. Selesaikan atau tunggu hingga kadaluarsa.',
        existing_order_id: existingPending.order_id
      });
    }

    // ─── Generate Order ID yang unik ─────────────────────────
    const timestamp = Date.now();
    const randomHex = crypto.randomBytes(4).toString('hex').toUpperCase();
    const orderId = `PASUGAMA-${timestamp}-${randomHex}`;

    const grossAmount = parsedVoteCount * PRICE_PER_VOTE;

    // ─── Hitung waktu expired ─────────────────────────────────
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + PAYMENT_EXPIRY_MINUTES);

    // ─── Simpan transaksi ke database (status: pending) ───────
    const { data: transaction, error: insertError } = await supabase
      .from('payment_transactions')
      .insert({
        order_id: orderId,
        voter_name: voter_name.trim(),
        school_id: school_id,
        vote_count: parsedVoteCount,
        gross_amount: grossAmount,
        status: 'pending',
        expires_at: expiresAt.toISOString()
      })
      .select()
      .single();

    if (insertError) throw new Error('Gagal membuat transaksi: ' + insertError.message);

    // ─── Request ke Midtrans Snap API ─────────────────────────
    const midtransPayload = {
      transaction_details: {
        order_id: orderId,
        gross_amount: grossAmount
      },
      customer_details: {
        first_name: voter_name.trim()
      },
      item_details: [
        {
          id: `VOTE-${school_id}`,
          price: PRICE_PER_VOTE,
          quantity: parsedVoteCount,
          name: `Vote untuk ${school.name}`
        }
      ],
      payment_type: 'qris',
      qris: {
        acquirer: 'gopay'
      },
      expiry: {
        start_time: formatMidtransStartTime(new Date()),
        unit: 'minutes',
        duration: PAYMENT_EXPIRY_MINUTES
      }
    };

    const midtransAuth = Buffer.from(`${env.midtransServerKey}:`).toString('base64');

    const midtransRes = await fetch(`${MIDTRANS_BASE_URL}/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${midtransAuth}`
      },
      body: JSON.stringify(midtransPayload)
    });

    const midtransData = await midtransRes.json();

    if (!midtransRes.ok || midtransData.error_messages) {
      // Rollback transaksi jika Midtrans gagal
      await supabase.from('payment_transactions').delete().eq('id', transaction.id);
      throw new Error('Midtrans error: ' + (midtransData.error_messages?.join(', ') || 'Unknown error'));
    }

    // ─── Update transaksi dengan Midtrans token ───────────────
    await supabase
      .from('payment_transactions')
      .update({ midtrans_token: midtransData.token })
      .eq('id', transaction.id);

    return res.status(200).json({
      success: true,
      order_id: orderId,
      transaction_id: transaction.id,
      gross_amount: grossAmount,
      snap_token: midtransData.token,
      redirect_url: midtransData.redirect_url,
      expires_at: expiresAt.toISOString(),
      school_name: school.name
    });

  } catch (error) {
    console.error('[create-transaction] Error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
