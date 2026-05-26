import Fastify from 'fastify';
import cors from '@fastify/cors';
import cookie from '@fastify/cookie';
import jwt from '@fastify/jwt';
import rateLimit from '@fastify/rate-limit';
import { loadEnv } from './config/env.js';
import supabasePlugin from './plugins/supabase.js';
import authPlugin from './plugins/auth.js';
import authRoutes from './routes/auth/routes.js';
import telegramRoutes from './routes/telegram/routes.js';
import tourRoutes from './routes/tours/routes.js';
import serviceRoutes from './routes/services/routes.js';
import blogRoutes from './routes/blog/routes.js';
import homepageRoutes from './routes/homepage/routes.js';
import uploadRoutes from './routes/upload/routes.js';
import adminRoutes from './routes/admin/routes.js';
import botRoutes from './routes/bot/routes.js';

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

await app.register(cookie, {
  secret: env.JWT_SECRET,
});

await app.register(jwt, {
  secret: env.JWT_SECRET,
  sign: { expiresIn: env.JWT_EXPIRES_IN },
  cookie: { cookieName: 'refresh_token', signed: false },
});

await app.register(rateLimit, {
  max: env.RATE_LIMIT_MAX,
  timeWindow: env.RATE_LIMIT_WINDOW_MS,
});

await app.register(supabasePlugin);
await app.register(authPlugin);
await app.register(authRoutes, { prefix: '/api/v1/auth' });
await app.register(telegramRoutes, { prefix: '/api/v1' });
await app.register(tourRoutes, { prefix: '/api/v1/tours' });
await app.register(serviceRoutes, { prefix: '/api/v1/services' });
await app.register(blogRoutes, { prefix: '/api/v1/blog' });
await app.register(homepageRoutes, { prefix: '/api/v1/homepage' });
await app.register(uploadRoutes, { prefix: '/api/v1/upload' });

await app.register(adminRoutes, { prefix: '/api/v1/admin' });
await app.register(botRoutes, { prefix: '/api/v1' });

app.get('/health', async () => {
  const { error } = await app.supabase.from('tours').select('id').limit(1);
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: error ? 'error' : 'ok',
  };
});

app.get('/debug/env', async () => {
  return {
    MOCK_MODE: env.MOCK_MODE,
    SUPABASE_URL: env.SUPABASE_URL?.replace(/(.{10}).*(.{15})$/, '$1***$2'),
    RAW_MOCK_MODE: process.env.MOCK_MODE,
    RAW_NODE_ENV: process.env.NODE_ENV,
  };
});

app.get('/debug/admins', async () => {
  const { data, error } = await app.supabase.from('admins').select('email').limit(10);
  return { data, error };
});

export { app, env };
