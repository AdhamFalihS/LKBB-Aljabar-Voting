// api/check-payment.js
// GET /api/check-payment?order_id=XXXXX
// Frontend polling untuk cek status pembayaran

import { createSupabaseClient, getServerEnv } from './_lib/server-env.js';

const MIDTRANS_API_URL = process.env.NODE_ENV === 'production'
  ? 'https://api.midtrans.com/v2'
  : 'https://api.sandbox.midtrans.com/v2';

export default async function handler(req, res) {
  const env = getServerEnv();
  res.setHeader('Access-Control-Allow-Origin', env.frontendUrl || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { order_id } = req.query;

  if (!order_id || !order_id.startsWith('PASUGAMA-')) {
    return res.status(400).json({ error: 'order_id tidak valid' });
  }

  try {
    const supabase = createSupabaseClient(true);

    // ─── Cek status dari database kita ────────────────────────
    const { data: transaction, error } = await supabase
      .from('payment_transactions')
      .select('id, status, vote_processed, vote_count, school_id, voter_name, gross_amount, expires_at, paid_at')
      .eq('order_id', order_id)
      .single();

    if (error || !transaction) {
      return res.status(404).json({ error: 'Transaksi tidak ditemukan' });
    }

    // Jika sudah settlement/vote processed, langsung return
    if (transaction.status === 'settlement' && transaction.vote_processed) {
      return res.status(200).json({
        status: 'settlement',
        vote_processed: true,
        vote_count: transaction.vote_count,
        message: 'Pembayaran berhasil! Vote sudah tercatat.'
      });
    }

    // Cek apakah sudah expired
    const now = new Date();
    const expiresAt = new Date(transaction.expires_at);

    if (now > expiresAt && transaction.status === 'pending') {
      // Update status ke expired di database
      await supabase
        .from('payment_transactions')
        .update({ status: 'expire' })
        .eq('id', transaction.id);

      return res.status(200).json({
        status: 'expire',
        message: 'Transaksi telah kadaluarsa. Silakan buat transaksi baru.'
      });
    }

    // Untuk transaksi pending, cek juga langsung ke Midtrans API
    if (transaction.status === 'pending') {
      try {
        if (!env.midtransServerKey) {
          throw new Error('MIDTRANS_SERVER_KEY belum diset di environment server.');
        }

        const midtransAuth = Buffer.from(`${env.midtransServerKey}:`).toString('base64');
        const mtRes = await fetch(`${MIDTRANS_API_URL}/${order_id}/status`, {
          headers: { 'Authorization': `Basic ${midtransAuth}` }
        });

        if (mtRes.ok) {
          const mtData = await mtRes.json();
          if (mtData.transaction_status === 'settlement' || mtData.transaction_status === 'capture') {
            // Ini berarti webhook belum masuk, proses manual
            // Cukup return status dari Midtrans, biarkan webhook yang proses
            return res.status(200).json({
              status: 'settlement',
              vote_processed: transaction.vote_processed,
              midtrans_status: mtData.transaction_status,
              message: 'Pembayaran dikonfirmasi, menunggu proses...'
            });
          }
        }
      } catch (mtErr) {
        // Midtrans check gagal, gunakan data dari DB saja
        console.warn('[check-payment] Midtrans API check failed:', mtErr.message);
      }
    }

    // Return status dari database
    return res.status(200).json({
      status: transaction.status,
      vote_processed: transaction.vote_processed,
      expires_at: transaction.expires_at,
      message: getStatusMessage(transaction.status)
    });

  } catch (error) {
    console.error('[check-payment] Error:', error);
    return res.status(500).json({ error: error.message });
  }
}

function getStatusMessage(status) {
  const messages = {
    pending: 'Menunggu pembayaran...',
    settlement: 'Pembayaran berhasil!',
    cancel: 'Transaksi dibatalkan.',
    deny: 'Transaksi ditolak.',
    expire: 'Transaksi kadaluarsa.',
    fraud: 'Transaksi ditandai sebagai fraud.'
  };
  return messages[status] || 'Status tidak diketahui';
}
