#!/usr/bin/env python3
"""Migrate existing DB content: translate ru→kk/uz/ky/uk for all records."""
import json
import time
from deep_translator import GoogleTranslator

LANGS = ['kk', 'uz', 'ky', 'uk']

# Data from Supabase — tours, services, blog_articles
TOURS = [
    {
        "id": "a0000000-0000-0000-0000-000000000001",
        "fields": {
            "title": {"en": "Paris Tour", "ru": "Тур в Париж"},
            "description": {"en": "Exclusive Paris tour with 5-star hotel accommodation. Includes personal guide, limousine and VIP access to private events.", "ru": "Эксклюзивный тур в Париж с проживанием в 5-звёздочном отеле. Включает персонального гида, лимузин и VIP-доступ к закрытым мероприятиям."},
            "country": {"en": "France", "ru": "Франция"},
            "city": {"en": "Paris", "ru": "Париж"},
            "agency": {"en": "Dark Angels Paris", "ru": "Dark Angels Paris"},
        }
    },
    {
        "id": "a0000000-0000-0000-0000-000000000002",
        "fields": {
            "title": {"en": "Dubai Tour", "ru": "Тур в Дубай"},
            "description": {"en": "Luxury Dubai tour with personal driver and Burj Al Arab stay. Shopping with personal stylist, yacht, helicopter tour.", "ru": "Роскошный тур в Дубай с персональным водителем и проживанием в Burj Al Arab. Шопинг с личным стилистом, яхта, вертолётная экскурсия."},
            "country": {"en": "UAE", "ru": "ОАЭ"},
            "city": {"en": "Dubai", "ru": "Дубай"},
            "agency": {"en": "Dark Angels Dubai", "ru": "Dark Angels Dubai"},
        }
    },
    {
        "id": "a0000000-0000-0000-0000-000000000003",
        "fields": {
            "title": {"en": "Barcelona Tour", "ru": "Тур в Барселону"},
            "description": {"en": "Elite Barcelona tour. Private villa with pool, yacht rental, exclusive club access, personal chef.", "ru": "Элитный тур в Барселону. Частная вилла с бассейном, аренда яхты, доступ в закрытые клубы, персональный шеф-повар."},
            "country": {"en": "Spain", "ru": "Испания"},
            "city": {"en": "Barcelona", "ru": "Барселона"},
            "agency": {"en": "Dark Angels Barcelona", "ru": "Dark Angels Barcelona"},
        }
    },
]

SERVICES = [
    {
        "id": "b0000000-0000-0000-0000-000000000001",
        "fields": {
            "title": {"en": "VIP Companion", "ru": "VIP-сопровождение"},
            "description": {"en": "Elite companion service for business events, dinners and social receptions. Education, etiquette knowledge, foreign languages.", "ru": "Элитное сопровождение для деловых мероприятий, ужинов и светских приёмов. Образование, знание этикета, иностранные языки."},
        }
    },
    {
        "id": "b0000000-0000-0000-0000-000000000002",
        "fields": {
            "title": {"en": "Travel Companion", "ru": "Путешествия с компаньонкой"},
            "description": {"en": "Personal travel with a companion. Any destination, full organization, confidentiality.", "ru": "Индивидуальные путешествия с персональной компаньонкой. Любое направление, полная организация, конфиденциальность."},
        }
    },
    {
        "id": "b0000000-0000-0000-0000-000000000003",
        "fields": {
            "title": {"en": "Event Escort", "ru": "Эскорт на мероприятия"},
            "description": {"en": "Professional escort for red carpets, premieres, private parties. Stylist and makeup artist included.", "ru": "Профессиональный эскорт на красные дорожки, премьеры, закрытые вечеринки. Стилист и визажист включены."},
        }
    },
]

BLOG = [
    {
        "id": "c0000000-0000-0000-0000-000000000001",
        "fields": {
            "title": {"en": "How to Choose a VIP Tour", "ru": "Как выбрать VIP-тур"},
            "content": {"en": "# How to Choose a VIP Tour\n\nChoosing the right tour is an art. **Here are some criteria:**\n\n1. Agency reputation\n2. Privacy level\n3. Accommodation quality\n\n> «Travel is the only thing you buy that makes you richer.»\n\nContact us for a consultation.", "ru": "# Как выбрать VIP-тур\n\nВыбор правильного тура — это искусство. **Вот несколько критериев:**\n\n1. Репутация агентства\n2. Уровень конфиденциальности\n3. Качество размещения\n\n> «Путешествие — единственная вещь, покупая которую, становишься богаче.»\n\nСвяжитесь с нами для консультации."},
        }
    },
    {
        "id": "c0000000-0000-0000-0000-000000000002",
        "fields": {
            "title": {"en": "Private Club: Rules", "ru": "Закрытый клуб: правила"},
            "content": {"en": "# Private Club\n\nWelcome to the Dark Angels private club.\n\n## Basic rules:\n\n- Full confidentiality\n- 50% prepayment\n- Identity verification\n\n```\nStatus: VIP\nAccess: premium\n```\n\nContact your manager for more information.", "ru": "# Закрытый клуб\n\nДобро пожаловать в закрытый клуб Dark Angels.\n\n## Базовые правила:\n\n- Полная конфиденциальность\n- Предоплата 50%\n- Верификация личности\n\n```\nСтатус: VIP\nДоступ: премиум\n```\n\nЗа дополнительной информацией обращайтесь к менеджеру."},
        }
    },
    {
        "id": "c0000000-0000-0000-0000-000000000003",
        "fields": {
            "title": {"en": "Travel Fashion & Style", "ru": "Мода и стиль для путешествий"},
            "content": {"en": "# Fashion & Style\n\n## What to pack:\n\n| Type | Recommendation |\n|---|---|\n| Business | Suit, watch |\n| Beach | Linen, hat |\n| Evening | Tuxedo, gown |\n\nStyle is a way to say who you are without having to speak.", "ru": "# Мода и стиль\n\n## Что взять с собой:\n\n| Тип | Рекомендация |\n|---|---|\n| Деловой | Костюм, часы |\n| Пляжный | Лён, шляпа |\n| Вечерний | Смокинг, платье |\n\nСтиль — это способ сказать, кто вы есть, не произнося ни слова."},
        }
    },
]


def translate(text: str, target: str) -> str:
    if not text or not text.strip():
        return text
    try:
        t = GoogleTranslator(source='ru', target=target)
        result = t.translate(text)
        return result if result else text
    except Exception as e:
        print(f"  FAIL ({target}): {e}")
        return text


total_fields = sum(len(r['fields']) for r in TOURS + SERVICES + BLOG)
total_ops = total_fields * len(LANGS)
print(f"Records: {len(TOURS)} tours, {len(SERVICES)} services, {len(BLOG)} blog")
print(f"Fields: {total_fields}, translations: {total_ops}")
print()

# For each record, translate ru→kk/uz/ky/uk
updates = []  # list of (table, id, field, new_json)

all_records = []
for rec in TOURS:
    all_records.append(('tours', rec))
for rec in SERVICES:
    all_records.append(('services', rec))
for rec in BLOG:
    all_records.append(('blog_articles', rec))

done = 0
for table, rec in all_records:
    rid = rec['id']
    fields = rec['fields']
    for field_name, values in fields.items():
        ru_text = values.get('ru', '')
        if not ru_text:
            continue

        new_values = dict(values)  # copy existing en/ru
        for lang in LANGS:
            if lang not in new_values or not new_values[lang]:
                new_values[lang] = translate(ru_text, lang)
                time.sleep(0.3)
            done += 1
            if done % 10 == 0:
                print(f"  {done}/{total_ops}")

        # Escape single quotes for SQL
        sql_val = json.dumps(new_values, ensure_ascii=False).replace("'", "''")
        updates.append(f"UPDATE {table} SET {field_name} = '{sql_val}'::jsonb WHERE id = '{rid}';")

print()
print(f"Generated {len(updates)} SQL statements")
print()

# Write SQL to file
with open('/tmp/migrate_translations.sql', 'w') as f:
    f.write('BEGIN;\n')
    for stmt in updates:
        f.write(stmt + '\n')
    f.write('COMMIT;\n')

print("SQL written to /tmp/migrate_translations.sql")
print()
print("=== SQL PREVIEW ===")
for stmt in updates[:3]:
    print(stmt[:200] + "...")
print("...")
