#!/usr/bin/env python3
"""Fix swapped locale sections: kk has Uzbek, uz has Kyrgyz, ky has Ukrainian.
Move: kk→uz (Uzbek), uz→ky (Kyrgyz), ky→uk (Ukrainian).
Translate fresh Kazakh for kk."""
import re
import time
from deep_translator import GoogleTranslator

FILE = 'apps/frontend/src/i18n/index.ts'

with open(FILE) as f:
    c = f.read()

def extract_entries(block: str) -> dict[str, str]:
    pattern = re.compile(r"^(\s+)(\w+):\s*'((?:[^'\\]|\\.)*)',\s*$", re.MULTILINE)
    return {m.group(2): (m.group(1), m.group(3)) for m in pattern.finditer(block)}

def build_common_block(entries: dict[str, tuple[str, str]], values: dict[str, str]) -> str:
    lines = []
    for key, (indent, orig) in entries.items():
        val = values.get(key, orig)
        lines.append(f"{indent}{key}: '{val}',")
    return '\n'.join(lines) + '\n'

# Find locale blocks
def find_block(content: str, start: int) -> tuple[int, int]:
    depth = 0
    i = start
    while i < len(content):
        if content[i] == '{': depth += 1
        elif content[i] == '}':
            depth -= 1
            if depth == 0: return start, i + 1
        i += 1
    raise ValueError('Unmatched braces')

locale_re = re.compile(r'^\s+(kk|uz|ky|uk|ru): \{', re.MULTILINE)
res_body_start = c.index('resources: {')
res_body_end = find_block(c, c.index('{', res_body_start))[1]

blocks = {}
m = locale_re.search(c, res_body_start, res_body_end)
while m:
    locale = m.group(1)
    block_start, block_end = find_block(c, m.start())
    blocks[locale] = c[block_start:block_end]
    m = locale_re.search(c, m.end(), res_body_end)

# Extract entries from each locale
entries = {}
for l in blocks:
    entries[l] = extract_entries(blocks[l])

# Build value dicts
uz_values = {k: v for k, (indent, v) in entries['kk'].items()}   # kk has Uzbek
ky_values = {k: v for k, (indent, v) in entries['uz'].items()}   # uz has Kyrgyz
uk_values = {k: v for k, (indent, v) in entries['ky'].items()}   # ky has Ukrainian

# Translate kk from ru
print("Translating kk from ru...")
translator = GoogleTranslator(source='ru', target='kk')
kk_values = {}
ru_entries = entries['ru']
for idx, (key, (indent, value)) in enumerate(ru_entries.items()):
    if not value.strip():
        kk_values[key] = value
        continue
    try:
        result = translator.translate(value)
        kk_values[key] = result.replace("'", "\\'")
    except Exception as e:
        print(f"  FAIL kk:{key} — {e}, using ru")
        kk_values[key] = value
    time.sleep(0.2)
    if (idx + 1) % 20 == 0:
        print(f"  {idx+1}/{len(ru_entries)} done")

# Rebuild locale blocks
new_locale_blocks = {
    'kk': build_common_block(entries['ru'], kk_values),
    'uz': build_common_block(entries['ru'], uz_values),
    'ky': build_common_block(entries['ru'], ky_values),
    'uk': build_common_block(entries['ru'], uk_values),
}

# Replace in file — process reverse order so positions stay valid
for lang in ['uk', 'ky', 'uz', 'kk']:
    old_block = blocks[lang]
    common_start = old_block.index('common: {')
    common_body_start = old_block.index('{', common_start)
    _, common_body_end = find_block(old_block, common_body_start)
    new_block = (
        old_block[:common_body_start + 1]  # include '{'
        + '\n'
        + new_locale_blocks[lang]
        + old_block[common_body_end:]
    )
    c = c[:blocks[lang]] + new_block + c[blocks[lang]:blocks[lang]+len(old_block)]
    # Update subsequent block positions
    offset = len(new_block) - len(old_block)
    for l2 in ['uk', 'ky', 'uz', 'kk']:
        if blocks[l2][0] > blocks[lang][0]:
            # This doesn't work cleanly, let me just do positional tracking
            pass

# Actually, simpler approach: build new resources body from scratch
print("Rebuilding file...")
# Use template: ru block layout with values per locale
with open(FILE) as f:
    original = f.read()

prefix = original[:res_body_start]
suffix = original[res_body_end:]

# Build each locale's section
locale_indent = '      '
common_indent = locale_indent + '  '
key_indent = common_indent + '  '

parts = [prefix]

# Need original en + ru blocks too
for l in ['en', 'ru']:
    block = blocks[l]
    parts.append(block)
    parts.append(',\n')

for l in ['kk', 'uz', 'ky', 'uk']:
    new_body = new_locale_blocks[l]
    # Count indent from locale block
    block_start = blocks[l][0]
    block_text = blocks[l]
    parts.append(block_text[:block_text.index('common: {')] + 'common: {\n')
    parts.append(new_body)
    # closing
    parts.append(locale_indent + '},\n')

# Actually, this is getting complex. Let me just take the original ru section
# and replace key values.

# SIMPLEST approach: read the ru section, one locale at a time, replace values
print("Using direct file replacement...")
for lang in ['kk', 'uz', 'ky', 'uk']:
    # Find this locale in the CURRENT content
    lm = locale_re.search(original, res_body_start, res_body_end)
    while lm:
        locale = lm.group(1)
        if locale == lang:
            block_start, block_end = find_block(original, lm.start())
            old_block = original[block_start:block_end]
            common_start = old_block.index('common: {')
            common_body_start = old_block.index('{', common_start)
            _, common_body_end = find_block(old_block, common_body_start)
            new_block = (
                old_block[:common_body_start + 1]
                + '\n'
                + new_locale_blocks[lang]
                + old_block[common_body_end:]
            )
            original = original[:block_start] + new_block + original[block_end:]
            break
        lm = locale_re.search(original, lm.end(), res_body_end)

with open(FILE, 'w') as f:
    f.write(original)

print("Done!")
