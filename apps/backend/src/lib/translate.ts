import { translate } from '@vitalets/google-translate-api';

const TARGET_LANGS = ['kk', 'uz', 'ky', 'uk'] as const;

export async function translateText(text: string, targetLang: string): Promise<string> {
  if (!text || text.trim() === '') return '';
  try {
    const result = await translate(text, { to: targetLang });
    return result.text;
  } catch {
    return text;
  }
}

export async function translateLocalizedFields(
  data: Record<string, unknown>,
  localizedFieldNames: string[],
): Promise<void> {
  for (const fieldName of localizedFieldNames) {
    const obj = data[fieldName] as Record<string, string> | undefined;
    if (!obj || !obj.ru) continue;

    for (const lang of TARGET_LANGS) {
      if (!obj[lang] || obj[lang].trim() === '') {
        obj[lang] = await translateText(obj.ru, lang);
        await new Promise((resolve) => setTimeout(resolve, 200));
      }
    }
  }
}
