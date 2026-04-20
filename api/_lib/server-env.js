// api/_lib/server-env.js
// Membaca environment variables untuk backend
// Mendukung fallback SUPABASE_URL → VITE_SUPABASE_URL

import { createClient } from '@supabase/supabase-js';

export function getServerEnv() {
  return {
    supabaseUrl:
      process.env.SUPABASE_URL ||
      process.env.VITE_SUPABASE_URL || '',

    supabaseAnonKey:
      process.env.SUPABASE_ANON_KEY ||
      process.env.VITE_SUPABASE_ANON_KEY || '',

    supabaseServiceRoleKey:
      process.env.SUPABASE_SERVICE_ROLE_KEY || '',

    midtransServerKey:
      process.env.MIDTRANS_SERVER_KEY || '',

    frontendUrl:
      process.env.FRONTEND_URL || 'http://localhost:3000',
  };
}

export function createSupabaseClient(useServiceRole = false) {
  const env = getServerEnv();

  const key = useServiceRole
    ? env.supabaseServiceRoleKey
    : (env.supabaseAnonKey || env.supabaseServiceRoleKey);

  if (!env.supabaseUrl) {
    throw new Error('SUPABASE_URL belum diset di environment.');
  }
  if (!key) {
    throw new Error(
      useServiceRole
        ? 'SUPABASE_SERVICE_ROLE_KEY belum diset.'
        : 'SUPABASE_ANON_KEY belum diset.'
    );
  }

  return createClient(env.supabaseUrl, key);
}