# Backend

Fastify API server patterns and implementation details for the Dark Angels Telegram Mini App.

---

## Server Stack

| Component | Technology |
|---|---|
| Runtime | Node.js 20 LTS |
| Framework | Fastify 5 |
| Language | TypeScript 5.5 (strict) |
| Dev runner | tsx watch |
| Validation | Zod 3.24 |
| Database | `@supabase/supabase-js` via service key |
| Auth | JWT (access 15m) + refresh tokens (7d) + bcrypt (cost 12) |

## Plugin Architecture

Fastify plugins use encapsulation (per AGENTS.md rules). Shared plugins use `fastify-plugin`:

```
app.ts
├── @fastify/cors       — CORS with credentials
├── @fastify/rate-limit — configurable window/max
├── supabase.ts         — SupabaseClient decorator (fastify-plugin)
└── (future) auth.ts    — JWT auth + 2FA
```

## Mock Mode

Set `MOCK_MODE=true` in `.env` to run without Supabase:
- In-memory DB with seed data (3 tours, 3 services, 3 blog articles, homepage collections, 2 admin users)
- Chainable mock Supabase client via Proxy: `select/eq/in/or/contains/order/range/insert/update/delete/single`
- `verifyPassword` bypassed — any password ≥12 chars accepted
- `dotenv` loads `.env` at startup; environment validated via Zod (PORT, HOST, JWT_SECRET=32, ...)
- BCrypt rounds: 4 in mock mode, 12 in production

## Route Structure

```
/api/v1/
├── auth/       login, logout, refresh, 2fa/*
├── auth/telegram   POST initData verify, upsert user, return JWT
├── track       POST activity tracking (page views)
├── tours/      public GET, admin CRUD
├── services/   public GET, admin CRUD
├── blog/       public GET, admin CRUD
├── homepage/   collections management
├── upload/     image upload pipeline
├── admin/
│   ├── stats               GET counts + recent items
│   ├── telegram-link-code  POST generate 7-char code (10min expiry)
│   ├── telegram-link-status GET check if admin has linked Telegram
│   ├── telegram-users      GET paginated list w/ filters
│   ├── telegram-users/download  GET CSV export
│   └── telegram-users/:id  GET user portrait + activity log
└── bot/       [removed] — no bot routes, uses polling
```

## Error Handling

Uses `@fastify/error` with typed errors:

```ts
const NotFoundError = createError('NOT_FOUND', '%s not found', 404);
const UnauthorizedError = createError('UNAUTHORIZED', 'Authentication required', 401);
const ForbiddenError = createError('FORBIDDEN', 'Access denied: %s', 403);
const ValidationError = createError('VALIDATION_ERROR', '%s', 400);
```

## Environment Variables

Validated via Zod at startup. Required: PORT, HOST, SUPABASE_URL, SUPABASE_SERVICE_KEY, JWT_SECRET (≥32 chars).
Optional: MOCK_MODE (bool), TELEGRAM_BOT_TOKEN (string, default ''), TELEGRAM_MINIAPP_URL (string, default '').
Note: `BOT_WEBHOOK_URL` was removed — bot uses polling (`getUpdates`), no webhook needed.

## Bot (polling, no webhook)

`routes/bot/bot-polling.ts` starts after `app.listen()` in `server.ts` (fire-and-forget). Uses Telegram API `getUpdates` with 25s long-polling timeout, 3s `setInterval` loop. Processes commands:

| Command | Action |
|---|---|
| `/start` | ReplyKeyboardMarkup + Web App button → opens Mini App |
| `/admin` | If linked: Web App keyboard → opens admin panel in Mini App |
| `/link <code>` | Links Telegram user to admin account via `telegram_link_codes` |

Bot init (`initBot()`):
- `setChatMenuButton` — permanent "Open" button near message input
- `setMyCommands` — registers `/start` and `/admin` command suggestions

Service layer: `services/bot.service.ts` — raw `fetch` to Telegram API, no npm bot packages. `@grammyjs/types` (dev dep) only for type definitions.

## Docker Deployment

Multi-stage Docker build (`infrastructure/docker/Dockerfile.backend`):

1. **Build stage**: Install deps → build `@dark-angels/shared` (tsc) → build `@dark-angels/backend` (tsc) → `pnpm deploy /prod`
2. **Runtime stage**: alpine, copy `/prod` → user `app` → `node dist/server.js`

Critical: `pnpm deploy` respects `.gitignore`. Root `.gitignore` has `dist/` which excludes compiled JS from deploy. Fixed via `"files": ["dist"]` in `apps/backend/package.json` — overrides `.gitignore` for pnpm/publish file inclusion.

Cache invalidation: `ARG CACHEBUST` in Dockerfile forces rebuild of subsequent layers. Increment the value (1→2→3...) each deploy to bypass Docker cache.

---

## Changelog

- **2026-05-27** — `GET /admin/stats` now includes interaction analytics from `user_activity`: total interactions, unique users (all/7d/30d), top pages, item type breakdown, and daily interactions (last 14 days).
- **2026-05-27** — Hardened `/api/v1/admin/*`: all admin routes now require both JWT auth and admin role check (`email` claim from classic admin token or `is_admin: true` from Telegram token).
- **2026-05-27** — Docker fix: `"files": ["dist"]` in package.json ensures pnpm deploy includes compiled JS despite root `.gitignore` excluding `dist/`. `ARG CACHEBUST` for forced cache invalidation on Railway.
- **2026-05-27** — Bot polling: switched from webhook (404 issues on Railway Docker) to `getUpdates` polling. Handles `/start`/`/admin`/`/link`. Bot init (`setChatMenuButton` + `setMyCommands`) runs on startup. No routes, no webhook URL needed.
- **2026-05-26** — Phase 2: Telegram API backend. `lib/telegram-api.ts`: `validateInitData` (HMAC-SHA256), `checkChannelSubscription` (getChatMember), `parseInitDataUser`. `routes/telegram/routes.ts`: `POST /auth/telegram` (verify → subscribe check → upsert user → JWT), `POST /auth/telegram/refresh` (re-check + refresh token), `POST /track` (page view logging). Admin routes extended: `GET /admin/telegram-users` (paginated, filterable), `GET /admin/telegram-users/download` (CSV), `GET /admin/telegram-users/:telegramId` (portrait + activity log + stats). FastifyJWT payload type extended with `telegram_id`, `is_subscribed`, `access_level`.

- **2026-05-26** — Admin stats endpoint: `GET /admin/stats` (auth required) returns counts (tours/services/blog) + recent items (last 5 each). New route file: `routes/admin/routes.ts`. 10 unit tests for `translateLocalizedFields` (mock + edge cases).
- **2026-05-26** — Production deployment on Railway (Docker, Node 20-alpine) with Supabase realtime. Fixed Zod `z.coerce.boolean()` trap: `parse("false")` returns true (non-empty string). Replaced with `z.string().transform(v => v === 'true')`. Fixed dotenv in production: guarded with `if (NODE_ENV !== 'production')`. Fixed Supabase WebSocket crash on Node 20: added `ws` package, passed as `realtime.transport`. verifyPassword now uses parsed `env.MOCK_MODE` (boolean) not raw `process.env.MOCK_MODE` (string).
- **2026-05-23** — Functional E2E tests: API login/tokens, all public routes return 200 with data from in-memory mock DB
- **2026-05-23** — Mock mode: in-memory DB + chainable mock Supabase client + dotenv + mock-data.ts seed file (3 entities each + collections)
