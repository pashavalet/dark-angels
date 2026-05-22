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

## Route Structure (future)

```
/api/v1/
├── auth/       login, logout, refresh, 2fa/*
├── tours/      public GET, admin CRUD
├── services/   public GET, admin CRUD
├── blog/       public GET, admin CRUD
├── homepage/   collections management
└── upload/     image upload pipeline
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

---

## Changelog

- **2026-05-22** — 2FA: TOTP setup (QR), verify, challenge (login), disable, recovery codes via otplib
- **2026-05-22** — Image upload: POST/DELETE /api/v1/upload with @fastify/multipart + Supabase Storage
- **2026-05-22** — VIP access filtering: public routes hide hidden_vip tours and non-public blog posts
- **2026-05-21** — Services CRUD routes: public GET (paginated, filterable by tags/search), admin POST/PUT/DELETE/PATCH
- **2026-05-21** — Tours CRUD routes: public GET (paginated, filterable), admin POST/PUT/DELETE/PATCH
- **2026-05-21** — Auth routes: login/refresh/logout, JWT + bcrypt + httpOnly cookies, lockout after 5 failures
- **2026-05-21** — Fastify app skeleton: CORS, rate-limit, Supabase plugin, `/health` with DB check