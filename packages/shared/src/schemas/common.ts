import { z } from 'zod';

export const localizedStringSchema = z.object({
  ru: z.string(),
  en: z.string(),
}).passthrough();

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort_by: z.string().optional(),
  sort_order: z.enum(['asc', 'desc']).default('desc'),
});
