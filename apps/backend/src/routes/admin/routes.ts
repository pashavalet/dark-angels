import type { FastifyInstance } from 'fastify';

export default async function adminRoutes(app: FastifyInstance) {
  const db = app.supabase;

  app.get('/stats', { onRequest: [app.authenticate] }, async () => {
    const [tours, services, blog] = await Promise.all([
      db.from('tours').select('id', { count: 'exact', head: true }),
      db.from('services').select('id', { count: 'exact', head: true }),
      db.from('blog_articles').select('id', { count: 'exact', head: true }),
    ]);

    const counts = {
      tours: tours.count ?? 0,
      services: services.count ?? 0,
      blog: blog.count ?? 0,
    };

    const [recentTours, recentServices, recentBlog] = await Promise.all([
      db.from('tours').select('id, title, created_at').order('created_at', { ascending: false }).limit(5),
      db.from('services').select('id, title, created_at').order('created_at', { ascending: false }).limit(5),
      db.from('blog_articles').select('id, title, created_at').order('created_at', { ascending: false }).limit(5),
    ]);

    return {
      success: true,
      data: {
        counts,
        recent: {
          tours: recentTours.data ?? [],
          services: recentServices.data ?? [],
          blog: recentBlog.data ?? [],
        },
      },
    };
  });
}