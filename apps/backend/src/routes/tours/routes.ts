import type { FastifyInstance } from 'fastify';
import { createTourSchema, updateTourSchema, paginationSchema } from '@dark-angels/shared';
import { z } from 'zod';
import { createTourService } from '../../services/tour.service.js';

const tourQuerySchema = paginationSchema.extend({
  tags: z.string().optional(),
  is_vip: z.coerce.boolean().optional(),
  search: z.string().optional(),
  sort_order: z.enum(['asc', 'desc']).default('asc'),
});

const reorderSchema = z.object({
  sort_order: z.number().int().min(0),
});

const publishSchema = z.object({
  is_published: z.boolean(),
});

export default async function tourRoutes(app: FastifyInstance) {
  const service = createTourService(app);

  app.get('/', async (request) => {
    let isAdmin = false;
    try { await request.jwtVerify(); isAdmin = true; } catch { /* no auth */ }
    const hideVip = !isAdmin;

    const query = tourQuerySchema.parse(request.query);
    const tags = query.tags
      ? query.tags.split(',').map((t) => t.trim()).filter(Boolean)
      : undefined;

    const result = await service.findAll({
      page: query.page,
      limit: query.limit,
      sort_order: query.sort_order,
      tags,
      is_vip: query.is_vip,
      search: query.search,
      hideVip,
    });

    return { success: true, data: result.data, meta: result.meta };
  });

  app.get('/featured', async (request) => {
    let isAdmin = false;
    try { await request.jwtVerify(); isAdmin = true; } catch { /* no auth */ }
    const hideVip = !isAdmin;

    const data = await service.findFeatured(hideVip);
    return { success: true, data };
  });

  app.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const tour = await service.findById(id);
    if (!tour) {
      return reply.code(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Tour not found' },
      });
    }
    return { success: true, data: tour };
  });

  app.post('/', { onRequest: [app.authenticate] }, async (request, reply) => {
    const body = createTourSchema.parse(request.body);
    const tour = await service.create(body);
    return reply.code(201).send({ success: true, data: tour });
  });

  app.put('/:id', { onRequest: [app.authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = updateTourSchema.parse(request.body);
    const tour = await service.update(id, body);
    if (!tour) {
      return reply.code(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Tour not found' },
      });
    }
    return { success: true, data: tour };
  });

  app.delete('/:id', { onRequest: [app.authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const deleted = await service.delete(id);
    if (!deleted) {
      return reply.code(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Tour not found' },
      });
    }
    return { success: true, data: { message: 'Tour deleted' } };
  });

  app.patch('/:id/publish', { onRequest: [app.authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const { is_published } = publishSchema.parse(request.body);
    const tour = await service.updatePublishStatus(id, is_published);
    if (!tour) {
      return reply.code(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Tour not found' },
      });
    }
    return { success: true, data: tour };
  });

  app.patch('/:id/reorder', { onRequest: [app.authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const { sort_order } = reorderSchema.parse(request.body);
    const tour = await service.reorder(id, sort_order);
    if (!tour) {
      return reply.code(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Tour not found' },
      });
    }
    return { success: true, data: tour };
  });
}