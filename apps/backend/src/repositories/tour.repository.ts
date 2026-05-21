import type { FastifyInstance } from 'fastify';

export function createTourRepository(app: FastifyInstance) {
  const db = app.supabase;

  return {
    async findAll(options: {
      page: number;
      limit: number;
      sort_order?: 'asc' | 'desc';
      tags?: string[];
      is_vip?: boolean;
      search?: string;
    }) {
      const { page, limit, sort_order = 'asc', tags, is_vip, search } = options;
      const offset = (page - 1) * limit;

      let query = db.from('tours').select('*', { count: 'exact' });

      if (search) {
        const escaped = search.replace(/%/g, '\\%').replace(/_/g, '\\_');
        query = query.or(`title->>ru.ilike.%${escaped}%,title->>en.ilike.%${escaped}%`);
      }

      if (tags && tags.length > 0) {
        query = query.contains('tags', tags);
      }

      if (is_vip !== undefined) {
        query = query.eq('is_vip', is_vip);
      }

      query = query
        .order('sort_order', { ascending: sort_order === 'asc' })
        .range(offset, offset + limit - 1);

      const { data, count, error } = await query;
      if (error) throw error;

      return { data: data ?? [], count: count ?? 0 };
    },

    async findById(id: string) {
      const { data, error } = await db.from('tours').select('*').eq('id', id).single();
      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }
      return data;
    },

    async findFeatured() {
      const { data, error } = await db
        .from('tours')
        .select('*')
        .eq('is_published', true)
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return data ?? [];
    },

    async create(data: Record<string, unknown>) {
      const { data: created, error } = await db.from('tours').insert(data).select().single();
      if (error) throw error;
      return created;
    },

    async update(id: string, data: Record<string, unknown>) {
      const { data: updated, error } = await db
        .from('tours')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return updated;
    },

    async delete(id: string) {
      const { error } = await db.from('tours').delete().eq('id', id);
      if (error) throw error;
    },

    async reorder(id: string, sortOrder: number) {
      const { data: updated, error } = await db
        .from('tours')
        .update({ sort_order: sortOrder })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return updated;
    },

    async updatePublishStatus(id: string, isPublished: boolean) {
      const { data: updated, error } = await db
        .from('tours')
        .update({ is_published: isPublished })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return updated;
    },
  };
}

export type TourRepository = ReturnType<typeof createTourRepository>;