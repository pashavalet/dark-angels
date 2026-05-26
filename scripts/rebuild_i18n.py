#!/usr/bin/env python3
import re
import time
from deep_translator import GoogleTranslator

FILE = 'apps/frontend/src/i18n/index.ts'

with open(FILE) as f:
    content = f.read()

# Find resources block boundaries
res_start = content.index('resources: {')
res_brace = content.index('{', res_start)
depth, i = 0, res_brace
while i < len(content):
    if content[i] == '{': depth += 1
    elif content[i] == '}':
        depth -= 1
        if depth == 0: break
    i += 1
res_end = i + 1

prefix = content[:res_start]
suffix = content[res_end:]

# Parse locale blocks
locale_re = re.compile(r'^\s+(en|ru|kk|uz|ky|uk): \{', re.MULTILINE)
locale_common_re = re.compile(r'common: \{')

blocks = {}
m = locale_re.search(content, res_brace, res_end)
while m:
    loc = m.group(1)
    bs, be = m.start(), m.end()
    depth, i = 0, bs
    while i < len(content) and i < res_end:
        if content[i] == '{': depth += 1
        elif content[i] == '}':
            depth -= 1
            if depth == 0: break
        i += 1
    blocks[loc] = content[bs:i+1]
    m = locale_re.search(content, m.end(), res_end)

# Extract ordered keys from ru
ru_block = blocks['ru']
ru_cm = locale_common_re.search(ru_block)
ru_brace = ru_block.index('{', ru_cm.start())
depth, i = 0, ru_brace
while i < len(ru_block):
    if ru_block[i] == '{': depth += 1
    elif ru_block[i] == '}':
        depth -= 1
        if depth == 0: break
    i += 1
ru_common_body = ru_block[ru_brace + 1:i]

key_pattern = re.compile(r"^\s+(\w+):\s*'((?:[^'\\]|\\.)*)',\s*$", re.MULTILINE)
keys = [(m.group(1), m.group(2)) for m in key_pattern.finditer(ru_common_body)]

print(f"Found {len(keys)} keys")

# Determine indentation
lines = ru_common_body.split('\n')
first_key_line = next((l for l in lines if l.strip() and not l.strip() == '}'), None)
key_indent = re.match(r'^\s*', first_key_line).group() if first_key_line else '          '

# Build locale block template
def make_locale_block(locale: str, key_indent: str, key_vals: list) -> str:
    entries = '\n'.join(f"{key_indent}{k}: '{v}'," for k, v in key_vals)
    return (
        f"      {locale}: {{\n"
        f"        common: {{\n"
        f"{entries}\n"
        f"        }},\n"
        f"      }},"
    )

# Keep original en, ru
def extract_vals(locale: str) -> list:
    block = blocks[locale]
    cm = locale_common_re.search(block)
    brace = block.index('{', cm.start())
    depth, i = 0, brace
    while i < len(block):
        if block[i] == '{': depth += 1
        elif block[i] == '}':
            depth -= 1
            if depth == 0: break
        i += 1
    body = block[brace:i]
    return [(m.group(1), m.group(2)) for m in key_pattern.finditer(body)]

en_vals = extract_vals('en')
ru_vals = keys

# Build en + ru from original
en_block = make_locale_block('en', key_indent, en_vals)
ru_block = make_locale_block('ru', key_indent, ru_vals)

# Translate and build new locale blocks
new_blocks = {}
for lang in ['kk', 'uz', 'ky', 'uk']:
    print(f"Translating to {lang}...")
    t = GoogleTranslator(source='ru', target=lang)
    lang_vals = []
    for idx, (k, v) in enumerate(keys):
        if not v.strip():
            lang_vals.append((k, v))
            continue
        try:
            r = t.translate(v)
            lang_vals.append((k, r.replace("'", "\\'")))
        except Exception as e:
            print(f"  FAIL {lang}:{k} — {e}")
            lang_vals.append((k, v))
        time.sleep(0.25)
        if (idx + 1) % 30 == 0:
            print(f"  {idx+1}/{len(keys)} done")
    new_blocks[lang] = make_locale_block(lang, key_indent, lang_vals)

# Assemble
res_body = (
    "resources: {\n"
    f"{en_block}\n"
    f"{ru_block}\n"
    f"{new_blocks['kk']}\n"
    f"{new_blocks['uz']}\n"
    f"{new_blocks['ky']}\n"
    f"{new_blocks['uk']}\n"
    + "    },\n"
    + "  });\n"
    + "\n"
    + "export default i18n;\n"
)

new_content = prefix + res_body

with open(FILE, 'w') as f:
    f.write(new_content)

print("\nDone!")
