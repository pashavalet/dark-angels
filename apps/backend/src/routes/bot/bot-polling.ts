import type { FastifyInstance } from 'fastify';
import { loadEnv } from '../../config/env.js';
import {
  sendBotMessage,
  getUpdates,
  initBot,
  makeWebAppKeyboard,
  makeRemoveKeyboard,
  parseBotCommand,
} from '../../services/bot.service.js';

let lastUpdateId = 0;
let polling = false;

export function startBotPolling(app: FastifyInstance): void {
  const env = loadEnv();
  const botToken = env.TELEGRAM_BOT_TOKEN;
  const miniAppUrl = env.TELEGRAM_MINIAPP_URL;

  if (!botToken || !miniAppUrl) {
    console.log('startBotPolling: skipped (botToken or miniAppUrl not configured)');
    return;
  }

  initBot(botToken, miniAppUrl);

  const tick = async () => {
    if (polling) return;
    polling = true;
    try {
      const updates = await getUpdates(botToken, lastUpdateId + 1);
      for (const update of updates) {
        lastUpdateId = update.update_id;
        const msg = update.message;
        if (!msg?.text) continue;
        const chatId = msg.chat.id;
        const userId = msg.from?.id ?? chatId;
        const { command, args } = parseBotCommand(msg.text);
        await handleCommand(app, botToken, miniAppUrl, chatId, userId, command, args);
      }
    } catch (err) {
      console.error('polling tick error:', err);
    }
    polling = false;
  };

  setInterval(tick, 3000);
  tick();
}

async function handleCommand(
  app: FastifyInstance,
  botToken: string,
  miniAppUrl: string,
  chatId: number,
  userId: number,
  command: string,
  args: string,
) {
  if (!command) return;

  console.log(`bot command: /${command} from ${chatId}`);

  const db = app.supabase;

  switch (command) {
    case 'start': {
      const keyboard = miniAppUrl
        ? makeWebAppKeyboard('\uD83D\uDEA9 Открыть Dark Angels', miniAppUrl)
        : makeRemoveKeyboard();

      const text = [
        '\u2705 Добро пожаловать в Dark Angels! \uD83C\uDFCD\uFE0F',
        '',
        'Здесь вы найдете эксклюзивные туры, услуги и материалы нашего клуба.',
        '',
        'Для доступа к закрытому контенту подпишитесь на канал @markmakemoney.',
        '',
        'Если вы администратор, используйте /admin для входа в панель управления.',
      ].join('\n');

      await sendBotMessage(botToken, chatId, text, { reply_markup: keyboard });
      break;
    }

    case 'admin': {
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
        'В панели администратора доступно:',
        '\u2022 Управление турами, услугами, блогом',
        '\u2022 Статистика и пользователи',
        '\u2022 Экспорт данных',
        '',
        'Нажмите кнопку ниже, чтобы открыть.',
      ].join('\n');

      await sendBotMessage(botToken, chatId, text, { reply_markup: adminKeyboard });
      break;
    }

    case 'link': {
      if (!args) {
        await sendBotMessage(botToken, chatId, 'Используйте: /link <код из панели администратора>');
        return;
      }

      const { data: linkCode, error: findError } = await db
        .from('telegram_link_codes')
        .select('id, admin_id, expires_at, used_at')
        .eq('code', args.toUpperCase())
        .maybeSingle();

      if (findError || !linkCode) {
        await sendBotMessage(botToken, chatId, '\u274C Код не найден. Проверьте правильность ввода.');
        return;
      }

      if (linkCode.used_at) {
        await sendBotMessage(botToken, chatId, '\u274C Этот код уже использован.');
        return;
      }

      if (new Date(linkCode.expires_at) < new Date()) {
        await sendBotMessage(botToken, chatId, '\u274C Код истек. Сгенерируйте новый в панели администратора.');
        return;
      }

      const { error: linkError } = await db
        .from('admins')
        .update({ telegram_id: userId })
        .eq('id', linkCode.admin_id);

      if (linkError) {
        await sendBotMessage(botToken, chatId, '\u274C Ошибка привязки. Попробуйте позже.');
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
      break;
    }
  }
}