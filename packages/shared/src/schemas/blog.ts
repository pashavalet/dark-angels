import { z } from 'zod';
import { localizedStringSchema } from './common.js';

export const createBlogSchema = z.object({
  title: localizedStringSchema,
  content: localizedStringSchema,
  preview_image: z.string().url().optional().nullable(),
  tags: z.array(z.string()).default([]),
  hidden_vip: z.boolean().default(false),
  access_level: z.enum(['public', 'vip', 'premium', 'invite']).default('public'),
});

export const updateBlogSchema = createBlogSchema.partial();

export type CreateBlogInput = z.infer<typeof createBlogSchema>;
export type UpdateBlogInput = z.infer<typeof updateBlogSchema>;
