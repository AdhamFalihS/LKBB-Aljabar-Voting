// api/create-transaction.js
// POST /api/create-transaction

import crypto from 'crypto';
import { createSupabaseClient, getServerEnv } from './_lib/server-env.js';
import { handleCors } from './_lib/cors.js';

const MIDTRANS_SNAP_URL = process.env.NODE_ENV === 'production'
  ? 'https://app.midtrans.com/snap/v1'
  : 'https://app.sandbox.midtrans.com/snap/v1';

const PRICE_PER_VOTE = 1000;
const EXPIRY_MINUTES = 15;

function jakartaTime(date) {
  const wib = new Date(date.getTime() + 7 * 60 * 60 * 1000);
  const pad = (n) => String(n).padStart(2, '0');
  return `${wib.getUTCFullYear()}-${pad(wib.getUTCMonth() + 1)}-${pad(wib.getUTCDate())} ` +
         `${pad(wib.getUTCHours())}:${pad(wib.getUTCMinutes())}:${pad(wib.getUTCSeconds())} +0700`;
}

export default async function handler(req, res) {
  if (handleCors(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const env = getServerEnv();
    const { voter_name, school_id, vote_count } = req.body;

    // Validasi input
    if (!voter_name || typeof voter_name !== 'string' || voter_name.trim().length < 2) {
      return res.status(400).json({ error: 'Nama voter tidak valid (minimal 2 karakter)' });
    }
    if (!school_id || typeof school_id !== 'number') {
      return res.status(400).json({ error: 'school_id tidak valid' });
    }
    const voteCount = parseInt(vote_count);
    if (isNaN(voteCount) || voteCount < 1 || voteCount > 1000) {
      return res.status(400).json({ error: 'Jumlah vote harus antara 1 - 1000' });
    }

    const supabase = createSupabaseClient(true);

    // Verifikasi sekolah
    const { data: school, error: schoolErr } = await supabase
      .from('schools')
      .select('id, name')
      .eq('id', school_id)
      .single();

    if (schoolErr || !school) {
      return res.status(404).json({ error: 'Sekolah tidak ditemukan' });
    }

    // Cegah transaksi pending ganda
    const { data: existing } = await supabase
      .from('payment_transactions')
      .select('order_id')
      .eq('voter_name', voter_name.trim())
      .eq('school_id', school_id)
      .eq('status', 'pending')
      .gt('expires_at', new Date().toISOString())
      .limit(1)
      .maybeSingle();

    if (existing) {
      return res.status(409).json({
        error: 'Masih ada transaksi yang belum dibayar.',
        existing_order_id: existing.order_id
      });
    }

    // Generate order ID
    const orderId     = `PASUGAMA-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    const grossAmount = voteCount * PRICE_PER_VOTE;
    const expiresAt   = new Date(Date.now() + EXPIRY_MINUTES * 60 * 1000);

    // Simpan ke database
    const { data: trx, error: insertErr } = await supabase
      .from('payment_transactions')
      .insert({
        order_id:     orderId,
        voter_name:   voter_name.trim(),
        school_id,
        vote_count:   voteCount,
        gross_amount: grossAmount,
        status:       'pending',
        expires_at:   expiresAt.toISOString(),
      })
      .select()
      .single();

    if (insertErr) throw new Error('Gagal simpan transaksi: ' + insertErr.message);

    // Mock mode
    if (!env.midtransServerKey) {
      return res.status(200).json({
        success:        true,
        order_id:       orderId,
        transaction_id: trx.id,
        gross_amount:   grossAmount,
        snap_token:     'mock-token-' + Date.now(),
        redirect_url:   '#',
        expires_at:     expiresAt.toISOString(),
        school_name:    school.name,
        mock:           true,
      });
    }

    const auth = Buffer.from(`${env.midtransServerKey}:`).toString('base64');

    // Snap payload TANPA payment_type & qris (itu bukan untuk Snap API)
    const snapPayload = {
      transaction_details: {
        order_id:     orderId,
        gross_amount: grossAmount,
      },
      customer_details: {
        first_name: voter_name.trim(),
      },
      item_details: [{
        id:       `VOTE-${school_id}`,
        price:    PRICE_PER_VOTE,
        quantity: voteCount,
        name:     `Vote untuk ${school.name}`,
      }],
      enabled_payments: ['gopay', 'qris'],
      expiry: {
        start_time: jakartaTime(new Date()),
        unit:       'minutes',
        duration:   EXPIRY_MINUTES,
      },
    };

    const mtRes = await fetch(`${MIDTRANS_SNAP_URL}/transactions`, {
      method:  'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Basic ${auth}`,
      },
      body: JSON.stringify(snapPayload),
    });

    const mtData = await mtRes.json();

    if (!mtRes.ok || mtData.error_messages) {
      await supabase.from('payment_transactions').delete().eq('id', trx.id);
      throw new Error('Midtrans error: ' + (mtData.error_messages?.join(', ') || JSON.stringify(mtData)));
    }

    await supabase
      .from('payment_transactions')
      .update({ midtrans_token: mtData.token })
      .eq('id', trx.id);

    return res.status(200).json({
      success:        true,
      order_id:       orderId,
      transaction_id: trx.id,
      gross_amount:   grossAmount,
      snap_token:     mtData.token,
      redirect_url:   mtData.redirect_url,
      expires_at:     expiresAt.toISOString(),
      school_name:    school.name,
    });

  } catch (err) {
    console.error('[create-transaction]', err.message);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}