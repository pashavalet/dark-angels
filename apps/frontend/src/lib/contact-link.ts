export interface ContactLink {
  label: string;
  href: string;
}

function normalizeTelegramUsername(value: string): string {
  return value.replace(/^@+/, '').trim();
}

export function parseContactLink(value: string | null | undefined): ContactLink | null {
  const raw = value?.trim();
  if (!raw) return null;

  const markdownMatch = raw.match(/^\[(.+)\]\((.+)\)$/s);
  if (markdownMatch) {
    const label = markdownMatch[1]?.trim();
    const href = markdownMatch[2]?.trim();
    if (label && href) return { label, href };
  }

  const pipeIndex = raw.indexOf('|');
  if (pipeIndex > 0) {
    const label = raw.slice(0, pipeIndex).trim();
    const href = raw.slice(pipeIndex + 1).trim();
    if (label && href) return { label, href };
  }

  if (raw.startsWith('@')) {
    const username = normalizeTelegramUsername(raw);
    if (username) {
      return { label: raw, href: `https://t.me/${username}` };
    }
  }

  if (/^(https?:|tg:|mailto:)/i.test(raw)) {
    return { label: raw, href: raw };
  }

  return null;
}
