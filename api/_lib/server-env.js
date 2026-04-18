import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

let localEnvCache;

function stripWrappingQuotes(value) {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }

  return value;
}

function stripInlineComment(value) {
  let inSingleQuote = false;
  let inDoubleQuote = false;

  for (let index = 0; index < value.length; index += 1) {
    const char = value[index];

    if (char === "'" && !inDoubleQuote) {
      inSingleQuote = !inSingleQuote;
      continue;
    }

    if (char === '"' && !inSingleQuote) {
      inDoubleQuote = !inDoubleQuote;
      continue;
    }

    if (char === '#' && !inSingleQuote && !inDoubleQuote) {
      const previousChar = index > 0 ? value[index - 1] : '';
      if (!previousChar || /\s/.test(previousChar)) {
        return value.slice(0, index).trim();
      }
    }
  }

  return value.trim();
}

function loadLocalEnvFile() {
  if (localEnvCache) {
    return localEnvCache;
  }

  localEnvCache = {};

  try {
    const envPath = path.join(process.cwd(), '.env.local');
    const content = fs.readFileSync(envPath, 'utf8');

    for (const rawLine of content.split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line || line.startsWith('#')) {
        continue;
      }

      const separatorIndex = line.indexOf('=');
      if (separatorIndex === -1) {
        continue;
      }

      const key = line.slice(0, separatorIndex).trim();
      const rawValue = line.slice(separatorIndex + 1).trim();
      const value = stripWrappingQuotes(stripInlineComment(rawValue));

      if (key && value) {
        localEnvCache[key] = value;
      }
    }
  } catch {
    localEnvCache = {};
  }

  return localEnvCache;
}

function readEnv(...keys) {
  const localEnv = loadLocalEnvFile();

  for (const key of keys) {
    const value = process.env[key];
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }

    const fallbackValue = localEnv[key];
    if (typeof fallbackValue === 'string' && fallbackValue.trim()) {
      return fallbackValue.trim();
    }
  }

  return '';
}

export function getServerEnv() {
  const supabaseUrl = readEnv('SUPABASE_URL', 'VITE_SUPABASE_URL');
  const supabaseAnonKey = readEnv('SUPABASE_ANON_KEY', 'VITE_SUPABASE_ANON_KEY');
  const supabaseServiceRoleKey = readEnv('SUPABASE_SERVICE_ROLE_KEY');
  const midtransServerKey = readEnv('MIDTRANS_SERVER_KEY');
  const frontendUrl = readEnv('FRONTEND_URL');

  return {
    supabaseUrl,
    supabaseAnonKey,
    supabaseServiceRoleKey,
    midtransServerKey,
    frontendUrl
  };
}

export function createSupabaseClient(useServiceRole = false) {
  const env = getServerEnv();
  const supabaseKey = useServiceRole
    ? env.supabaseServiceRoleKey
    : env.supabaseAnonKey || env.supabaseServiceRoleKey;

  if (!env.supabaseUrl) {
    throw new Error('SUPABASE_URL belum diset di environment server.');
  }

  if (!supabaseKey) {
    throw new Error(
      useServiceRole
        ? 'SUPABASE_SERVICE_ROLE_KEY belum diset di environment server.'
        : 'SUPABASE_ANON_KEY atau SUPABASE_SERVICE_ROLE_KEY belum diset di environment server.'
    );
  }

  return createClient(env.supabaseUrl, supabaseKey);
}
