import type { FastifyInstance } from 'fastify';
import { createServiceSchema, updateServiceSchema, paginationSchema } from '@dark-angels/shared';
import { z } from 'zod';
import { createServiceService } from '../../services/service.service.js';

const serviceQuerySchema = paginationSchema.extend({
  tags: z.string().optional(),
  search: z.string().optional(),
  sort_order: z.enum(['asc', 'desc']).default('asc'),
});

const reorderSchema = z.object({
  sort_order: z.number().int().min(0),
});

const publishSchema = z.object({
  is_published: z.boolean(),
});

export default async function serviceRoutes(app: FastifyInstance) {
  const service = createServiceService(app);

  app.get('/', async (request) => {
    const query = serviceQuerySchema.parse(request.query);
    const tags = query.tags
      ? query.tags.split(',').map((t) => t.trim()).filter(Boolean)
      : undefined;

    const result = await service.findAll({
      page: query.page,
      limit: query.limit,
      sort_order: query.sort_order,
      tags,
      search: query.search,
    });

    return { success: true, data: result.data, meta: result.meta };
  });

  app.get('/featured', async () => {
    const data = await service.findFeatured();
    return { success: true, data };
  });

  app.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const item = await service.findById(id);
    if (!item) {
      return reply.code(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Service not found' },
      });
    }
    return { success: true, data: item };
  });

  app.post('/', { onRequest: [app.authenticate] }, async (request, reply) => {
    const body = createServiceSchema.parse(request.body);
    const item = await service.create(body);
    return reply.code(201).send({ success: true, data: item });
  });

  app.put('/:id', { onRequest: [app.authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = updateServiceSchema.parse(request.body);
    const item = await service.update(id, body);
    if (!item) {
      return reply.code(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Service not found' },
      });
    }
    return { success: true, data: item };
  });

  app.delete('/:id', { onRequest: [app.authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const deleted = await service.delete(id);
    if (!deleted) {
      return reply.code(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Service not found' },
      });
    }
    return { success: true, data: { message: 'Service deleted' } };
  });

  app.patch('/:id/publish', { onRequest: [app.authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const { is_published } = publishSchema.parse(request.body);
    const item = await service.updatePublishStatus(id, is_published);
    if (!item) {
      return reply.code(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Service not found' },
      });
    }
    return { success: true, data: item };
  });

  app.patch('/:id/reorder', { onRequest: [app.authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const { sort_order } = reorderSchema.parse(request.body);
    const item = await service.reorder(id, sort_order);
    if (!item) {
      return reply.code(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Service not found' },
      });
    }
    return { success: true, data: item };
  });
}
