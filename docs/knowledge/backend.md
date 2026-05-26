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
└── admin/
    ├── stats               GET counts + recent items
    ├── telegram-users      GET paginated list w/ filters
    ├── telegram-users/download  GET CSV export
    └── telegram-users/:id  GET user portrait + activity log
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
Optional: MOCK_MODE (bool), TELEGRAM_BOT_TOKEN (string, default '').

---

## Changelog

- **2026-05-26** — Phase 4: `GET /admin/stats` now includes `telegram_users` count.
- **2026-05-26** — Phase 2: Telegram API backend. `lib/telegram-api.ts`: `validateInitData` (HMAC-SHA256), `checkChannelSubscription` (getChatMember), `parseInitDataUser`. `routes/telegram/routes.ts`: `POST /auth/telegram` (verify → subscribe check → upsert user → JWT), `POST /auth/telegram/refresh` (re-check + refresh token), `POST /track` (page view logging). Admin routes extended: `GET /admin/telegram-users` (paginated, filterable), `GET /admin/telegram-users/download` (CSV), `GET /admin/telegram-users/:telegramId` (portrait + activity log + stats). FastifyJWT payload type extended with `telegram_id`, `is_subscribed`, `access_level`.

- **2026-05-26** — Admin stats endpoint: `GET /admin/stats` (auth required) returns counts (tours/services/blog) + recent items (last 5 each). New route file: `routes/admin/routes.ts`. 10 unit tests for `translateLocalizedFields` (mock + edge cases).
- **2026-05-26** — Production deployment on Railway (Docker, Node 20-alpine) with Supabase realtime. Fixed Zod `z.coerce.boolean()` trap: `parse("false")` returns true (non-empty string). Replaced with `z.string().transform(v => v === 'true')`. Fixed dotenv in production: guarded with `if (NODE_ENV !== 'production')`. Fixed Supabase WebSocket crash on Node 20: added `ws` package, passed as `realtime.transport`. verifyPassword now uses parsed `env.MOCK_MODE` (boolean) not raw `process.env.MOCK_MODE` (string).
- **2026-05-23** — Functional E2E tests: API login/tokens, all public routes return 200 with data from in-memory mock DB
- **2026-05-23** — Mock mode: in-memory DB + chainable mock Supabase client + dotenv + mock-data.ts seed file (3 entities each + collections)