import type { FastifyInstance } from 'fastify';

export function createBlogRepository(app: FastifyInstance) {
  const db = app.supabase;

  return {
    async findAll(options: {
      page: number;
      limit: number;
      sort_order?: 'asc' | 'desc';
      tags?: string[];
      access_level?: string;
      search?: string;
      publicOnly?: boolean;
    }) {
      const { page, limit, sort_order = 'asc', tags, access_level, search, publicOnly } = options;
      const offset = (page - 1) * limit;

      let query = db.from('blog_articles').select('*', { count: 'exact' });

      if (search) {
        const escaped = search.replace(/%/g, '\\%').replace(/_/g, '\\_');
        query = query.or(`title->>ru.ilike.%${escaped}%,title->>en.ilike.%${escaped}%`);
      }

      if (tags && tags.length > 0) {
        query = query.contains('tags', tags);
      }

      if (access_level) {
        query = query.eq('access_level', access_level);
      }

      if (publicOnly) {
        query = query.eq('access_level', 'public');
      }

      query = query
        .order('sort_order', { ascending: sort_order === 'asc' })
        .range(offset, offset + limit - 1);

      const { data, count, error } = await query;
      if (error) throw error;

      return { data: data ?? [], count: count ?? 0 };
    },

    async findById(id: string) {
      const { data, error } = await db.from('blog_articles').select('*').eq('id', id).single();
      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }
      return data;
    },

    async findFeatured(publicOnly?: boolean) {
      let query = db
        .from('blog_articles')
        .select('*')
        .eq('is_published', true);

      if (publicOnly) {
        query = query.eq('access_level', 'public');
      }

      query = query.order('sort_order', { ascending: true });

      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },

    async create(data: Record<string, unknown>) {
      const { data: created, error } = await db.from('blog_articles').insert(data).select().single();
      if (error) throw error;
      return created;
    },

    async update(id: string, data: Record<string, unknown>) {
      const { data: updated, error } = await db
        .from('blog_articles')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return updated;
    },

    async delete(id: string) {
      const { error } = await db.from('blog_articles').delete().eq('id', id);
      if (error) throw error;
    },

    async reorder(id: string, sortOrder: number) {
      const { data: updated, error } = await db
        .from('blog_articles')
        .update({ sort_order: sortOrder })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return updated;
    },

    async updatePublishStatus(id: string, isPublished: boolean) {
      const { data: updated, error } = await db
        .from('blog_articles')
        .update({ is_published: isPublished })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return updated;
    },
  };
}

export type BlogRepository = ReturnType<typeof createBlogRepository>;
