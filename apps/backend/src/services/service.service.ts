import type { FastifyInstance } from 'fastify';
import type { CreateServiceInput, UpdateServiceInput } from '@dark-angels/shared';
import { createServiceRepository } from '../repositories/service.repository.js';
import { translateLocalizedFields } from '../lib/translate.js';

const SERVICE_LOCALIZED_FIELDS = ['title', 'description'];

export function createServiceService(app: FastifyInstance) {
  const repo = createServiceRepository(app);

  return {
    async findAll(options: {
      page: number;
      limit: number;
      sort_order?: 'asc' | 'desc';
      tags?: string[];
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

    async create(data: CreateServiceInput) {
      const record = data as Record<string, unknown>;
      await translateLocalizedFields(record, SERVICE_LOCALIZED_FIELDS);
      return repo.create(record);
    },

    async update(id: string, data: UpdateServiceInput) {
      const existing = await repo.findById(id);
      if (!existing) return null;
      const record = data as Record<string, unknown>;
      await translateLocalizedFields(record, SERVICE_LOCALIZED_FIELDS);
      return repo.update(id, record);
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

export type ServiceService = ReturnType<typeof createServiceService>;
