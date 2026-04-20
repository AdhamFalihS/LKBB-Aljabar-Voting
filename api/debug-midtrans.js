// api/debug-midtrans.js — HAPUS SETELAH SELESAI DEBUG
import { getServerEnv } from './_lib/server-env.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const env = getServerEnv();
  const key = env.midtransServerKey || '';
  
  return res.status(200).json({
    key_length: key.length,
    key_start: key.substring(0, 15),
    key_end: key.substring(key.length - 5),
    has_spaces: key.includes(' '),
    starts_with_SB: key.startsWith('SB-'),
    starts_with_Mid: key.startsWith('Mid-'),
    node_env: process.env.NODE_ENV,
  });
}