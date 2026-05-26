import type { FastifyInstance } from 'fastify';
import crypto from 'node:crypto';
import { loadEnv } from '../../config/env.js';
import {
  sendBotMessage,
  setBotWebhook,
  setChatMenuButton,
  makeWebAppKeyboard,
  makeRemoveKeyboard,
  parseBotCommand,
} from '../../services/bot.service.js';

export default async function botRoutes(app: FastifyInstance) {
  const env = loadEnv();
  const db = app.supabase;
  const botToken = env.TELEGRAM_BOT_TOKEN;
  const miniAppUrl = env.TELEGRAM_MINIAPP_URL;

  if (botToken && miniAppUrl) {
    if (env.BOT_WEBHOOK_URL) {
      await setBotWebhook(botToken, `${env.BOT_WEBHOOK_URL}/api/v1/bot/webhook`);
    }
    await setChatMenuButton(botToken, '\uD83C\uDF1F Dark Angels', miniAppUrl);
  }

  app.post('/bot/webhook', async (request, reply) => {
    if (!botToken) return reply.code(200).send({ ok: true });

    const update = request.body as {
      message?: {
        chat: { id: number };
        from?: { id: number };
        text?: string;
      };
      callback_query?: unknown;
    };

    const msg = update.message;
    if (!msg?.text) return reply.code(200).send({ ok: true });

    const chatId = msg.chat.id;
    const userId = msg.from?.id ?? chatId;
    const { command, args } = parseBotCommand(msg.text);

    if (!command) return reply.code(200).send({ ok: true });

    switch (command) {
      case 'start':
        await handleStart(chatId);
        break;
      case 'admin':
        await handleAdmin(chatId, userId);
        break;
      case 'link':
        await handleLink(chatId, userId, args);
        break;
    }

    return reply.code(200).send({ ok: true });
  });

  async function handleStart(chatId: number) {
    const keyboard = miniAppUrl
      ? makeWebAppKeyboard('\uD83D\uDEA9 Открыть Dark Angels', miniAppUrl)
      : makeRemoveKeyboard();

    const text = [
      '\u2705 Добро пожаловать в Dark Angels! \uD83C\uDFCD\uFE0F',
      '',
      '\u0417\u0434\u0435\u0441\u044C \u0432\u044B \u043D\u0430\u0439\u0434\u0435\u0442\u0435 \u044D\u043A\u0441\u043A\u043B\u044E\u0437\u0438\u0432\u043D\u044B\u0435 \u0442\u0443\u0440\u044B, \u0443\u0441\u043B\u0443\u0433\u0438 \u0438 \u043C\u0430\u0442\u0435\u0440\u0438\u0430\u043B\u044B \u043D\u0430\u0448\u0435\u0433\u043E \u043A\u043B\u0443\u0431\u0430 \u043D\u0430 \u0431\u0430\u0439\u043A\u0430\u0445.',
      '',
      '\u0414\u043B\u044F \u0434\u043E\u0441\u0442\u0443\u043F\u0430 \u043A \u0437\u0430\u043A\u0440\u044B\u0442\u043E\u043C\u0443 \u043A\u043E\u043D\u0442\u0435\u043D\u0442\u0443 \u043F\u043E\u0434\u043F\u0438\u0448\u0438\u0442\u0435\u0441\u044C \u043D\u0430 \u043A\u0430\u043D\u0430\u043B @markmakemoney.',
      '',
      '\u0415\u0441\u043B\u0438 \u0432\u044B \u0430\u0434\u043C\u0438\u043D\u0438\u0441\u0442\u0440\u0430\u0442\u043E\u0440, \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u0443\u0439\u0442\u0435 /admin \u0434\u043B\u044F \u0432\u0445\u043E\u0434\u0430 \u0432 \u043F\u0430\u043D\u0435\u043B\u044C \u0443\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u0438\u044F.',
    ].join('\n');

    await sendBotMessage(botToken, chatId, text, {
      reply_markup: keyboard,
    });
  }

  async function handleAdmin(chatId: number, userId: number) {
    const { data: admin } = await db
      .from('admins')
      .select('id, email')
      .eq('telegram_id', userId)
      .maybeSingle();

    if (!admin) {
      const text = [
        '\u26A0\uFE0F \u0412\u0430\u0448 Telegram \u043D\u0435 \u043F\u0440\u0438\u0432\u044F\u0437\u0430\u043D \u043A \u0430\u043A\u043A\u0430\u0443\u043D\u0442\u0443 \u0430\u0434\u043C\u0438\u043D\u0438\u0441\u0442\u0440\u0430\u0442\u043E\u0440\u0430.',
        '',
        '\u0427\u0442\u043E\u0431\u044B \u043F\u0440\u0438\u0432\u044F\u0437\u0430\u0442\u044C:',
        '1. \u0412\u043E\u0439\u0434\u0438\u0442\u0435 \u0432 \u043F\u0430\u043D\u0435\u043B\u044C \u0430\u0434\u043C\u0438\u043D\u0438\u0441\u0442\u0440\u0430\u0442\u043E\u0440\u0430 \u043D\u0430 \u0441\u0430\u0439\u0442\u0435',
        '2. \u041F\u0435\u0440\u0435\u0439\u0434\u0438\u0442\u0435 \u0432 \u043D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438 \u043F\u0440\u043E\u0444\u0438\u043B\u044F',
        '3. \u041D\u0430\u0436\u043C\u0438\u0442\u0435 \u00AB\u041F\u0440\u0438\u0432\u044F\u0437\u0430\u0442\u044C Telegram\u00BB',
        '4. \u041E\u0442\u043F\u0440\u0430\u0432\u044C\u0442\u0435 \u043F\u043E\u043B\u0443\u0447\u0435\u043D\u043D\u044B\u0439 \u043A\u043E\u0434 \u0441\u044E\u0434\u0430: /link <\u043A\u043E\u0434>',
      ].join('\n');

      await sendBotMessage(botToken, chatId, text);
      return;
    }

    const adminKeyboard = miniAppUrl
      ? makeWebAppKeyboard('\uD83D\uDD12 \u041F\u0430\u043D\u0435\u043B\u044C \u0430\u0434\u043C\u0438\u043D\u0438\u0441\u0442\u0440\u0430\u0442\u043E\u0440\u0430', `${miniAppUrl}/admin`)
      : makeRemoveKeyboard();

    const text = [
      `\u2705 \u0412\u044B \u0430\u0432\u0442\u043E\u0440\u0438\u0437\u043E\u0432\u0430\u043D\u044B \u043A\u0430\u043A ${admin.email}`,
      '',
      '\u0427\u0435\u0440\u0435\u0437 \u043F\u0430\u043D\u0435\u043B\u044C \u0430\u0434\u043C\u0438\u043D\u0438\u0441\u0442\u0440\u0430\u0442\u043E\u0440\u0430 \u0432\u044B \u043C\u043E\u0436\u0435\u0442\u0435:',
      '\u2022 \u0423\u043F\u0440\u0430\u0432\u043B\u044F\u0442\u044C \u0442\u0443\u0440\u0430\u043C\u0438, \u0443\u0441\u043B\u0443\u0433\u0430\u043C\u0438 \u0438 \u0431\u043B\u043E\u0433\u043E\u043C',
      '\u2022 \u041F\u0440\u043E\u0441\u043C\u0430\u0442\u0440\u0438\u0432\u0430\u0442\u044C \u0441\u0442\u0430\u0442\u0438\u0441\u0442\u0438\u043A\u0443 \u0438 \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u0435\u0439',
      '\u2022 \u042D\u043A\u0441\u043F\u043E\u0440\u0442\u0438\u0440\u043E\u0432\u0430\u0442\u044C \u0434\u0430\u043D\u043D\u044B\u0435',
      '',
      '\u041D\u0430\u0436\u043C\u0438\u0442\u0435 \u043A\u043D\u043E\u043F\u043A\u0443 \u043D\u0438\u0436\u0435, \u0447\u0442\u043E\u0431\u044B \u043E\u0442\u043A\u0440\u044B\u0442\u044C.',
    ].join('\n');

    await sendBotMessage(botToken, chatId, text, {
      reply_markup: adminKeyboard,
    });
  }

  async function handleLink(chatId: number, userId: number, code: string) {
    if (!code) {
      await sendBotMessage(
        botToken,
        chatId,
        '\u0418\u0441\u043F\u043E\u043B\u044C\u0437\u0443\u0439\u0442\u0435: /link <\u043A\u043E\u0434 \u0438\u0437 \u043F\u0430\u043D\u0435\u043B\u0438 \u0430\u0434\u043C\u0438\u043D\u0438\u0441\u0442\u0440\u0430\u0442\u043E\u0440\u0430>',
      );
      return;
    }

    const { data: linkCode, error: findError } = await db
      .from('telegram_link_codes')
      .select('id, admin_id, expires_at, used_at')
      .eq('code', code.toUpperCase())
      .maybeSingle();

    if (findError || !linkCode) {
      await sendBotMessage(
        botToken,
        chatId,
        '\u274C \u041A\u043E\u0434 \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D. \u041F\u0440\u043E\u0432\u0435\u0440\u044C\u0442\u0435 \u043F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u043E\u0441\u0442\u044C \u0432\u0432\u043E\u0434\u0430.',
      );
      return;
    }

    if (linkCode.used_at) {
      await sendBotMessage(
        botToken,
        chatId,
        '\u274C \u042D\u0442\u043E\u0442 \u043A\u043E\u0434 \u0443\u0436\u0435 \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u043D.',
      );
      return;
    }

    if (new Date(linkCode.expires_at) < new Date()) {
      await sendBotMessage(
        botToken,
        chatId,
        '\u274C \u041A\u043E\u0434 \u0438\u0441\u0442\u0435\u043A. \u0421\u0433\u0435\u043D\u0435\u0440\u0438\u0440\u0443\u0439\u0442\u0435 \u043D\u043E\u0432\u044B\u0439 \u0432 \u043F\u0430\u043D\u0435\u043B\u0438 \u0430\u0434\u043C\u0438\u043D\u0438\u0441\u0442\u0440\u0430\u0442\u043E\u0440\u0430.',
      );
      return;
    }

    const { error: linkError } = await db
      .from('admins')
      .update({ telegram_id: userId })
      .eq('id', linkCode.admin_id);

    if (linkError) {
      await sendBotMessage(
        botToken,
        chatId,
        '\u274C \u041E\u0448\u0438\u0431\u043A\u0430 \u043F\u0440\u0438\u0432\u044F\u0437\u043A\u0438. \u041F\u043E\u043F\u0440\u043E\u0431\u0443\u0439\u0442\u0435 \u043F\u043E\u0437\u0436\u0435.',
      );
      return;
    }

    await db
      .from('telegram_link_codes')
      .update({ used_at: new Date().toISOString() })
      .eq('id', linkCode.id);

    await sendBotMessage(
      botToken,
      chatId,
      '\u2705 \u0412\u0430\u0448 Telegram \u0443\u0441\u043F\u0435\u0448\u043D\u043E \u043F\u0440\u0438\u0432\u044F\u0437\u0430\u043D \u043A \u0430\u043A\u043A\u0430\u0443\u043D\u0442\u0443 \u0430\u0434\u043C\u0438\u043D\u0438\u0441\u0442\u0440\u0430\u0442\u043E\u0440\u0430!\n\n\u0418\u0441\u043F\u043E\u043B\u044C\u0437\u0443\u0439\u0442\u0435 /admin \u0434\u043B\u044F \u0432\u0445\u043E\u0434\u0430 \u0432 \u043F\u0430\u043D\u0435\u043B\u044C.',
    );
  }
}