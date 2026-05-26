#!/usr/bin/env python3
import re
import time
from deep_translator import GoogleTranslator

FILE = 'apps/frontend/src/i18n/index.ts'
TARGET_LANGS = ['kk', 'uz', 'ky', 'uk']


def find_block(content: str, start: int) -> tuple[int, int]:
    """Find matching brace block from start position. Returns (start, end)."""
    depth = 0
    i = start
    while i < len(content):
        if content[i] == '{':
            depth += 1
        elif content[i] == '}':
            depth -= 1
            if depth == 0:
                return start, i + 1
        i += 1
    raise ValueError('Unmatched braces')


def extract_entries(block: str) -> list[tuple[str, str, str]]:
    """Extract (indent, key, value) from a common block."""
    pattern = re.compile(r"^(\s+)(\w+):\s*'((?:[^'\\]|\\.)*)',\s*$", re.MULTILINE)
    return [(m.group(1), m.group(2), m.group(3)) for m in pattern.finditer(block)]


def build_common_block(entries: list[tuple[str, str, str]], values: dict[str, str]) -> str:
    lines = []
    for indent, key, orig in entries:
        val = values.get(key, orig)
        lines.append(f"{indent}{key}: '{val}',")
    return '\n'.join(lines) + '\n'


def main():
    with open(FILE, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find resources block
    res_start = content.index('resources: {')
    res_body_start = content.index('{', res_start)
    res_body_end = find_block(content, res_body_start)[1]
    prefix = content[:res_start]
    suffix = content[res_body_end:]

    # Extract each locale block from resources body
    locale_start_re = re.compile(r'^\s+(kk|uz|ky|uk|en|ru): \{', re.MULTILINE)

    # Find ru entries
    ru_m = locale_start_re.search(content, res_body_start, res_body_end)
    ru_block = None
    while ru_m:
        locale = ru_m.group(1)
        block_start, block_end = find_block(content, ru_m.start())
        if locale == 'ru':
            ru_block = content[block_start:block_end]
            break
        # Find next locale
        ru_m = locale_start_re.search(content, ru_m.end(), res_body_end)

    if not ru_block:
        print("ERROR: ru block not found")
        return

    ru_entries = extract_entries(ru_block)
    print(f"Found {len(ru_entries)} keys")

    # Translate to each target language
    for lang in TARGET_LANGS:
        print(f"\nTranslating to {lang}...")
        translator = GoogleTranslator(source='ru', target=lang)
        lang_values = {}
        for idx, (indent, key, value) in enumerate(ru_entries):
            if not value.strip():
                lang_values[key] = value
                continue
            try:
                result = translator.translate(value)
                lang_values[key] = result.replace("'", "\\'")
                if (idx + 1) % 10 == 0:
                    print(f"  {idx+1}/{len(ru_entries)} done")
            except Exception as e:
                print(f"  FAIL {lang}:{key} — {e}, using ru")
                lang_values[key] = value
            time.sleep(0.2)

        # Build new common block for this locale
        new_common = build_common_block(ru_entries, lang_values)

        # Find this locale in content and replace
        lm = locale_start_re.search(content, res_body_start, res_body_end)
        while lm:
            locale = lm.group(1)
            block_start, block_end = find_block(content, lm.start())
            if locale == lang:
                old_block = content[block_start:block_end]
                # Within this locale block, find `common: { ... }`
                common_start = old_block.index('common: {')
                common_body_start = old_block.index('{', common_start)
                _, common_body_end = find_block(old_block, common_body_start)
                new_block = (
                    old_block[:common_body_start]
                    + '\n'
                    + new_common
                    + old_block[common_body_end:]
                )
                content = content[:block_start] + new_block + content[block_end:]
                print(f"  Updated {lang} in file")
                break
            lm = locale_start_re.search(content, lm.end(), res_body_end)

    with open(FILE, 'w', encoding='utf-8') as f:
        f.write(content)

    print("\nDone! All translations written to", FILE)


if __name__ == '__main__':
    main()
