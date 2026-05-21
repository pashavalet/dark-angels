import type { FastifyInstance } from 'fastify';
import type { CreateBlogInput, UpdateBlogInput } from '@dark-angels/shared';
import { createBlogRepository } from '../repositories/blog.repository.js';

export function createBlogService(app: FastifyInstance) {
  const repo = createBlogRepository(app);

  return {
    async findAll(options: {
      page: number;
      limit: number;
      sort_order?: 'asc' | 'desc';
      tags?: string[];
      access_level?: string;
      search?: string;
    }) {
      const result = await repo.findAll(options);
      return {
        data: result.data,
        meta: {
          page: options.page,
          limit: options.limit,
          total: result.count,
          totalPages: Math.ceil(result.count / options.limit),
        },
      };
    },

    async findById(id: string) {
      return repo.findById(id);
    },

    async findFeatured() {
      return repo.findFeatured();
    },

    async create(data: CreateBlogInput) {
      return repo.create(data as Record<string, unknown>);
    },

    async update(id: string, data: UpdateBlogInput) {
      const existing = await repo.findById(id);
      if (!existing) return null;
      return repo.update(id, data as Record<string, unknown>);
    },

    async delete(id: string) {
      const existing = await repo.findById(id);
      if (!existing) return false;
      await repo.delete(id);
      return true;
    },

    async reorder(id: string, sortOrder: number) {
      const existing = await repo.findById(id);
      if (!existing) return null;
      return repo.reorder(id, sortOrder);
    },

    async updatePublishStatus(id: string, isPublished: boolean) {
      const existing = await repo.findById(id);
      if (!existing) return null;
      return repo.updatePublishStatus(id, isPublished);
    },
  };
}

export type BlogService = ReturnType<typeof createBlogService>;
