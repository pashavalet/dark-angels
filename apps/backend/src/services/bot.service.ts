const BOT_API = 'https://api.telegram.org/bot';

type ParseMode = 'HTML' | 'Markdown' | 'MarkdownV2';

interface SendMessageOptions {
  parse_mode?: ParseMode;
  reply_markup?: Record<string, unknown>;
}

export async function sendBotMessage(
  botToken: string,
  chatId: number | string,
  text: string,
  options?: SendMessageOptions,
): Promise<boolean> {
  try {
    const body: Record<string, unknown> = {
      chat_id: chatId,
      text,
    };
    if (options?.parse_mode) body.parse_mode = options.parse_mode;
    if (options?.reply_markup) body.reply_markup = options.reply_markup;

    const res = await fetch(`${BOT_API}${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const json = await res.json() as { ok: boolean };
    return json.ok;
  } catch {
    return false;
  }
}

export async function setBotWebhook(botToken: string, url: string): Promise<boolean> {
  try {
    const res = await fetch(`${BOT_API}${botToken}/setWebhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, drop_pending_updates: true }),
    });
    const json = await res.json() as { ok: boolean; description?: string };
    console.log('setWebhook:', json.ok, json.description);
    return json.ok;
  } catch (err) {
    console.error('setWebhook failed:', err);
    return false;
  }
}

export async function setChatMenuButton(
  botToken: string,
  text: string,
  url: string,
): Promise<boolean> {
  try {
    const res = await fetch(`${BOT_API}${botToken}/setChatMenuButton`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        menu_button: { type: 'web_app', text, web_app: { url } },
      }),
    });
    const json = await res.json() as { ok: boolean; description?: string };
    console.log('setChatMenuButton:', json.ok, json.description);
    return json.ok;
  } catch (err) {
    console.error('setChatMenuButton failed:', err);
    return false;
  }
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