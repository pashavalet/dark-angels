# Frontend

React SPA patterns and Telegram Mini App integration for the Dark Angels web client.

---

## Stack

| Component | Technology |
|---|---|
| Build | Vite 6 |
| Framework | React 19 |
| Language | TypeScript 5.5 |
| Styling | TailwindCSS v4 |
| Routing | React Router v7 |
| State (client) | Zustand 5 |
| State (server) | React Query (TanStack Query v5) |
| SDK | `window.Telegram.WebApp` (raw API) |

## Dark Theme (Tailwind v4)

Custom design tokens via `@theme` directive in `src/styles/index.css`:

```css
--color-bg-primary: #0a0a0b;
--color-bg-secondary: #141416;
--color-bg-card: #1a1a1d;
--color-accent: #c9a86b;
--color-text-primary: #f5f5f5;
--color-text-secondary: #a1a1aa;
```

Luxury dark aesthetic: gold accent, deep charcoal backgrounds, muted borders.

## Telegram SDK

`src/lib/telegram.ts` provides:
- `getTelegram()` — returns `window.Telegram.WebApp` or null
- `useTelegram()` — React hook: `{ tg, user, ready, expand, close, initData, initDataUnsafe }`
- `getInitData()` — returns raw `initData` string for backend auth
- `isInTelegram()` — boolean check
- `getTelegramUser()` — typed Telegram user object
- Falls back gracefully when app is opened outside Telegram

### Telegram UX Hooks

- **`useBackButton(callback)`** — Shows `tg.BackButton`, calls `callback` on click, hides on unmount
- **`useMainButton(text, callback, enabled?)`** — Shows `tg.MainButton` with text, calls `callback` on click, auto-hides on unmount. `enabled` defaults to `true`

Both hooks integrate with Telegram-native navigation. Callbacks use `useRef` for stable references.

### Theme & Language

- `AppLayout` sets CSS vars (`--tg-bg`, `--tg-text`, etc.) from `tg.themeParams` on mount
- `themeChanged` event listener keeps CSS vars in sync
- Telegram `language_code` auto-detected on mount; applies via `i18n.changeLanguage()` unless user already picked a locale

SDK script loaded in `index.html`:
```html
<script src="https://telegram.org/js/telegram-web-app.js"></script>
```

## Component Structure

```
src/
├── components/
│   ├── layout/        # AppLayout, BottomNav
│   ├── ui/            # ImageUploader, LocalizedField, VipBadge, LanguageSwitcher
│   ├── tours/         # TourCard
│   ├── services/      # ServiceCard
│   ├── blog/          # BlogCard, MarkdownRenderer
│   ├── auth/          # ProtectedRoute
│   ├── admin/         # AdminFormLayout, SortableList
│   └── homepage/      # HorizontalCarousel
├── hooks/             # useLocalized, useBackButton, useMainButton
├── api/               # tours, services, blogs, homepage, upload, auth, admin (React Query hooks)
├── stores/            # authStore, localeStore
├── i18n/              # i18next config + 6 locales (ru/en/kk/uz/ky/uk)
└── lib/               # cn(), telegram.ts
```

## Navigation

Bottom tab bar with 5 tabs: Home → Tours → Services → Blog → Contacts.

## Bot Integration

Admin Telegram linking flow:
1. Admin opens bot, sends `/admin` → bot replies with instructions to link
2. Admin goes to admin panel → profile → "Link Telegram" → gets 7-char code
3. Admin sends `/link <code>` to bot → bot verifies and links `telegram_id` to admin
4. After linking: `/admin` shows "Open Admin Panel" button (WebApp keyboard)
5. Mini App auto-detects admin on telegram auth → redirects to admin dashboard

---

## Changelog

- **2026-05-27** — Phase 5: Telegram-native BackButton on Tour/Service/Blog detail pages; MainButton on Tours/Service detail pages (opens Telegram contact) and ContactsPage. `useBackButton`/`useMainButton` hooks created. `AppLayout`: `themeChanged` listener, Telegram language detection via `i18n.changeLanguage()`. `lib/telegram.ts` extended: `getInitData()`, `isInTelegram()`, `getTelegramUser()`, raw `initData` in `useTelegram()`, `initData` on interface, `setParams` on MainButton, `offClick` on BackButton, `onEvent`/`offEvent`/`SettingsButton`.
- **2026-05-26** — Phase 4: Admin Telegram Users panel. `TelegramUsersAdminPage` (list with filters + CSV download + pagination). `TelegramUserPortraitPage` (avatar, profile, stats, page breakdown, activity log). Routes `/admin/telegram-users` and `/admin/telegram-users/:telegramId`. Dashboard nav card with user count. `api/admin.ts` extended with `useTelegramUsers()`, `useTelegramUser()`, `useDownloadTelegramUsers()`.
- **2026-05-26** — Phase 3: Subscription gating. `authStore` extended: `telegramUserId`, `telegramUsername`, `isSubscribed`, `setTelegramAuth()`. `api/telegram.ts`: `useTelegramAuth()` / `useTelegramRefresh()` / `useTrackPage()`. `AppLayout`: auto-login via Telegram initData on mount. `requires_subscription` checkbox in all 3 editor pages. Card components: lock overlay for gated content. Detail pages: gate screen (channel subscribe prompt) for locked content. i18n key `requires_subscription` added in 6 languages.
- **2026-05-26** — Phase 1 Telegram Mini App: added `<script src="telegram-web-app.js">` to `index.html`.
- **2026-05-26** — i18n expanded to 6 languages: kk/uz/ky/uk. All 146 UI keys translated via Google Translate (`scripts/rebuild_i18n.py`). Only `loading: '...'` kept ru (dots confuse translator).
- **2026-05-26** — HomePage rewired to use list APIs (`useTours/Services/Blogs`) instead of curated `homepage_collections`. Cards now identical to tab pages. Added LanguageSwitcher component (RU/EN toggle) syncing both i18next and Zustand localeStore. Section headers changed: «Избранные» → «Новые».
- **2026-05-26** — DashboardPage: real stats widgets (counts + recent items). Fetches from new `GET /admin/stats` endpoint via React Query. Nav cards kept alongside metrics. API hook: `useAdminStats()` in `api/admin.ts`.
- **2026-05-23** — Admin CRUD: 6 pages (Tour/Service/Blog edit forms + admin list pages), AdminFormLayout, LocalizedField (ru/en tabbed JSONB input), Dashboard un-stubbed (5/6 cards real), 40 i18n keys
- **2026-05-23** — Functional E2E tests: 43/43 passing (Playwright Python), homepage carousels, CRUD detail pages, admin login+2FA+DnD+CRUD lists
- **2026-05-23** — WCAG 2.2 AA: focus-visible on 30+ elements, contrast fix (450/700 vs 500/700), reduced-motion skip/whitelist, Space key actionable cards
- **2026-05-23** — i18n hardcoded strings replaced: 27→`t()`, 18 new keys added, upload_error/menu fixed, admin breadcrumbs localized
- **2026-05-23** — Mock mode: frontend supports running against mock backend (no Supabase needed), login bypass in dev
- **2026-05-22** — 2FA pages: TwoFactorPage (QR + codes), LoginPage 2FA step, recovery flow
- **2026-05-22** — ImageUploader: drag-drop component with browser-image-compression, Supabase Storage integration via `api/upload.ts`
- **2026-05-22** — VIP gating: VipBadge reusable component (vip/premium/invite), auth store extended with isPremium/accessLevel/setAccess, HomePage blur overlay for restricted content when not authenticated
- **2026-05-22** — Homepage carousels: `HorizontalCarousel` (horizontal scroll + snap, framer-motion stagger, skeleton loading), `HomePage` rewrite with 3 sections (tours/services/blog), API hooks in `api/homepage.ts`; Admin DnD: `CollectionsPage` with @dnd-kit sortable list, pin/remove controls, `SortableList` reusable component; i18n keys added for homepage + collections
- **2026-05-22** — Blog pages: `BlogPage` (list w/ search, tag filter, pagination), `BlogDetailPage` (markdown rendering via react-markdown + remark-gfm + rehype-highlight), `BlogCard` w/ access-level badge, `MarkdownRenderer` component, API hooks in `api/blogs.ts`
- **2026-05-21** — Full routing (7 routes), BottomNav (44px+ targets), Framer Motion transitions, i18n (ru/en), Zustand stores, axios API client with refresh interceptor, admin login page
- **2026-05-21** — Vite + React + TailwindCSS v4 scaffold; `useTelegram()` hook; dark theme tokens