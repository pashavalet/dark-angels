import crypto from 'node:crypto';

export function validateInitData(initData: string, botToken: string): boolean {
  if (!initData || !botToken) return false;

  const params = new URLSearchParams(initData);
  const hash = params.get('hash');
  if (!hash) return false;

  params.delete('hash');

  const dataCheckString = Array.from(params.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join('\n');

  const secretKey = crypto
    .createHmac('sha256', 'WebAppData')
    .update(botToken)
    .digest();

  const calculatedHash = crypto
    .createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex');

  return calculatedHash === hash;
}

export async function checkChannelSubscription(
  botToken: string,
  chatId: string,
  userId: number,
): Promise<boolean> {
  if (!botToken) return false;

  try {
    const url = `https://api.telegram.org/bot${botToken}/getChatMember?chat_id=${encodeURIComponent(chatId)}&user_id=${userId}`;
    const res = await fetch(url);
    const json = await res.json() as { ok: boolean; result?: { status: string }; description?: string };

    if (!json.ok) {
      console.warn('getChatMember error:', json.description);
      return false;
    }

    const status = json.result?.status;
    return status === 'member' || status === 'administrator' || status === 'creator';
  } catch (err) {
    console.error('getChatMember failed:', err);
    return false;
  }
}

export function parseInitDataUser(initData: string): { id: number; first_name?: string; last_name?: string; username?: string; language_code?: string; is_premium?: boolean } | null {
  try {
    const params = new URLSearchParams(initData);
    const userStr = params.get('user');
    if (!userStr) return null;
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}