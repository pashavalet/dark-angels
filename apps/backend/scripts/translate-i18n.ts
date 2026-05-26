import { readFileSync, writeFileSync } from 'fs';
import { translate } from '@vitalets/google-translate-api';

const i18nPath = new URL('../../frontend/src/i18n/index.ts', import.meta.url).pathname;

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function findLocaleSection(content: string, locale: string): { start: number; end: number } {
  const marker = `${locale}: {`;
  const start = content.indexOf(marker);
  if (start === -1) throw new Error(`Locale "${locale}" not found`);
  // Find the matching closing brace for the locale block
  let depth = 0;
  let i = start;
  for (; i < content.length; i++) {
    if (content[i] === '{') depth++;
    if (content[i] === '}') {
      depth--;
      if (depth === 0) break;
    }
  }
  return { start, end: i + 1 };
}

async function main() {
  let content = readFileSync(i18nPath, 'utf-8');

  // Extract ru values
  const ruSection = findLocaleSection(content, 'ru');
  const ruBlock = content.slice(ruSection.start, ruSection.end);

  const kvRegex = /^\s+(\w+):\s*'((?:[^'\\]|\\.)*)',\s*$/gm;
  const entries: { key: string; value: string }[] = [];
  let m;
  while ((m = kvRegex.exec(ruBlock)) !== null) {
    entries.push({ key: m[1], value: m[2] });
  }

  console.log(`Found ${entries.length} keys. Translating to kk, uz, ky, uk...`);

  const langs = ['kk', 'uz', 'ky', 'uk'];

  // Translate all ru values to all 4 langs
  const translated: Record<string, Record<string, string>> = {};
  let done = 0;
  const total = entries.length * langs.length;

  for (const lang of langs) {
    translated[lang] = {};
    for (const entry of entries) {
      try {
        const result = await translate(entry.value, { to: lang });
        translated[lang][entry.key] = result.text.replace(/'/g, "\\'");
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error(`  FAIL ${lang}:${entry.key} — ${msg}`);
        translated[lang][entry.key] = entry.value.replace(/'/g, "\\'");
      }
      done++;
      if (done % 30 === 0) console.log(`  ${done}/${total}`);
      await delay(120);
    }
  }

  // Replace values in each locale section
  for (const lang of langs) {
    const section = findLocaleSection(content, lang);
    let block = content.slice(section.start, section.end);

    for (const entry of entries) {
      const escapedVal = entry.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const lineRx = new RegExp(
        `(\\s+${entry.key}:\\s*)'${escapedVal}'`,
        'g',
      );
      block = block.replace(lineRx, `$1'${translated[lang][entry.key]}'`);
    }

    content = content.slice(0, section.start) + block + content.slice(section.end);
  }

  writeFileSync(i18nPath, content, 'utf-8');
  console.log('Done!');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
