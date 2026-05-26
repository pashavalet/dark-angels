# Database

PostgreSQL schema, migrations, and indexing strategy for the Dark Angels Telegram Mini App.

---

## Tables

| Table | Purpose | Key Fields |
|---|---|---|
| `admins` | Admin authentication | UUID PK, email (unique), password_hash, totp_secret, recovery_codes_hash |
| `refresh_tokens` | JWT refresh session | FK → admins, token_hash, expires_at |
| `tours` | Tour content | JSONB `{ru,en}` for: title/desc/country/city/agency; earnings, is_vip, hidden_vip, tags[], image_url, sort_order, requires_subscription |
| `services` | Service content | JSONB title/desc; price, tags[], image_url, sort_order, requires_subscription |
| `blog_articles` | Blog content | JSONB title/content; tags[], hidden_vip, access_level, sort_order, requires_subscription |
| `homepage_collections` | Curated homepage sections | section, item_id, item_type, sort_order, is_pinned |
| `telegram_link_codes` | One-time codes for linking Telegram to admin accounts | admin_id (FK → admins), code (UNIQUE), expires_at, used_at |
| `telegram_users` | Telegram user data for analytics | telegram_id (BIGINT PK), username, first_name, last_name, language_code, is_premium, access_level, is_channel_subscriber |
| `user_activity` | User interaction tracking | FK → telegram_users, page, item_type, item_id |

## Localization Pattern

All user-facing text uses JSONB columns:

```sql
title JSONB NOT NULL DEFAULT '{}'  -- {"ru": "...", "en": "..."}
```

Adding a language requires app deployment, not DB migration.

## Indexes

- `idx_tours_published` — partial index on `is_published = true`
- `idx_tours_vip` — composite on `(is_vip, hidden_vip)`
- `idx_blog_access` — on `access_level`
- Sorted indexes on `sort_order` for tours, services, blog
- `idx_telegram_users_access` — on `access_level`
- `idx_telegram_users_subscriber` — on `is_channel_subscriber`
- `idx_telegram_users_username` — on `username`
- `idx_user_activity_telegram` — composite on `(telegram_id, created_at DESC)`
- `idx_user_activity_page` — composite on `(telegram_id, page)`

## Migrations

- Location: `infrastructure/supabase/migrations/`
- Naming: `YYYYMMDDHHMMSS_description.sql`
- Each migration is atomic
- Current: `20260521000000_initial_schema.sql`, `20260526000001_telegram_integration.sql`, `20260527000001_bot_integration.sql`

## RLS Strategy

- Backend uses Supabase service key → bypasses RLS
- RLS enabled on all 6 tables (admins, refresh_tokens, tours, services, blog_articles, homepage_collections)
- 4 public SELECT policies: tours (is_published + !hidden_vip), services (is_published), blog_articles (is_published + !hidden_vip), homepage_collections (allow all)
- admins and refresh_tokens have RLS enabled with no policies → blocked for anon, accessible via service key only
- Admin mutations go through backend API

---

## Changelog

- **2026-05-26** — Phase 3: `requires_subscription` field added to shared zod schemas (tour/service/blog create + update) and TypeScript types (Tour, Service, BlogArticle interfaces).
- **2026-05-27** — Bot integration: `admins.telegram_id` column + `telegram_link_codes` table for Telegram–admin linking.
- **2026-05-26** — RLS migration: enabled on all 6 tables. Public SELECT policies created for tours/services/blog_articles/homepage_collections. admins and refresh_tokens blocked for anon (service key only).