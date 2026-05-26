# Architecture

Monorepo architecture and technology stack decisions for the Dark Angels Telegram Mini App.

---

## Repository Structure

```
dark-angels/
├── apps/
│   ├── frontend/          # Vite + React SPA (Telegram Mini App)
│   └── backend/           # Fastify API server (Node.js 20+)
├── packages/
│   ├── types/             # TypeScript interfaces (Tour, Service, Blog, Auth)
│   ├── shared/            # Zod schemas + AppError + utilities
│   └── config/            # Shared tsconfig, ESLint
├── infrastructure/
│   └── supabase/          # Migrations + seeds
└── docs/
    └── knowledge/         # AI-maintained knowledge base
```

## Dependency Graph

```
apps/frontend  →  packages/shared  →  packages/types
apps/backend   →  packages/shared  →  packages/types
                                   →  packages/config
```

## Technology Choices

| Layer | Technology | Rationale |
|---|---|---|
| Package manager | pnpm 9+ | Fast, disk-efficient, strict |
| Node linker | isolated | Clean separation per package |
| Frontend build | Vite 6 | Fast HMR, simple config |
| UI framework | React 19 | SPA model for Telegram Mini App |
| CSS | TailwindCSS v4 | Utility-first, dark theme via `@theme` |
| Backend server | Fastify 5 | Performance, plugin encapsulation |
| Validation | Zod 3.24 | Shared between frontend/backend |
| Database | Supabase PostgreSQL | Managed, migrations, storage |
| API protocol | REST /api/v1 | Simplified over tRPC for this CMS scale |
| Auth | JWT + refresh tokens | Stateless with refresh rotation |

## Key Decisions

- **JSONB for i18n**: `{ru, en}` instead of `*_ru/*_en` columns — flexible, no DB migration for new languages
- **No tRPC**: REST chosen for simplicity; CMS has infrequent content updates
- **No SSR**: Vite SPA is sufficient for Telegram Mini App (runs inside Telegram WebView)

---

## Changelog

- **2026-05-26** — Production deployment: backend on Railway (Docker, Node 20-alpine), frontend on Cloudflare Pages, Supabase PostgreSQL. Docker build uses `pnpm deploy /prod` approach. WebSocket support via `ws` package for Supabase realtime. E2E test suite: 54/54 passing on production stack. Fixed critical Zod `z.coerce.boolean()` bug (parse("false") returns true due to truthy non-empty string). Fixed React hooks #310 in detail pages (useLocalized after conditional returns).
- **2026-05-23** — CI/CD: GitHub Actions pipeline (lint→typecheck→test→build), Docker multi-stage (backend Alpine + frontend Nginx), docker-compose
- **2026-05-23** — Testing: Vitest unit tests (24 passing), Playwright E2E config (playwright.config.ts at root), functional test suite (39/39)
- **2026-05-23** — Mock mode: in-memory DB bypasses Supabase for dev/demo without external services
- **2026-05-21** — Monorepo scaffolded with pnpm workspace; isolated linker; 5 packages