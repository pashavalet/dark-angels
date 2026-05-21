import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { loadEnv } from './env.js';

let supabase: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (supabase) return supabase;

  const env = loadEnv();

  supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    db: {
      schema: 'public',
    },
  });

  return supabase;
}

export function getSupabaseAdmin(): SupabaseClient {
  return getSupabase();
}