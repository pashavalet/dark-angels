import type { FastifyInstance } from 'fastify';

export interface HomepageCollectionRow {
  id: string;
  section: string;
  item_id: string;
  item_type: 'tour' | 'service' | 'blog';
  sort_order: number;
  is_pinned: boolean;
  created_at: string;
}

export interface HomepageCollectionItem {
  collection_id: string;
  is_pinned: boolean;
  [key: string]: unknown;
}

const TOUR_SELECT = 'id, title, description, country, city, agency, earnings, contacts, is_vip, tags, image_url, sort_order';
const SERVICE_SELECT = 'id, title, description, price, contacts, tags, image_url, sort_order';
const BLOG_SELECT = 'id, title, content, preview_image, tags, access_level, sort_order';

export function createHomepageRepository(app: FastifyInstance) {
  const db = app.supabase;

  return {
    async getCollections(): Promise<Record<string, HomepageCollectionItem[]>> {
      const { data: collections, error } = await db
        .from('homepage_collections')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      if (!collections || collections.length === 0) {
        return { featured_tours: [], featured_services: [], featured_blog: [] };
      }

      const rows = collections as HomepageCollectionRow[];

      const byType = new Map<string, HomepageCollectionRow[]>();
      for (const row of rows) {
        const list = byType.get(row.item_type) ?? [];
        list.push(row);
        byType.set(row.item_type, list);
      }

      const contentMap = new Map<string, Record<string, unknown>>();

      for (const [itemType, items] of byType) {
        const ids = [...new Set(items.map((i) => i.item_id))];
        if (ids.length === 0) continue;

        if (itemType === 'tour') {
          const { data: tours, error: tourErr } = await db
            .from('tours')
            .select(TOUR_SELECT)
            .in('id', ids);
          if (tourErr) throw tourErr;
          for (const t of (tours ?? []) as Record<string, unknown>[]) {
            contentMap.set(t.id as string, t);
          }
        } else if (itemType === 'service') {
          const { data: services, error: svcErr } = await db
            .from('services')
            .select(SERVICE_SELECT)
            .in('id', ids);
          if (svcErr) throw svcErr;
          for (const s of (services ?? []) as Record<string, unknown>[]) {
            contentMap.set(s.id as string, s);
          }
        } else if (itemType === 'blog') {
          const { data: blogs, error: blogErr } = await db
            .from('blog_articles')
            .select(BLOG_SELECT)
            .in('id', ids);
          if (blogErr) throw blogErr;
          for (const b of (blogs ?? []) as Record<string, unknown>[]) {
            contentMap.set(b.id as string, b);
          }
        }
      }

      const result: Record<string, HomepageCollectionItem[]> = {
        featured_tours: [],
        featured_services: [],
        featured_blog: [],
      };

      for (const row of rows) {
        const content = contentMap.get(row.item_id);
        if (!content) continue;
        const list = result[row.section];
        if (list) {
          list.push({ ...content, collection_id: row.id, is_pinned: row.is_pinned });
        }
      }

      return result;
    },

    async getCollectionIds(section: string) {
      const { data, error } = await db
        .from('homepage_collections')
        .select('item_id, item_type, sort_order')
        .eq('section', section)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return (data ?? []) as { item_id: string; item_type: string; sort_order: number }[];
    },

    async setCollections(
      section: string,
      items: { item_id: string; item_type: string; sort_order: number; is_pinned: boolean }[]
    ) {
      const { error: delErr } = await db
        .from('homepage_collections')
        .delete()
        .eq('section', section);

      if (delErr) throw delErr;

      if (items.length === 0) return;

      const rows = items.map((item) => ({
        section,
        item_id: item.item_id,
        item_type: item.item_type,
        sort_order: item.sort_order,
        is_pinned: item.is_pinned,
      }));

      const { data, error: insErr } = await db
        .from('homepage_collections')
        .insert(rows)
        .select();

      if (insErr) throw insErr;
      return data;
    },

    async reorderItems(section: string, orders: { id: string; sort_order: number }[]) {
      for (const order of orders) {
        const { error } = await db
          .from('homepage_collections')
          .update({ sort_order: order.sort_order })
          .eq('id', order.id);

        if (error) throw error;
      }
    },

    async pinItem(collectionId: string, isPinned: boolean) {
      const { data, error } = await db
        .from('homepage_collections')
        .update({ is_pinned: isPinned })
        .eq('id', collectionId)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }
      return data;
    },
  };
}

export type HomepageRepository = ReturnType<typeof createHomepageRepository>;
