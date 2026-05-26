import type { FastifyInstance } from 'fastify';
import { loadEnv } from '../../config/env.js';
import {
  sendBotMessage,
  initBot,
  getWebhookInfo,
  makeWebAppKeyboard,
  makeRemoveKeyboard,
  parseBotCommand,
} from '../../services/bot.service.js';

export default async function botRoutes(app: FastifyInstance) {
  const env = loadEnv();
  const db = app.supabase;
  const botToken = env.TELEGRAM_BOT_TOKEN;
  const miniAppUrl = env.TELEGRAM_MINIAPP_URL;

  const webhookUrl = env.BOT_WEBHOOK_URL
    ? `${env.BOT_WEBHOOK_URL}/api/v1/bot/webhook`
    : undefined;

  if (botToken && miniAppUrl) {
    try {
      await initBot(botToken, miniAppUrl, webhookUrl);
    } catch (err) {
      console.error('bot init failed:', err);
    }
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

  app.get('/bot/setup', async (request, reply) => {
    if (!botToken || !miniAppUrl) {
      return reply.code(400).send({
        success: false,
        error: 'TELEGRAM_BOT_TOKEN or TELEGRAM_MINIAPP_URL not configured',
      });
    }
    try {
      await initBot(botToken, miniAppUrl, webhookUrl);
      return { success: true, message: 'Bot re-initialized' };
    } catch (err) {
      return reply.code(500).send({ success: false, error: String(err) });
    }
  });

  app.get('/debug/bot', async () => {
    if (!botToken) {
      return { configured: false, message: 'TELEGRAM_BOT_TOKEN not set' };
    }
    const info = await getWebhookInfo(botToken);
    return {
      configured: true,
      mini_app_url: miniAppUrl,
      webhook_url: webhookUrl,
      webhook_info: info,
    };
  });

  async function handleStart(chatId: number) {
    const keyboard = miniAppUrl
      ? makeWebAppKeyboard('\uD83D\uDEA9 Открыть Dark Angels', miniAppUrl)
      : makeRemoveKeyboard();

    const text = [
      '\u2705 Добро пожаловать в Dark Angels! \uD83C\uDFCD\uFE0F',
      '',
      'Здесь вы найдете эксклюзивные туры, услуги и материалы нашего клуба на байках.',
      '',
      'Для доступа к закрытому контенту подпишитесь на канал @markmakemoney.',
      '',
      'Если вы администратор, используйте /admin для входа в панель управления.',
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
        '\u26A0\uFE0F Ваш Telegram не привязан к аккаунту администратора.',
        '',
        'Чтобы привязать:',
        '1. Войдите в панель администратора на сайте',
        '2. Перейдите в настройки профиля',
        '3. Нажмите «Привязать Telegram»',
        '4. Отправьте полученный код сюда: /link <код>',
      ].join('\n');

      await sendBotMessage(botToken, chatId, text);
      return;
    }

    const adminKeyboard = miniAppUrl
      ? makeWebAppKeyboard('\uD83D\uDD12 Панель администратора', `${miniAppUrl}/admin`)
      : makeRemoveKeyboard();

    const text = [
      `\u2705 Вы авторизованы как ${admin.email}`,
      '',
      'Через панель администратора вы можете:',
      '\u2022 Управлять турами, услугами и блогом',
      '\u2022 Просматривать статистику и пользователей',
      '\u2022 Экспортировать данные',
      '',
      'Нажмите кнопку ниже, чтобы открыть.',
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
        'Используйте: /link <код из панели администратора>',
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
        '\u274C Код не найден. Проверьте правильность ввода.',
      );
      return;
    }

    if (linkCode.used_at) {
      await sendBotMessage(
        botToken,
        chatId,
        '\u274C Этот код уже использован.',
      );
      return;
    }

    if (new Date(linkCode.expires_at) < new Date()) {
      await sendBotMessage(
        botToken,
        chatId,
        '\u274C Код истек. Сгенерируйте новый в панели администратора.',
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
        '\u274C Ошибка привязки. Попробуйте позже.',
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
      '\u2705 Ваш Telegram успешно привязан к аккаунту администратора!\n\nИспользуйте /admin для входа в панель.',
    );
  }
}