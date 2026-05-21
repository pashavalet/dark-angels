import type { FastifyInstance } from 'fastify';
import { createBlogSchema, updateBlogSchema, paginationSchema } from '@dark-angels/shared';
import { z } from 'zod';
import { createBlogService } from '../../services/blog.service.js';

const blogQuerySchema = paginationSchema.extend({
  tags: z.string().optional(),
  access_level: z.string().optional(),
  search: z.string().optional(),
  sort_order: z.enum(['asc', 'desc']).default('asc'),
});

const reorderSchema = z.object({
  sort_order: z.number().int().min(0),
});

const publishSchema = z.object({
  is_published: z.boolean(),
});

export default async function blogRoutes(app: FastifyInstance) {
  const service = createBlogService(app);

  app.get('/', async (request) => {
    const query = blogQuerySchema.parse(request.query);
    const tags = query.tags
      ? query.tags.split(',').map((t) => t.trim()).filter(Boolean)
      : undefined;

    const result = await service.findAll({
      page: query.page,
      limit: query.limit,
      sort_order: query.sort_order,
      tags,
      access_level: query.access_level,
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
    const blog = await service.findById(id);
    if (!blog) {
      return reply.code(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Blog article not found' },
      });
    }
    return { success: true, data: blog };
  });

  app.post('/', { onRequest: [app.authenticate] }, async (request, reply) => {
    const body = createBlogSchema.parse(request.body);
    const blog = await service.create(body);
    return reply.code(201).send({ success: true, data: blog });
  });

  app.put('/:id', { onRequest: [app.authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = updateBlogSchema.parse(request.body);
    const blog = await service.update(id, body);
    if (!blog) {
      return reply.code(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Blog article not found' },
      });
    }
    return { success: true, data: blog };
  });

  app.delete('/:id', { onRequest: [app.authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const deleted = await service.delete(id);
    if (!deleted) {
      return reply.code(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Blog article not found' },
      });
    }
    return { success: true, data: { message: 'Blog article deleted' } };
  });

  app.patch('/:id/publish', { onRequest: [app.authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const { is_published } = publishSchema.parse(request.body);
    const blog = await service.updatePublishStatus(id, is_published);
    if (!blog) {
      return reply.code(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Blog article not found' },
      });
    }
    return { success: true, data: blog };
  });

  app.patch('/:id/reorder', { onRequest: [app.authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const { sort_order } = reorderSchema.parse(request.body);
    const blog = await service.reorder(id, sort_order);
    if (!blog) {
      return reply.code(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Blog article not found' },
      });
    }
    return { success: true, data: blog };
  });
}
