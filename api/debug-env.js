import { getServerEnv } from './_lib/server-env.js';

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const env = getServerEnv();

  return res.status(200).json({
    ok: true,
    env: {
      supabaseUrl: Boolean(env.supabaseUrl),
      supabaseAnonKey: Boolean(env.supabaseAnonKey),
      supabaseServiceRoleKey: Boolean(env.supabaseServiceRoleKey),
      midtransServerKey: Boolean(env.midtransServerKey),
      frontendUrl: Boolean(env.frontendUrl)
    }
  });
}
