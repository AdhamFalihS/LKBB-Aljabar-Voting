// api/check-payment.js
// GET /api/check-payment?order_id=PASUGAMA-xxx
// Polling status pembayaran dari frontend

import { createSupabaseClient, getServerEnv } from './_lib/server-env.js';
import { handleCors } from './_lib/cors.js';

const MIDTRANS_API_URL = process.env.NODE_ENV === 'production'
  ? 'https://api.midtrans.com/v2'
  : 'https://api.sandbox.midtrans.com/v2';

const STATUS_MSG = {
  pending:    'Menunggu pembayaran...',
  settlement: 'Pembayaran berhasil!',
  cancel:     'Transaksi dibatalkan.',
  deny:       'Transaksi ditolak.',
  expire:     'Transaksi kadaluarsa.',
  fraud:      'Transaksi ditandai sebagai fraud.',
};

export default async function handler(req, res) {
  if (handleCors(req, res)) return;
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { order_id } = req.query;

  if (!order_id || !order_id.startsWith('PASUGAMA-')) {
    return res.status(400).json({ error: 'order_id tidak valid' });
  }

  try {
    const env      = getServerEnv();
    const supabase = createSupabaseClient(true);

    const { data: trx, error } = await supabase
      .from('payment_transactions')
      .select('id, status, vote_processed, vote_count, expires_at')
      .eq('order_id', order_id)
      .single();

    if (error || !trx) {
      return res.status(404).json({ error: 'Transaksi tidak ditemukan' });
    }

    // Sudah selesai
    if (trx.status === 'settlement' && trx.vote_processed) {
      return res.status(200).json({
        status:         'settlement',
        vote_processed: true,
        vote_count:     trx.vote_count,
        message:        'Pembayaran berhasil! Vote sudah tercatat.',
      });
    }

    // Cek expired
    if (new Date() > new Date(trx.expires_at) && trx.status === 'pending') {
      await supabase
        .from('payment_transactions')
        .update({ status: 'expire' })
        .eq('id', trx.id);

      return res.status(200).json({
        status:  'expire',
        message: 'Transaksi kadaluarsa. Silakan buat transaksi baru.',
      });
    }

    // Untuk pending, cross-check ke Midtrans
    if (trx.status === 'pending' && env.midtransServerKey) {
      try {
        const auth  = Buffer.from(`${env.midtransServerKey}:`).toString('base64');
        const mtRes = await fetch(`${MIDTRANS_API_URL}/${order_id}/status`, {
          headers: { Authorization: `Basic ${auth}` },
        });

        if (mtRes.ok) {
          const mtData = await mtRes.json();
          if (['settlement', 'capture'].includes(mtData.transaction_status)) {
            return res.status(200).json({
              status:         'settlement',
              vote_processed: trx.vote_processed,
              message:        'Pembayaran dikonfirmasi, menunggu proses...',
            });
          }
        }
      } catch (e) {
        console.warn('[check-payment] Midtrans cross-check gagal:', e.message);
      }
    }

    return res.status(200).json({
      status:         trx.status,
      vote_processed: trx.vote_processed,
      expires_at:     trx.expires_at,
      message:        STATUS_MSG[trx.status] || 'Status tidak diketahui',
    });

  } catch (err) {
    console.error('[check-payment]', err);
    return res.status(500).json({ error: err.message });
  }
}