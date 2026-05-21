import type { LocalizedString } from '@dark-angels/types';
import { useLocaleStore } from '../stores/locale.js';

export function useLocalized(obj: LocalizedString | undefined): string {
  const { locale } = useLocaleStore();
  if (!obj) return '';
  return obj[locale] ?? obj['en'] ?? Object.values(obj)[0] ?? '';
}
