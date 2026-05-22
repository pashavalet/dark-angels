import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { createHomepageService } from '../../services/homepage.service.js';

const setCollectionsSchema = z.object({
  section: z.enum(['featured_tours', 'featured_services', 'featured_blog']),
  items: z.array(
    z.object({
      item_id: z.string().uuid(),
      item_type: z.enum(['tour', 'service', 'blog']),
      sort_order: z.number().int(),
      is_pinned: z.boolean().default(false),
    })
  ),
});

const reorderSchema = z.object({
  section: z.enum(['featured_tours', 'featured_services', 'featured_blog']),
  orders: z.array(
    z.object({
      id: z.string().uuid(),
      sort_order: z.number().int(),
    })
  ),
});

export default async function homepageRoutes(app: FastifyInstance) {
  const service = createHomepageService(app);

  app.get('/', async (request) => {
    let isAdmin = false;
    try { await request.jwtVerify(); isAdmin = true; } catch { /* no auth */ }

    const data = await service.getCollections(!isAdmin);
    return { success: true, data };
  });

  app.put('/', { onRequest: [app.authenticate] }, async (request) => {
    const { section, items } = setCollectionsSchema.parse(request.body);
    await service.setCollections(section, items);
    return { success: true, data: { message: `Collections updated for section: ${section}` } };
  });

  app.patch('/reorder', { onRequest: [app.authenticate] }, async (request) => {
    const { section, orders } = reorderSchema.parse(request.body);
    await service.reorderItems(section, orders);
    return { success: true, data: { message: `Sort order updated for section: ${section}` } };
  });
}
