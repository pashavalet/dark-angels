import fp from 'fastify-plugin';
import { getSupabase } from '../config/supabase.js';
import type { SupabaseClient } from '@supabase/supabase-js';

declare module 'fastify' {
  interface FastifyInstance {
    supabase: SupabaseClient;
  }
}

export default fp(async (fastify) => {
  const supabase = getSupabase();

  fastify.decorate('supabase', supabase);

  fastify.addHook('onClose', async () => {
    // Supabase client has no explicit close method; cleanup if needed
  });
}, {
  name: 'supabase-plugin',
});