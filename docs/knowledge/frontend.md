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
| State (server) | React Query (future) |
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
- `useTelegram()` — React hook: `{ tg, user, ready, expand, close }`
- Falls back gracefully when app is opened outside Telegram

## Component Structure (future)

```
src/
├── components/
│   ├── layout/        # BottomNav, PageTransition
│   ├── ui/            # shadcn/ui components
│   ├── tours/         # TourCard, TourList
│   ├── services/      # ServiceCard
│   ├── blog/          # BlogCard, MarkdownRenderer
│   └── admin/         # CRUD panels, DragDrop
├── hooks/             # useTelegram, useLocale
├── stores/            # authStore, localeStore, uiStore
├── i18n/              # i18next config + ru/en locales
└── lib/               # cn(), telegram.ts
```

## Navigation (future)

Bottom tab bar with 5 tabs: Home → Tours → Blog → Services → Contacts.

---

## Changelog

- **2026-05-23** — Functional E2E tests: 39/39 passing (Playwright Python), homepage carousels, CRUD detail pages, admin login+2FA+DnD
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