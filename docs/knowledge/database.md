# Database

PostgreSQL schema, migrations, and indexing strategy for the Dark Angels Telegram Mini App.

---

## Tables

| Table | Purpose | Key Fields |
|---|---|---|
| `admins` | Admin authentication | UUID PK, email (unique), password_hash, totp_secret, recovery_codes_hash |
| `refresh_tokens` | JWT refresh session | FK → admins, token_hash, expires_at |
| `tours` | Tour content | JSONB `{ru,en}` for: title/desc/country/city/agency; earnings, is_vip, hidden_vip, tags[], image_url, sort_order |
| `services` | Service content | JSONB title/desc; price, tags[], image_url, sort_order |
| `blog_articles` | Blog content | JSONB title/content; tags[], hidden_vip, access_level, sort_order |
| `homepage_collections` | Curated homepage sections | section, item_id, item_type, sort_order, is_pinned |

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

## Migrations

- Location: `infrastructure/supabase/migrations/`
- Naming: `YYYYMMDDHHMMSS_description.sql`
- Each migration is atomic

## RLS Strategy

- Backend uses Supabase service key → bypasses RLS
- RLS enabled on all 6 tables (admins, refresh_tokens, tours, services, blog_articles, homepage_collections)
- 4 public SELECT policies: tours (is_published + !hidden_vip), services (is_published), blog_articles (is_published + !hidden_vip), homepage_collections (allow all)
- admins and refresh_tokens have RLS enabled with no policies → blocked for anon, accessible via service key only
- Admin mutations go through backend API

---

## Changelog

- **2026-05-26** — RLS migration: enabled on all 6 tables. Public SELECT policies created for tours/services/blog_articles/homepage_collections. admins and refresh_tokens blocked for anon (service key only).