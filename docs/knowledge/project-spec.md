# Dark Angels Telegram Mini App — Project Specification

> Production-grade Telegram Mini App CMS Platform
> Version 2.0 — Enhanced Architecture

---

## Table of Contents

1. [Role and Identity](#1-role-and-identity)
2. [Technical Stack](#2-technical-stack)
3. [Architecture Overview](#3-architecture-overview)
4. [Localization System](#4-localization-system)
5. [VIP & Access System](#5-vip--access-system)
6. [Authentication & Security](#6-authentication--security)
7. [Database Schema](#7-database-schema)
8. [API Design](#8-api-design)
9. [Frontend Architecture](#9-frontend-architecture)
10. [Backend Architecture](#10-backend-architecture)
11. [Admin Panel](#11-admin-panel)
12. [Image Upload Pipeline](#12-image-upload-pipeline)
13. [Markdown Blog System](#13-markdown-blog-system)
14. [Drag-and-Drop System](#14-drag-and-drop-system)
15. [Testing Strategy](#15-testing-strategy)
16. [Monitoring & Logging](#16-monitoring--logging)
17. [CI/CD Pipeline](#17-cicd-pipeline)
18. [Environment Variables](#18-environment-variables)
19. [Security Checklist](#19-security-checklist)
20. [Implementation Roadmap](#20-implementation-roadmap)

---

## 1. Role and Identity

**You are a Senior Fullstack Telegram WebApp Architect and Staff-Level Engineer.**

Specializations:
- Telegram Mini Apps
- Node.js backend systems
- Supabase architecture
- CMS systems
- Premium mobile-first UI/UX
- Scalable CRUD architectures
- Secure admin systems
- AI-assisted production development

**Responsibilities:**
- Architecture decisions
- Scalability planning
- Developer experience
- Maintainability
- Security hardening
- Mobile UX optimization
- Production readiness

---

## 2. Technical Stack

### Frontend
- **React 18** + **Vite 5** + **TypeScript 5.4**
- **Telegram SDK** (`@telegram-apps/sdk`)
- **State**: Zustand (client) + React Query (server)
- **Routing**: React Router v6
- **Styling**: TailwindCSS + shadcn/ui
- **Animation**: Framer Motion (page transitions only; micro-interactions via CSS)
- **i18n**: i18next + react-i18next
- **Markdown**: react-markdown + remark-gfm + rehype-highlight
- **Drag & Drop**: @dnd-kit/core + @dnd-kit/sortable
- **Image Compression**: browser-image-compression

### Backend
- **Node.js 20 LTS**
- **Fastify 4** (plugin-based architecture)
- **TypeScript 5.4**
- **Validation**: Zod
- **Auth**: JWT (access) + refresh tokens
- **Database Client**: Supabase JS SDK + pg

### Infrastructure
- **Database**: Supabase PostgreSQL
- **Storage**: Supabase Storage
- **Hosting**: Railway / Fly.io (backend), Cloudflare Pages (frontend)

---

## 3. Architecture Overview

```
/root
├── apps/
│   ├── frontend/              # React SPA (Telegram Mini App)
│   └── backend/              # Fastify API server
├── packages/
│   ├── shared/               # Shared utilities (validation schemas, types)
│   ├── types/                 # TypeScript interfaces
│   └── config/                # Shared configs (eslint, tsconfig)
├── infrastructure/
│   ├── supabase/
│   │   ├── migrations/        # SQL migrations
│   │   └── seeds/             # Seed data
│   └── docker/                # Docker Compose for local dev
├── docs/
│   ├── knowledge/             # AI-maintained knowledge base
│   ├── miningcore/            # Miningcore project docs
│   └── nexus/                 # Nexus project docs
└── scripts/                   # Dev scripts
```

### Project Dependencies

```txt
frontend → shared, types
backend  → shared, types
shared   → types
```

---

## 4. Localization System

### Architecture: JSON-based Fields

Instead of `title_ru`, `title_en` fields, use JSON objects:

```ts
interface LocalizedString {
  ru: string;
  en: string;
}

interface Tour {
  id: string;
  title: LocalizedString;
  description: LocalizedString;
  country: LocalizedString;
  city: LocalizedString;
  agency: LocalizedString;
  // ...
}
```

### Why JSON over SQL columns?

| Approach | Pros | Cons |
|----------|------|------|
| SQL columns (`title_ru`) | Simple queries | N×2 columns per field; adding language = migration |
| JSON (`{ru, en}`) | Flexible; easy to add languages | Slightly more complex queries |
| Separate table | Most normalized | Complex JOINs for content |

**Decision:** JSON for this scale. Adds languages via code deploy, not DB migration.

### Implementation

```ts
// packages/types/src/localization.ts
export type SupportedLocale = 'ru' | 'en';

export interface LocalizedString {
  [key: string]: string;
}

export function getLocalizedValue(obj: LocalizedString, locale: SupportedLocale): string {
  return obj[locale] ?? obj['en'] ?? Object.values(obj)[0] ?? '';
}
```

### i18next Configuration

```ts
// apps/frontend/src/i18n/index.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n.use(initReactI18next).init({
  fallbackLng: 'en',
  supportedLngs: ['ru', 'en'],
  ns: ['common', 'tours', 'services', 'blog', 'admin'],
  defaultNS: 'common',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
```

### Language Persistence

- Store selected language in `localStorage` key: `app_locale`
- Sync with Telegram user language if available
- Language switcher in header (icon button)

---

## 5. VIP & Access System

### Access Levels Architecture

```ts
enum AccessLevel {
  PUBLIC = 'public',        // Visible to all users
  VIP = 'vip',             // Requires VIP subscription
  PREMIUM = 'premium',     // Requires Telegram Premium
  INVITE_ONLY = 'invite',  // Requires invite code
}

interface UserAccess {
  level: AccessLevel;
  expires_at: Date | null;  // null = never expires
  subscription_id: string | null;
}
```

### Subscription States

```ts
interface Subscription {
  id: string;
  user_id: string;
  tier: 'monthly' | 'yearly';
  status: 'active' | 'cancelled' | 'expired' | 'pending';
  started_at: Date;
  expires_at: Date;
  auto_renew: boolean;
}
```

### Content Visibility Logic

```ts
function canViewContent(content: { access_level: AccessLevel }, user: User): boolean {
  if (content.access_level === 'public') return true;
  if (!user) return false;
  
  switch (content.access_level) {
    case 'vip':
      return user.subscription?.status === 'active';
    case 'premium':
      return user.is_telegram_premium;
    case 'invite':
      return user.invite_codes.includes(content.invite_code);
    default:
      return false;
  }
}
```

### VIP Badge UI

- Golden gradient border
- Star icon overlay
- Tooltip on tap with subscription details

---

## 6. Authentication & Security

### Admin Authentication Flow

```
┌─────────────────────────────────────────────────────────┐
│                    LOGIN FLOW                           │
├─────────────────────────────────────────────────────────┤
│  1. User submits username/password                      │
│  2. Validate credentials (bcrypt compare)                │
│  3. Generate JWT access token (15min) + refresh token  │
│  4. Store refresh token hash in DB                      │
│  5. Set HTTP-only cookies (access + refresh)            │
│  6. Return user data + redirect to dashboard            │
└─────────────────────────────────────────────────────────┘
```

### Two-Factor Authentication (2FA)

**Required for admin panel.**

```ts
interface AdminUser {
  id: string;
  email: string;
  password_hash: string;
  totp_secret: string;        // Encrypted TOTP secret
  totp_enabled: boolean;
  recovery_codes: string[];   // Hashed recovery codes (10 codes)
  backup_email?: string;      // For recovery
  last_login: Date;
  failed_login_attempts: number;
  locked_until: Date | null;
}
```

**Setup Flow:**
1. Admin enables 2FA in profile settings
2. Server generates TOTP secret (encrypted in DB)
3. Frontend displays QR code (otpauth:// URI)
4. Admin confirms 6-digit code
5. Server shows recovery codes (hashed storage)

**Login Flow with 2FA:**
```
1. Email/password → Verify password
2. If TOTP enabled → Request 6-digit code
3. Validate TOTP (30s window, 1 drift)
4. If valid → Issue tokens
5. If invalid → Increment failed_attempts, lock after 5
```

### Rate Limiting

| Endpoint | Limit | Window |
|----------|-------|--------|
| `/api/auth/login` | 5 attempts | 15 min |
| `/api/auth/2fa` | 10 attempts | 15 min |
| `/api/auth/refresh` | 100 | 1 min |
| `/api/upload` | 20 | 1 min |
| Public API | 100 | 1 min |

### Password Security

- **Algorithm:** bcrypt with cost factor 12
- **Min length:** 12 characters
- **Requirements:** uppercase, lowercase, number, special char
- **Breach check:** Optional HaveIBeenPwned API integration

---

## 7. Database Schema

### Tables

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Admins table
CREATE TABLE admins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  totp_secret VARCHAR(255),
  totp_enabled BOOLEAN DEFAULT false,
  recovery_codes_hash TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ,
  failed_login_attempts INT DEFAULT 0,
  locked_until TIMESTAMPTZ
);

-- Refresh tokens
CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID REFERENCES admins(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tours
CREATE TABLE tours (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title JSONB NOT NULL DEFAULT '{}',
  description JSONB NOT NULL DEFAULT '{}',
  country JSONB NOT NULL DEFAULT '{}',
  city JSONB NOT NULL DEFAULT '{}',
  agency JSONB NOT NULL DEFAULT '{}',
  earnings VARCHAR(100),
  contacts TEXT,
  is_vip BOOLEAN DEFAULT false,
  hidden_vip BOOLEAN DEFAULT false,
  tags TEXT[] DEFAULT '{}',
  image_url TEXT,
  sort_order INT DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Services
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title JSONB NOT NULL DEFAULT '{}',
  description JSONB NOT NULL DEFAULT '{}',
  price VARCHAR(100),
  contacts TEXT,
  tags TEXT[] DEFAULT '{}',
  image_url TEXT,
  sort_order INT DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Blog Articles
CREATE TABLE blog_articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title JSONB NOT NULL DEFAULT '{}',
  content JSONB NOT NULL DEFAULT '{}',
  preview_image TEXT,
  tags TEXT[] DEFAULT '{}',
  hidden_vip BOOLEAN DEFAULT false,
  access_level VARCHAR(20) DEFAULT 'public',
  sort_order INT DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Homepage Collections
CREATE TABLE homepage_collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  section VARCHAR(50) NOT NULL,  -- 'featured_tours', 'featured_services', 'featured_blog'
  item_id UUID NOT NULL,           -- Reference to tours/services/blog_articles
  item_type VARCHAR(20) NOT NULL,  -- 'tour', 'service', 'blog'
  sort_order INT DEFAULT 0,
  is_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_tours_published ON tours(is_published) WHERE is_published = true;
CREATE INDEX idx_tours_vip ON tours(is_vip, hidden_vip);
CREATE INDEX idx_services_published ON services(is_published);
CREATE INDEX idx_blog_published ON blog_articles(is_published);
CREATE INDEX idx_blog_vip ON blog_articles(hidden_vip);
CREATE INDEX idx_collections_section ON homepage_collections(section, sort_order);
CREATE INDEX idx_refresh_tokens_admin ON refresh_tokens(admin_id);
```

### Migrations Strategy

- Use Supabase migrations folder
- Naming: `YYYYMMDDHHMMSS_description.sql`
- Each migration is atomic and reversible
- Test migrations on staging before production

---

## 8. API Design

### REST vs tRPC

**Recommendation:** REST with typed responses for this project.

tRPC adds complexity (separate server, WebSocket for subscriptions) that isn't justified for a CMS with infrequent content updates.

### API Endpoints

```
Base URL: /api/v1

AUTH
POST   /auth/login              # Admin login
POST   /auth/logout             # Admin logout
POST   /auth/refresh            # Refresh access token
POST   /auth/2fa/setup          # Generate TOTP secret
POST   /auth/2fa/verify         # Verify TOTP and enable
POST   /auth/2fa/disable        # Disable 2FA
POST   /auth/recovery           # Recover using code

TOURS (Public)
GET    /tours                   # List tours (paginated, filterable)
GET    /tours/:id               # Get single tour
GET    /tours/featured          # Get featured (homepage)

TOURS (Admin)
POST   /tours                   # Create tour
PUT    /tours/:id               # Update tour
DELETE /tours/:id               # Delete tour
PATCH  /tours/:id/reorder       # Update sort order

SERVICES
GET    /services                # List services
GET    /services/:id            # Get single service
GET    /services/featured       # Get featured
POST   /services                # Create (admin)
PUT    /services/:id            # Update (admin)
DELETE /services/:id            # Delete (admin)

BLOG
GET    /blog                    # List articles
GET    /blog/:id                # Get article (markdown content)
GET    /blog/featured           # Get featured
POST   /blog                    # Create (admin)
PUT    /blog/:id                # Update (admin)
DELETE /blog/:id                # Delete (admin)

HOMEPAGE
GET    /homepage/collections    # Get all collections
PUT    /homepage/collections    # Update collections (admin)
PATCH  /homepage/reorder        # Reorder items

UPLOAD
POST   /upload/image            # Upload image (admin)
DELETE /upload/:url             # Delete image (admin)
```

### Response Format

```ts
// Success
{
  "success": true,
  "data": { ... },
  "meta": { page: 1, total: 100 }  // optional for lists
}

// Error
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": [...]
  }
}
```

### Validation with Zod

```ts
// packages/shared/src/schemas/tour.ts
import { z } from 'zod';
import { localizedStringSchema } from './common';

export const createTourSchema = z.object({
  title: localizedStringSchema,
  description: localizedStringSchema,
  country: localizedStringSchema,
  city: localizedStringSchema,
  agency: localizedStringSchema,
  earnings: z.string().optional(),
  contacts: z.string().optional(),
  is_vip: z.boolean().default(false),
  hidden_vip: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
  image_url: z.string().url().optional(),
});

export const updateTourSchema = createTourSchema.partial();
```

---

## 9. Frontend Architecture

### Folder Structure

```
apps/frontend/
├── public/
│   └── favicon.ico
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── api/                  # API client (React Query hooks)
│   │   ├── client.ts         # Axios/Fetch instance
│   │   ├── tours.ts
│   │   ├── services.ts
│   │   ├── blog.ts
│   │   └── admin.ts
│   ├── components/
│   │   ├── ui/               # shadcn/ui components
│   │   ├── layout/          # Header, Footer, Navigation
│   │   ├── tours/
│   │   ├── services/
│   │   ├── blog/
│   │   └── admin/
│   ├── hooks/                # Custom hooks
│   ├── pages/
│   │   ├── Home/
│   │   ├── Tours/
│   │   ├── Services/
│   │   ├── Blog/
│   │   ├── Contacts/
│   │   └── admin/           # Admin panel pages
│   ├── stores/              # Zustand stores
│   │   ├── auth.ts
│   │   ├── ui.ts
│   │   └── locale.ts
│   ├── i18n/
│   │   ├── index.ts
│   │   └── locales/
│   │       ├── ru.json
│   │       └── en.json
│   ├── lib/
│   │   ├── utils.ts
│   │   ├── telegram.ts      # Telegram SDK wrapper
│   │   └── cn.ts            # classname utility
│   └── types/
│       └── index.ts
├── tailwind.config.js
├── vite.config.ts
├── tsconfig.json
└── package.json
```

### State Management

**Zustand (client state):**
- `authStore` — user session, permissions
- `localeStore` — current language
- `uiStore` — modals, toasts, loading states

**React Query (server state):**
- Tours list with pagination
- Services list
- Blog articles
- Admin data mutations

### Telegram SDK Integration

```ts
// apps/frontend/src/lib/telegram.ts
import Telegram from '@twa/sdk';

export const tg = Telegram.init({
  debug: import.meta.env.DEV,
});

export const isTelegramApp = () => tg.version !== undefined;

export const getUserLanguage = () => tg.initDataUnsafe.user?.language_code ?? 'en';
```

### Page Transitions (Framer Motion)

```tsx
// apps/frontend/src/components/layout/PageTransition.tsx
import { motion, AnimatePresence } from 'framer-motion';

export function PageTransition({ children, key }: { children: React.ReactNode; key?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}
```

### Bottom Navigation

```tsx
// apps/frontend/src/components/layout/BottomNav.tsx
const navItems = [
  { path: '/', icon: HomeIcon, label: 'home' },
  { path: '/tours', icon: MapIcon, label: 'tours' },
  { path: '/blog', icon: ArticleIcon, label: 'blog' },
  { path: '/services', icon: SparklesIcon, label: 'services' },
  { path: '/contacts', icon: PhoneIcon, label: 'contacts' },
];
```

---

## 10. Backend Architecture

### Folder Structure

```
apps/backend/
├── src/
│   ├── app.ts                # Fastify instance
│   ├── server.ts             # Entry point
│   ├── config/
│   │   └── env.ts            # Environment validation
│   ├── plugins/
│   │   ├── auth.ts           # JWT plugin
│   │   ├── cors.ts           # CORS config
│   │   ├── rate-limit.ts
│   │   └── sentry.ts         # Error tracking
│   ├── routes/
│   │   ├── auth/
│   │   ├── tours/
│   │   ├── services/
│   │   ├── blog/
│   │   ├── homepage/
│   │   └── upload/
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── tour.service.ts
│   │   └── ...
│   ├── repositories/
│   │   ├── tour.repository.ts
│   │   └── ...
│   ├── schemas/              # Zod schemas (shared with frontend)
│   └── utils/
│       ├── errors.ts
│       └── hash.ts
├── migrations/
├── tsconfig.json
└── package.json
```

### Plugin Architecture

```ts
// apps/backend/src/app.ts
const app = Fastify({
  logger: true,
});

await app.register(import('@fastify/cors'), corsConfig);
await app.register(import('@fastify/rate-limit'), rateLimitConfig);
await app.register(import('./plugins/auth'));
await app.register(import('./plugins/sentry'));

// Register routes
await app.register(import('./routes/auth'), { prefix: '/api/v1/auth' });
await app.register(import('./routes/tours'), { prefix: '/api/v1/tours' });
```

### Error Handling

```ts
// apps/backend/src/utils/errors.ts
export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 500,
    public details?: unknown
  ) {
    super(message);
  }
}

export const errorCodes = {
  VALIDATION_ERROR: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  RATE_LIMITED: 429,
  INTERNAL_ERROR: 500,
};
```

---

## 11. Admin Panel

### Pages

1. **Dashboard** — Stats overview
2. **Tours** — CRUD + reorder
3. **Services** — CRUD + reorder
4. **Blog** — CRUD + markdown editor
5. **Homepage** — Drag-and-drop collections
6. **Settings** — Profile, 2FA, preferences

### Tour/Service CRUD Interface

- Card list with drag handles
- Inline edit modal
- Delete with confirmation
- VIP toggle switch
- Tag manager
- Image upload with preview

### Markdown Editor

```tsx
// Blog article editor
<MarkdownEditor
  value={content}
  onChange={setContent}
  locale={currentLocale}
  preview={true}
  toolbar={['bold', 'italic', 'heading', 'link', 'image', 'code']}
/>
```

### Drag-and-Drop Collections

```tsx
// Homepage collection manager
<SortableContext items={collectionItems}>
  {collectionItems.map(item => (
    <SortableItem key={item.id} item={item} />
  ))}
</SortableContext>

// On reorder complete
async function handleReorder(newOrder: Item[]) {
  await api.patch('/homepage/reorder', {
    section: currentSection,
    items: newOrder.map((item, index) => ({ id: item.id, sort_order: index }))
  });
}
```

---

## 12. Image Upload Pipeline

### Flow

```
User selects file
    ↓
Validate type (jpg/png/webp) + size (<5MB)
    ↓
Compress with browser-image-compression (max 1MB, 1920px)
    ↓
Generate unique filename (uuid + timestamp)
    ↓
Upload to Supabase Storage bucket 'images'
    ↓
Return public URL
```

### Implementation

```ts
// apps/frontend/src/api/upload.ts
import imageCompression from 'browser-image-compression';

export async function uploadImage(file: File): Promise<string> {
  const compressed = await imageCompression(file, {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
  });

  const filename = `${crypto.randomUUID()}-${Date.now()}.webp`;
  const { data, error } = await supabase.storage
    .from('images')
    .upload(filename, compressed);

  if (error) throw new Error('Upload failed');

  const { data: urlData } = supabase.storage
    .from('images')
    .getPublicUrl(filename);

  return urlData.publicUrl;
}
```

### Supabase Storage Setup

- Bucket: `images` (public)
- Allowed MIME types: `image/jpeg`, `image/png`, `image/webp`
- Max file size: 5MB (before compression)
- Path format: `{year}/{month}/{filename}`

---

## 13. Markdown Blog System

### Rendering

```tsx
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';

<ReactMarkdown
  remarkPlugins={[remarkGfm]}
  rehypePlugins={[rehypeHighlight]}
  components={{
    img: ({ node, ...props }) => (
      <img {...props} className="rounded-lg max-w-full" loading="lazy" />
    ),
    a: ({ node, ...props }) => (
      <a {...props} className="text-primary underline" target="_blank" rel="noopener" />
    ),
  }}
>
  {content}
</ReactMarkdown>
```

### Editor Features

- Split view: editor | preview
- Toolbar buttons for formatting
- Image paste support (upload to storage)
- Keyboard shortcuts
- Auto-save drafts to localStorage

---

## 14. Drag-and-Drop System

### Using dnd-kit

```tsx
// SortableItem.tsx
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export function SortableItem({ item }: { item: CollectionItem }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Card item={item} />
    </div>
  );
}
```

### Accessibility

- Keyboard navigation (Tab + Space to drag)
- Screen reader announcements for reorder
- Focus indicators

---

## 15. Testing Strategy

### Testing Pyramid

```
        /\
       /  \     E2E (Playwright)
      /----\    10 tests
     /      \
    /--------\  Integration
   /          \  50 tests
  /            \
 /--------------\  Unit
  200 tests
```

### Unit Tests (Vitest)

```ts
// apps/frontend/src/lib/__tests__/utils.test.ts
import { describe, it, expect } from 'vitest';
import { getLocalizedValue } from '../utils';

describe('getLocalizedValue', () => {
  it('returns correct locale value', () => {
    const obj = { ru: 'Привет', en: 'Hello' };
    expect(getLocalizedValue(obj, 'ru')).toBe('Привет');
  });

  it('falls back to en', () => {
    const obj = { ru: 'Привет' };
    expect(getLocalizedValue(obj, 'en')).toBe('Привет');
  });

  it('returns first value if locale missing', () => {
    const obj = { ru: 'Привет' };
    expect(getLocalizedValue(obj, 'de')).toBe('Привет');
  });
});
```

### Integration Tests (Vitest + MSW)

```ts
// apps/frontend/src/api/__tests__/tours.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { useTours } from '../tours';

describe('useTours', () => {
  it('fetches tours list', async () => {
    const { result } = renderHook(() => useTours());
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeDefined();
  });
});
```

### E2E Tests (Playwright)

```ts
// apps/frontend/e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

test('admin login flow', async ({ page }) => {
  await page.goto('/admin/login');
  await page.fill('[name="email"]', 'admin@example.com');
  await page.fill('[name="password"]', 'securepassword');
  await page.click('[type="submit"]');
  await expect(page).toHaveURL('/admin/dashboard');
});
```

### Test Coverage Targets

- Unit: 80% coverage for utils, hooks, stores
- Integration: All API endpoints
- E2E: Critical user flows (login, CRUD operations)

---

## 16. Monitoring & Logging

### Logging (Backend)

```ts
// apps/backend/src/app.ts
const app = Fastify({
  logger: {
    level: process.env.LOG_LEVEL ?? 'info',
    transport: process.env.NODE_ENV === 'production'
      ? { target: 'pino-elasticsearch', options: { node: process.env.ES_NODE } }
      : undefined,
  },
});

// Log levels: error, warn, info, debug
// Include: timestamp, requestId, userId, duration, statusCode
```

### Error Tracking (Frontend)

```ts
// Sentry integration
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  integrations: [new Sentry.BrowserTracing()],
});
```

### Health Checks

```ts
// GET /health
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00Z",
  "uptime": 86400,
  "version": "1.0.0",
  "checks": {
    "database": "ok",
    "storage": "ok"
  }
}
```

---

## 17. CI/CD Pipeline

### GitHub Actions Workflow

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm lint

  typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm typecheck

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm test

  build:
    needs: [lint, typecheck, test]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm build
      - uses: actions/upload-artifact@v4
        with:
          name: dist
          path: apps/frontend/dist

  e2e:
    needs: [build]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm build
      - run: pnpm test:e2e
```

### Deployment Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v4
      - uses: railway deploying/setup@v1
        with:
          token: ${{ secrets.RAILWAY_TOKEN }}
      - run: railway up
      - run: railway variables set NODE_ENV=production

  deploy-frontend:
    needs: deploy-backend
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: cloudflare/pages/action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: dark-angels
```

---

## 18. Environment Variables

### Backend (.env)

```env
# Server
NODE_ENV=development
PORT=3000
API_VERSION=v1

# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_KEY=xxx

# Auth
JWT_SECRET=xxx
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d

# Security
BCRYPT_ROUNDS=12
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW_MS=60000

# Optional
SENTRY_DSN=xxx
ES_NODE=http://localhost:9200
LOG_LEVEL=info
```

### Frontend (.env)

```env
# API
VITE_API_URL=http://localhost:3000/api/v1

# Supabase
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxx

# Telegram
VITE_TELEGRAM_BOT_NAME=darkangels_bot

# Optional
VITE_SENTRY_DSN=xxx
VITE_SENTRY_TRACES_SAMPLE_RATE=0.1
```

---

## 19. Security Checklist

### Authentication
- [x] JWT with short expiry (15min)
- [x] Refresh tokens stored hashed in DB
- [x] bcrypt password hashing (cost 12)
- [x] 2FA with TOTP
- [x] Recovery codes
- [x] Account lockout (5 failed attempts)
- [x] Secure HTTP-only cookies

### API Security
- [x] Rate limiting per endpoint
- [x] CORS with allowed origins
- [x] Input validation (Zod)
- [x] SQL injection prevention (parameterized queries)
- [x] XSS prevention (sanitization)
- [x] CSRF protection
- [x] Secure headers (Helmet)

### File Upload
- [x] MIME type validation
- [x] File size limits
- [x] Image compression
- [x] Unique filename generation
- [x] Storage bucket isolation

### Infrastructure
- [ ] Database SSL connections
- [ ] Environment secrets management
- [ ] Backup strategy
- [ ] DDoS protection (Cloudflare)
- [ ] SSL/TLS certificates

---

## 20. Implementation Roadmap

### Phase 1: Foundation (Week 1-2)
- [ ] Project setup (monorepo, configs)
- [ ] Supabase project + migrations
- [ ] Basic backend with auth
- [ ] Basic frontend with routing
- [ ] Telegram SDK integration

### Phase 2: Core Features (Week 3-4)
- [ ] Tours CRUD + list
- [ ] Services CRUD + list
- [ ] Blog CRUD + markdown
- [ ] Homepage collections
- [ ] Drag-and-drop sorting

### Phase 3: Polish (Week 5-6)
- [ ] 2FA for admin
- [ ] Image upload system
- [ ] i18n implementation
- [ ] VIP content system
- [ ] UI/UX refinement

### Phase 4: Testing & Deploy (Week 7-8)
- [ ] Unit tests (80% coverage)
- [ ] Integration tests
- [ ] E2E tests
- [ ] CI/CD setup
- [ ] Production deployment
- [ ] Monitoring setup

### Phase 5: Launch (Week 9+)
- [ ] Beta testing
- [ ] Performance optimization
- [ ] SEO (Telegram Open Graph)
- [ ] Analytics
- [ ] Launch

---

## Changelog

### v2.1 (2026-05-21)
- Monorepo scaffolded: pnpm workspace, types/shared/config packages, backend/frontend skeletons
- Supabase initial migration: all 6 tables + indexes + updated_at triggers
- Supabase client integration: Fastify plugin with service key, health check includes DB status
- Seed data: test admin, sample tours/services/blog articles + homepage collections

### v2.0 (2026-05-18)
- JSON-based localization replacing `*_ru/*_en` fields
- VIP Access System with subscription states
- Admin 2FA (TOTP) + recovery codes
- Testing strategy (unit/integration/e2e)
- Monitoring & CI/CD sections
- Rate limiting table
- tRPC consideration documented