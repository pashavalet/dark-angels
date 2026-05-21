import type { FastifyInstance } from 'fastify';

export function createServiceRepository(app: FastifyInstance) {
  const db = app.supabase;

  return {
    async findAll(options: {
      page: number;
      limit: number;
      sort_order?: 'asc' | 'desc';
      tags?: string[];
      search?: string;
    }) {
      const { page, limit, sort_order = 'asc', tags, search } = options;
      const offset = (page - 1) * limit;

      let query = db.from('services').select('*', { count: 'exact' });

      if (search) {
        const escaped = search.replace(/%/g, '\\%').replace(/_/g, '\\_');
        query = query.or(`title->>ru.ilike.%${escaped}%,title->>en.ilike.%${escaped}%`);
      }

      if (tags && tags.length > 0) {
        query = query.contains('tags', tags);
      }

      query = query
        .order('sort_order', { ascending: sort_order === 'asc' })
        .range(offset, offset + limit - 1);

      const { data, count, error } = await query;
      if (error) throw error;

      return { data: data ?? [], count: count ?? 0 };
    },

    async findById(id: string) {
      const { data, error } = await db.from('services').select('*').eq('id', id).single();
      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }
      return data;
    },

    async findFeatured() {
      const { data, error } = await db
        .from('services')
        .select('*')
        .eq('is_published', true)
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return data ?? [];
    },

    async create(data: Record<string, unknown>) {
      const { data: created, error } = await db.from('services').insert(data).select().single();
      if (error) throw error;
      return created;
    },

    async update(id: string, data: Record<string, unknown>) {
      const { data: updated, error } = await db
        .from('services')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return updated;
    },

    async delete(id: string) {
      const { error } = await db.from('services').delete().eq('id', id);
      if (error) throw error;
    },

    async reorder(id: string, sortOrder: number) {
      const { data: updated, error } = await db
        .from('services')
        .update({ sort_order: sortOrder })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return updated;
    },

    async updatePublishStatus(id: string, isPublished: boolean) {
      const { data: updated, error } = await db
        .from('services')
        .update({ is_published: isPublished })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return updated;
    },
  };
}

export type ServiceRepository = ReturnType<typeof createServiceRepository>;
