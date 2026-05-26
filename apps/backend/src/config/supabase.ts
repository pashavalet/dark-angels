import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { loadEnv } from './env.js';
import { createMockSupabase } from './mock-supabase.js';
import { WebSocket as WsWebSocket } from 'ws';

let supabase: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (supabase) return supabase;

  const env = loadEnv();

  if (env.MOCK_MODE) {
    supabase = createMockSupabase() as unknown as SupabaseClient;
    return supabase;
  }

  supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    db: {
      schema: 'public',
    },
    realtime: {
      transport: WsWebSocket as unknown as any,
    },
  });

  return supabase;
}

export function getSupabaseAdmin(): SupabaseClient {
  return getSupabase();
}