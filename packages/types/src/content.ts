import type { LocalizedString } from './localization.js';
import type { AccessLevel } from './auth.js';

export interface Tour {
  id: string;
  title: LocalizedString;
  description: LocalizedString;
  country: LocalizedString;
  city: LocalizedString;
  agency: LocalizedString;
  earnings: string | null;
  contacts: string | null;
  is_vip: boolean;
  hidden_vip: boolean;
  tags: string[];
  image_url: string | null;
  sort_order: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: string;
  title: LocalizedString;
  description: LocalizedString;
  price: string | null;
  contacts: string | null;
  tags: string[];
  image_url: string | null;
  sort_order: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface BlogArticle {
  id: string;
  title: LocalizedString;
  content: LocalizedString;
  preview_image: string | null;
  tags: string[];
  hidden_vip: boolean;
  access_level: AccessLevel;
  sort_order: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export type ContentType = 'tour' | 'service' | 'blog';

export type ContentItem = Tour | Service | BlogArticle;
