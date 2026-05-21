import Fastify from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import { loadEnv } from './config/env.js';
import supabasePlugin from './plugins/supabase.js';

const env = loadEnv();

const app = Fastify({
  logger: {
    level: env.LOG_LEVEL,
  },
});

await app.register(cors, {
  origin: true,
  credentials: true,
});

await app.register(rateLimit, {
  max: env.RATE_LIMIT_MAX,
  timeWindow: env.RATE_LIMIT_WINDOW_MS,
});

await app.register(supabasePlugin);

app.get('/health', async () => {
  const { error } = await app.supabase.from('tours').select('id').limit(1);
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: error ? 'error' : 'ok',
  };
});

export { app, env };
