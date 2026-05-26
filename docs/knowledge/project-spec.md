# Dark Angels — Project Knowledge Base

Telegram Mini App CMS platform for escort agency with multilingual content management and premium dark luxury UI.

---

## Contents

| Topic | File | Description |
|---|---|---|
| Architecture | [`architecture.md`](./architecture.md) | Monorepo structure, dependency graph, technology stack decisions |
| Database | [`database.md`](./database.md) | PostgreSQL schema, migrations, indexes, RLS strategy |
| Backend | [`backend.md`](./backend.md) | Fastify API server, plugins, auth, error handling |
| Frontend | [`frontend.md`](./frontend.md) | React SPA, Telegram SDK, TailwindCSS, routing, state |

---

## Quick Reference

| Concern | Key Decision |
|---|---|
| Package manager | pnpm 9+ with isolated node linker |
| Language support | JSONB fields `{ru,en,kk,uz,ky,uk}` + i18next |
| API style | REST /api/v1 with typed Zod schemas |
| Auth | JWT (15m) + refresh tokens (7d) + bcrypt (cost 12) |
| Admin security | TOTP 2FA, account lockout, rate limiting |
| Hosting target | Railway (backend) + Cloudflare Pages (frontend) |

---

## Changelog

- **2026-05-23** — Settings page: profile view, change email/password, 3 backend endpoints (GET /profile, PUT /profile/email, PUT /profile/password), Dashboard 0 stubs, 50/50 E2E
- **2026-05-23** — Admin CRUD: Tour/Service/Blog edit forms + admin list pages, Dashboard un-stubbed, 40 i18n keys, 43/43 E2E tests
- **2026-05-23** — Mock mode enabled: in-memory DB + seed data, no Supabase needed for local dev; functional tests 39/39 passing
- **2026-05-23** — CI/CD + Docker setup; Vitest + Playwright testing frameworks configured; WCAG 2.2 AA audit complete
- **2026-05-21** — Restructured into topic-based knowledge files per AGENTS.md
- **2026-05-18** — Initial v2.0 spec: JSON-based localization, VIP access system, 2FA