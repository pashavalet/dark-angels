import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { loadEnv } from '../../config/env.js';
import { validateInitData, checkChannelSubscription, parseInitDataUser } from '../../lib/telegram-api.js';

const CHAT_ID = '@markmakemoney';

const telegramAuthSchema = z.object({
  initData: z.string().min(1),
});

async function findAdminByTelegramId(db: any, telegramId: number) {
  const { data } = await db
    .from('admins')
    .select('id, email')
    .eq('telegram_id', telegramId)
    .maybeSingle();
  return data;
}

export default async function telegramRoutes(app: FastifyInstance) {
  const env = loadEnv();
  const db = app.supabase;

  app.post('/auth/telegram', async (request, reply) => {
    const { initData } = telegramAuthSchema.parse(request.body);

    if (env.TELEGRAM_BOT_TOKEN && !validateInitData(initData, env.TELEGRAM_BOT_TOKEN)) {
      return reply.code(401).send({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Invalid initData' },
      });
    }

    const tgUser = parseInitDataUser(initData);
    if (!tgUser) {
      return reply.code(400).send({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'User data not found in initData' },
      });
    }

    const isSubscribed = await checkChannelSubscription(env.TELEGRAM_BOT_TOKEN, CHAT_ID, tgUser.id);
    const adminUser = await findAdminByTelegramId(db, tgUser.id);
    const isAdmin = !!adminUser;

    const { error: upsertError } = await db.from('telegram_users').upsert({
      telegram_id: tgUser.id,
      username: tgUser.username ?? null,
      first_name: tgUser.first_name ?? null,
      last_name: tgUser.last_name ?? null,
      language_code: tgUser.language_code ?? null,
      is_premium: tgUser.is_premium ?? false,
      is_channel_subscriber: isSubscribed,
      last_seen_at: new Date().toISOString(),
    }, {
      onConflict: 'telegram_id',
      ignoreDuplicates: false,
    });

    if (upsertError) {
      app.log.error(upsertError, 'telegram_user upsert failed');
    }

    const telegramAccessLevel = isSubscribed ? 'subscriber' : 'public';

    const accessToken = app.jwt.sign({
      sub: String(tgUser.id),
      telegram_id: tgUser.id,
      is_subscribed: isSubscribed,
      is_admin: isAdmin,
      access_level: telegramAccessLevel,
      purpose: 'telegram',
    }, { expiresIn: '24h' });

    return {
      success: true,
      data: {
        access_token: accessToken,
        user: {
          telegram_id: tgUser.id,
          username: tgUser.username,
          first_name: tgUser.first_name,
          is_subscribed: isSubscribed,
          is_admin: isAdmin,
          access_level: telegramAccessLevel,
        },
      },
    };
  });

  app.post('/auth/telegram/refresh', async (request, reply) => {
    const { initData } = telegramAuthSchema.parse(request.body);

    if (env.TELEGRAM_BOT_TOKEN && !validateInitData(initData, env.TELEGRAM_BOT_TOKEN)) {
      return reply.code(401).send({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Invalid initData' },
      });
    }

    const tgUser = parseInitDataUser(initData);
    if (!tgUser) {
      return reply.code(400).send({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'User data not found in initData' },
      });
    }

    const isSubscribed = await checkChannelSubscription(env.TELEGRAM_BOT_TOKEN, CHAT_ID, tgUser.id);
    const adminUser = await findAdminByTelegramId(db, tgUser.id);
    const isAdmin = !!adminUser;

    await db.from('telegram_users').upsert({
      telegram_id: tgUser.id,
      last_seen_at: new Date().toISOString(),
    }, {
      onConflict: 'telegram_id',
      ignoreDuplicates: false,
    });

    const telegramAccessLevel = isSubscribed ? 'subscriber' : 'public';

    const accessToken = app.jwt.sign({
      sub: String(tgUser.id),
      telegram_id: tgUser.id,
      is_subscribed: isSubscribed,
      is_admin: isAdmin,
      access_level: telegramAccessLevel,
      purpose: 'telegram',
    }, { expiresIn: '24h' });

    return {
      success: true,
      data: {
        access_token: accessToken,
        is_subscribed: isSubscribed,
        is_admin: isAdmin,
        access_level: telegramAccessLevel,
      },
    };
  });

  app.post('/track', async (request) => {
    const body = request.body as { initData?: string; page?: string; item_type?: string; item_id?: string };

    const tgUser = body.initData ? parseInitDataUser(body.initData) : null;
    if (!tgUser) {
      return { success: true };
    }

    await db.from('telegram_users').upsert({
      telegram_id: tgUser.id,
      last_seen_at: new Date().toISOString(),
    }, {
      onConflict: 'telegram_id',
      ignoreDuplicates: false,
    });

    await db.from('user_activity').insert({
      telegram_id: tgUser.id,
      page: body.page ?? null,
      item_type: body.item_type ?? null,
      item_id: body.item_id ?? null,
    });

    return { success: true };
  });
}