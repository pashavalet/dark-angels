import type { FastifyInstance } from 'fastify';
import { createHomepageRepository } from '../repositories/homepage.repository.js';

export function createHomepageService(app: FastifyInstance) {
  const repo = createHomepageRepository(app);

  return {
    async getCollections(publicOnly?: boolean) {
      return repo.getCollections(publicOnly);
    },

    async getCollectionIds(section: string) {
      return repo.getCollectionIds(section);
    },

    async setCollections(
      section: string,
      items: { item_id: string; item_type: string; sort_order: number; is_pinned: boolean }[]
    ) {
      return repo.setCollections(section, items);
    },

    async reorderItems(section: string, orders: { id: string; sort_order: number }[]) {
      return repo.reorderItems(section, orders);
    },

    async pinItem(collectionId: string, isPinned: boolean) {
      const existing = await repo.pinItem(collectionId, isPinned);
      return existing;
    },
  };
}

export type HomepageService = ReturnType<typeof createHomepageService>;
