import { z } from 'zod';
import { localizedStringSchema } from './common.js';

export const createServiceSchema = z.object({
  title: localizedStringSchema,
  description: localizedStringSchema,
  price: z.string().optional(),
  contacts: z.string().optional(),
  tags: z.array(z.string()).default([]),
  image_url: z.string().url().optional().nullable(),
});

export const updateServiceSchema = createServiceSchema.partial();

export type CreateServiceInput = z.infer<typeof createServiceSchema>;
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>;
