export type SupportedLocale = 'ru' | 'en' | 'kk' | 'uz' | 'ky' | 'uk';

export interface LocalizedString {
  ru: string;
  en: string;
  kk?: string;
  uz?: string;
  ky?: string;
  uk?: string;
}

export function getLocalizedValue(obj: LocalizedString, locale: SupportedLocale): string {
  if (!obj) return '';
  return obj[locale] ?? obj['en'] ?? obj['ru'] ?? Object.values(obj)[0] ?? '';
}
