import { describe, it, expect, vi, beforeEach } from 'vitest';
import { translateText, translateLocalizedFields } from '../lib/translate.js';

vi.mock('@vitalets/google-translate-api', () => ({
  translate: vi.fn(),
}));

import { translate } from '@vitalets/google-translate-api';

const mockTranslate = vi.mocked(translate);

describe('translateText', () => {
  it('returns empty string for empty input', async () => {
    expect(await translateText('', 'kk')).toBe('');
    expect(await translateText('  ', 'kk')).toBe('');
  });

  it('calls google translate API for non-empty input', async () => {
    mockTranslate.mockResolvedValueOnce({ text: 'Сәлем', raw: {} } as any);
    const result = await translateText('Привет', 'kk');
    expect(translate).toHaveBeenCalledWith('Привет', { to: 'kk' });
    expect(result).toBe('Сәлем');
  });

  it('returns original text on translate failure', async () => {
    mockTranslate.mockRejectedValueOnce(new Error('Network error'));
    const result = await translateText('Привет', 'kk');
    expect(result).toBe('Привет');
  });
});

describe('translateLocalizedFields', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockTranslate.mockImplementation(async (...args: any[]): Promise<any> => ({
      text: `[${args[1].to}]${args[0]}`,
      raw: {},
    }));
  });

  it('fills missing kk, uz, ky, uk from ru', async () => {
    const data: Record<string, Record<string, string>> = {
      title: { ru: 'Привет', en: 'Hello' },
      description: { ru: 'Описание', en: 'Description' },
    };

    await translateLocalizedFields(data, ['title', 'description']);

    const t = data['title']!;
    expect(t.kk).toBe('[kk]Привет');
    expect(t.uz).toBe('[uz]Привет');
    expect(t.ky).toBe('[ky]Привет');
    expect(t.uk).toBe('[uk]Привет');

    const d = data['description']!;
    expect(d.kk).toBe('[kk]Описание');
    expect(d.uz).toBe('[uz]Описание');
    expect(d.ky).toBe('[ky]Описание');
    expect(d.uk).toBe('[uk]Описание');

    expect(translate).toHaveBeenCalledTimes(8);
  });

  it('skips already-filled locale fields', async () => {
    const data: Record<string, Record<string, string>> = {
      title: { ru: 'Привет', en: 'Hello', kk: 'Сәлем' },
    };

    await translateLocalizedFields(data, ['title']);

    expect(data['title']!.kk).toBe('Сәлем');
    expect(mockTranslate.mock.calls.length).toBe(3);
  });

  it('skips field when ru is missing', async () => {
    const data: Record<string, Record<string, string>> = {
      title: { en: 'Hello' },
    };

    await translateLocalizedFields(data, ['title']);

    expect(translate).not.toHaveBeenCalled();
    expect(data['title']!.kk).toBeUndefined();
  });

  it('handles empty localizedFieldNames array', async () => {
    const data: Record<string, Record<string, string>> = { title: { ru: 'Привет', en: 'Hello' } };

    await translateLocalizedFields(data, []);

    expect(translate).not.toHaveBeenCalled();
  });

  it('fills empty locale values (whitespace considered empty)', async () => {
    const data: Record<string, Record<string, string>> = {
      title: { ru: 'Привет', en: 'Hello', kk: '   ', uz: '' },
    };

    await translateLocalizedFields(data, ['title']);

    expect(data['title']!.kk).toBe('[kk]Привет');
    expect(data['title']!.uz).toBe('[uz]Привет');
    expect(translate).toHaveBeenCalledTimes(4);
  });

  it('does not modify fields outside localizedFieldNames', async () => {
    const data: any = {
      title: { ru: 'Привет', en: 'Hello' },
      price: 100,
      tags: ['vip'],
    };

    await translateLocalizedFields(data, ['title']);

    expect(data.price).toBe(100);
    expect(data.tags).toEqual(['vip']);
    expect(translate).toHaveBeenCalledTimes(4);
  });

  it('skips field when ru is empty string', async () => {
    const data: Record<string, Record<string, string>> = {
      title: { ru: '', en: 'Hello' },
    };

    await translateLocalizedFields(data, ['title']);

    expect(translate).not.toHaveBeenCalled();
  });
});