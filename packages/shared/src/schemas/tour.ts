import { z } from 'zod';
import { localizedStringSchema } from './common.js';

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
  image_url: z.string().url().optional().nullable(),
});

export const updateTourSchema = createTourSchema.partial();

export type CreateTourInput = z.infer<typeof createTourSchema>;
export type UpdateTourInput = z.infer<typeof updateTourSchema>;
