import { translate } from '@vitalets/google-translate-api';

const TARGET_LANGS = ['kk', 'uz', 'ky', 'uk'] as const;

export async function translateText(text: string, targetLang: string): Promise<string> {
  if (!text || text.trim() === '') return '';
  try {
    const result = await translate(text, { to: targetLang });
    return result.text;
  } catch {
    return '';
  }
}

function getLangsToTranslate(obj: Record<string, string>): string[] {
  const langs: string[] = [];
  if (!obj.en || obj.en.trim() === '') langs.push('en');
  for (const l of TARGET_LANGS) {
    if (!obj[l] || obj[l].trim() === '') langs.push(l);
  }
  return langs;
}

export async function translateLocalizedFields(
  data: Record<string, unknown>,
  localizedFieldNames: string[],
): Promise<void> {
  for (const fieldName of localizedFieldNames) {
    const obj = data[fieldName] as Record<string, string> | undefined;
    if (!obj || !obj.ru) continue;

    const langs = getLangsToTranslate(obj);
    for (const lang of langs) {
      const translated = await translateText(obj.ru, lang);
      if (translated) {
        obj[lang] = translated;
      }
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
  }
}
