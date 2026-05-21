import type { FastifyInstance } from 'fastify';
import type { CreateTourInput, UpdateTourInput } from '@dark-angels/shared';
import { createTourRepository } from '../repositories/tour.repository.js';

export function createTourService(app: FastifyInstance) {
  const repo = createTourRepository(app);

  return {
    async findAll(options: {
      page: number;
      limit: number;
      sort_order?: 'asc' | 'desc';
      tags?: string[];
      is_vip?: boolean;
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

    async create(data: CreateTourInput) {
      return repo.create(data as Record<string, unknown>);
    },

    async update(id: string, data: UpdateTourInput) {
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

export type TourService = ReturnType<typeof createTourService>;