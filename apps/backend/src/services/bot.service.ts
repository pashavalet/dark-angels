const BOT_API = 'https://api.telegram.org/bot';

type ParseMode = 'HTML' | 'Markdown' | 'MarkdownV2';

interface SendMessageOptions {
  parse_mode?: ParseMode;
  reply_markup?: Record<string, unknown>;
}

interface TelegramUpdate {
  update_id: number;
  message?: {
    chat: { id: number };
    from?: { id: number };
    text?: string;
  };
  callback_query?: unknown;
}

async function callBotApi<T>(botToken: string, method: string, body?: Record<string, unknown>): Promise<{ ok: boolean; result?: T; description?: string }> {
  try {
    const res = await fetch(`${BOT_API}${botToken}/${method}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    });
    return await res.json() as { ok: boolean; result?: T; description?: string };
  } catch (err) {
    console.error(`bot API ${method} failed:`, err);
    return { ok: false, description: String(err) };
  }
}

export async function sendBotMessage(
  botToken: string,
  chatId: number | string,
  text: string,
  options?: SendMessageOptions,
): Promise<boolean> {
  const body: Record<string, unknown> = { chat_id: chatId, text };
  if (options?.parse_mode) body.parse_mode = options.parse_mode;
  if (options?.reply_markup) body.reply_markup = options.reply_markup;

  const res = await callBotApi(botToken, 'sendMessage', body);
  if (!res.ok) console.error('sendMessage failed:', res.description);
  return res.ok;
}

export async function setChatMenuButton(botToken: string, text: string, url: string): Promise<boolean> {
  const res = await callBotApi(botToken, 'setChatMenuButton', {
    menu_button: { type: 'web_app', text, web_app: { url } },
  });
  console.log('setChatMenuButton:', res.ok, res.description);
  return res.ok;
}

export async function setMyCommands(botToken: string): Promise<boolean> {
  const res = await callBotApi(botToken, 'setMyCommands', {
    commands: [
      { command: 'start', description: '🚀 Открыть Mini App' },
      { command: 'admin', description: '🔒 Панель администратора' },
    ],
  });
  console.log('setMyCommands:', res.ok, res.description);
  return res.ok;
}

export async function getUpdates(botToken: string, offset: number): Promise<TelegramUpdate[]> {
  const url = `${BOT_API}${botToken}/getUpdates?offset=${offset}&timeout=25&allowed_updates=["message"]`;
  try {
    const res = await fetch(url);
    const json = await res.json() as { ok: boolean; result?: TelegramUpdate[] };
    if (json.ok && json.result) return json.result;
    return [];
  } catch (err) {
    console.error('getUpdates error:', err);
    return [];
  }
}

export async function initBot(botToken: string, miniAppUrl: string): Promise<void> {
  console.log('initBot: miniAppUrl=', miniAppUrl, 'token=', botToken.substring(0, 10) + '...');
  await setChatMenuButton(botToken, '\uD83E\uDD8A Dark Angels', miniAppUrl);
  await setMyCommands(botToken);
  console.log('initBot complete');
}

export function makeWebAppKeyboard(text: string, url: string) {
  return {
    keyboard: [[{ text, web_app: { url } }]],
    resize_keyboard: true,
    one_time_keyboard: false,
  };
}

export function makeRemoveKeyboard() {
  return { remove_keyboard: true };
}

export function parseBotCommand(text: string | undefined): { command: string; args: string } {
  if (!text) return { command: '', args: '' };
  const match = text.match(/^\/(\w+)(?:@\w+)?(?:\s+(.*))?$/s);
  if (!match) return { command: '', args: '' };
  return { command: match[1]!.toLowerCase(), args: (match[2] ?? '').trim() };
}