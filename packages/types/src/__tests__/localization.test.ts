import { describe, it, expect } from 'vitest';
import { getLocalizedValue, type LocalizedString, type SupportedLocale } from '../localization.js';

describe('getLocalizedValue', () => {
  const obj: LocalizedString = { ru: 'Привет', en: 'Hello' };

  it('returns requested locale', () => {
    expect(getLocalizedValue(obj, 'ru')).toBe('Привет');
  });

  it('falls back to en when locale missing', () => {
    expect(getLocalizedValue(obj, 'fr' as SupportedLocale)).toBe('Hello');
  });

  it('falls back to first value when en missing', () => {
    const o = { ru: 'Привет' } as LocalizedString;
    expect(getLocalizedValue(o, 'de' as SupportedLocale)).toBe('Привет');
  });

  it('returns empty string for undefined', () => {
    expect(getLocalizedValue(undefined as unknown as LocalizedString, 'en')).toBe('');
  });
});
