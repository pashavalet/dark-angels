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

- **2026-05-22** — Homepage carousels: `HorizontalCarousel` (horizontal scroll + snap, framer-motion stagger, skeleton loading), `HomePage` rewrite with 3 sections (tours/services/blog), API hooks in `api/homepage.ts`; Admin DnD: `CollectionsPage` with @dnd-kit sortable list, pin/remove controls, `SortableList` reusable component; i18n keys added for homepage + collections
- **2026-05-22** — Blog pages: `BlogPage` (list w/ search, tag filter, pagination), `BlogDetailPage` (markdown rendering via react-markdown + remark-gfm + rehype-highlight), `BlogCard` w/ access-level badge, `MarkdownRenderer` component, API hooks in `api/blogs.ts`
- **2026-05-21** — Full routing (7 routes), BottomNav (44px+ targets), Framer Motion transitions, i18n (ru/en), Zustand stores, axios API client with refresh interceptor, admin login page
- **2026-05-21** — Vite + React + TailwindCSS v4 scaffold; `useTelegram()` hook; dark theme tokens