import { describe, it, expect, vi, beforeEach } from 'vitest';
import { translateText, translateLocalizedFields } from '../lib/translate.js';

vi.mock('@vitalets/google-translate-api', () => ({
  translate: vi.fn(),
}));

import { translate } from '@vitalets/google-translate-api';

describe('translateText', () => {
  it('returns empty string for empty input', async () => {
    expect(await translateText('', 'kk')).toBe('');
    expect(await translateText('  ', 'kk')).toBe('');
  });

  it('calls google translate API for non-empty input', async () => {
    vi.mocked(translate).mockResolvedValueOnce({ text: 'Сәлем', raw: {} } as any);
    const result = await translateText('Привет', 'kk');
    expect(translate).toHaveBeenCalledWith('Привет', { to: 'kk' });
    expect(result).toBe('Сәлем');
  });

  it('returns original text on translate failure', async () => {
    vi.mocked(translate).mockRejectedValueOnce(new Error('Network error'));
    const result = await translateText('Привет', 'kk');
    expect(result).toBe('Привет');
  });
});

describe('translateLocalizedFields', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(translate).mockImplementation(async (text: string, opts: { to: string }) => ({
      text: `[${opts.to}]${text}`,
      raw: {},
    } as any));
  });

  it('fills missing kk, uz, ky, uk from ru', async () => {
    const data = {
      title: { ru: 'Привет', en: 'Hello' },
      description: { ru: 'Описание', en: 'Description' },
    };

    await translateLocalizedFields(data, ['title', 'description']);

    for (const field of ['title', 'description']) {
      const obj = data[field] as Record<string, string>;
      const ruText = obj.ru;
      expect(obj.kk).toBe(`[kk]${ruText}`);
      expect(obj.uz).toBe(`[uz]${ruText}`);
      expect(obj.ky).toBe(`[ky]${ruText}`);
      expect(obj.uk).toBe(`[uk]${ruText}`);
    }

    expect(translate).toHaveBeenCalledTimes(8); // 2 fields × 4 langs
  });

  it('skips already-filled locale fields', async () => {
    const data = {
      title: { ru: 'Привет', en: 'Hello', kk: 'Сәлем' },
    };

    await translateLocalizedFields(data, ['title']);

    expect(data.title.kk).toBe('Сәлем'); // kept original
    expect(vi.mocked(translate).mock.calls.length).toBe(3); // only uz, ky, uk
  });

  it('skips field when ru is missing', async () => {
    const data = {
      title: { en: 'Hello' },
    };

    await translateLocalizedFields(data, ['title']);

    expect(translate).not.toHaveBeenCalled();
    const obj = data.title as Record<string, string>;
    expect(obj.kk).toBeUndefined();
  });

  it('handles empty localizedFieldNames array', async () => {
    const data = { title: { ru: 'Привет', en: 'Hello' } };

    await translateLocalizedFields(data, []);

    expect(translate).not.toHaveBeenCalled();
  });

  it('fills only truly empty locale values (whitespace considered empty)', async () => {
    const data = {
      title: { ru: 'Привет', en: 'Hello', kk: '   ', uz: '' },
    };

    await translateLocalizedFields(data, ['title']);

    expect(data.title.kk).toBe('[kk]Привет'); // whitespace filled
    expect(data.title.uz).toBe('[uz]Привет'); // empty filled
    expect(translate).toHaveBeenCalledTimes(4); // kk, uz, ky, uk all filled
  });

  it('does not modify fields outside localizedFieldNames', async () => {
    const data = {
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
    const data = {
      title: { ru: '', en: 'Hello' },
    };

    await translateLocalizedFields(data, ['title']);

    expect(translate).not.toHaveBeenCalled();
  });
});