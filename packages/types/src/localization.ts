export type SupportedLocale = 'ru' | 'en';

export interface LocalizedString {
  ru: string;
  en: string;
  [key: string]: string;
}

export function getLocalizedValue(obj: LocalizedString, locale: SupportedLocale): string {
  if (!obj) return '';
  return obj[locale] ?? obj['en'] ?? Object.values(obj)[0] ?? '';
}
