import type { FastifyInstance } from 'fastify';
import crypto from 'node:crypto';
import { z } from 'zod';

const telegramUsersQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  subscribed: z.coerce.boolean().optional(),
  premium: z.coerce.boolean().optional(),
  language: z.string().optional(),
  search: z.string().optional(),
});

export default async function adminRoutes(app: FastifyInstance) {
  const db = app.supabase;
  const requireAdmin = async (request: any, reply: any) => {
    const isAdmin = Boolean(request.user?.email) || request.user?.is_admin === true;
    if (!isAdmin) {
      return reply.code(403).send({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Admin access required' },
      });
    }
  };

  app.get('/stats', { onRequest: [app.authenticate, requireAdmin] }, async () => {
    const [tours, services, blog, telegramUsers] = await Promise.all([
      db.from('tours').select('id', { count: 'exact', head: true }),
      db.from('services').select('id', { count: 'exact', head: true }),
      db.from('blog_articles').select('id', { count: 'exact', head: true }),
      db.from('telegram_users').select('telegram_id', { count: 'exact', head: true }),
    ]);

    const counts = {
      tours: tours.count ?? 0,
      services: services.count ?? 0,
      blog: blog.count ?? 0,
      telegram_users: telegramUsers.count ?? 0,
    };

    const [recentTours, recentServices, recentBlog] = await Promise.all([
      db.from('tours').select('id, title, created_at').order('created_at', { ascending: false }).limit(5),
      db.from('services').select('id, title, created_at').order('created_at', { ascending: false }).limit(5),
      db.from('blog_articles').select('id, title, created_at').order('created_at', { ascending: false }).limit(5),
    ]);

    const since7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const since30d = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const [activityAll, activity7d, activity30d] = await Promise.all([
      db.from('user_activity').select('telegram_id, page, item_type, created_at').order('created_at', { ascending: false }).limit(5000),
      db.from('user_activity').select('telegram_id, created_at').gte('created_at', since7d),
      db.from('user_activity').select('telegram_id, created_at').gte('created_at', since30d),
    ]);

    const interactions = activityAll.data ?? [];

    const pageBreakdown = interactions.reduce((acc: Record<string, number>, row: any) => {
      const key = row.page ?? 'unknown';
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {});

    const typeBreakdown = interactions.reduce((acc: Record<string, number>, row: any) => {
      const key = row.item_type ?? 'page';
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {});

    const dailyMap = interactions.reduce((acc: Record<string, number>, row: any) => {
      const day = String(row.created_at).slice(0, 10);
      acc[day] = (acc[day] ?? 0) + 1;
      return acc;
    }, {});

    const daily = Object.entries(dailyMap)
      .map(([day, count]) => ({ day, count }))
      .sort((a, b) => a.day.localeCompare(b.day))
      .slice(-14);

    const uniqueUsers = new Set(interactions.map((a: any) => a.telegram_id)).size;
    const uniqueUsers7d = new Set((activity7d.data ?? []).map((a: any) => a.telegram_id)).size;
    const uniqueUsers30d = new Set((activity30d.data ?? []).map((a: any) => a.telegram_id)).size;

    const topPages = Object.entries(pageBreakdown)
      .map(([page, count]) => ({ page, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    return {
      success: true,
      data: {
        counts,
        analytics: {
          total_interactions: interactions.length,
          unique_users: uniqueUsers,
          unique_users_7d: uniqueUsers7d,
          unique_users_30d: uniqueUsers30d,
          top_pages: topPages,
          type_breakdown: typeBreakdown,
          daily_interactions: daily,
        },
        recent: {
          tours: recentTours.data ?? [],
          services: recentServices.data ?? [],
          blog: recentBlog.data ?? [],
        },
      },
    };
  });

  app.get('/telegram-users', { onRequest: [app.authenticate, requireAdmin] }, async (request) => {
    const query = telegramUsersQuerySchema.parse(request.query);
    const offset = (query.page - 1) * query.limit;

    let q = db.from('telegram_users').select('*', { count: 'exact' });

    if (query.subscribed !== undefined) {
      q = q.eq('is_channel_subscriber', query.subscribed);
    }
    if (query.premium !== undefined) {
      q = q.eq('is_premium', query.premium);
    }
    if (query.language) {
      q = q.eq('language_code', query.language);
    }
    if (query.search) {
      const s = query.search.replace(/%/g, '\\%').replace(/_/g, '\\_');
      q = q.or(
        `username.ilike.%${s}%,first_name.ilike.%${s}%,last_name.ilike.%${s}%`,
      );
    }

    q = q
      .order('last_seen_at', { ascending: false })
      .range(offset, offset + query.limit - 1);

    const { data, count, error } = await q;
    if (error) throw error;

    return {
      success: true,
      data: data ?? [],
      meta: {
        page: query.page,
        limit: query.limit,
        total: count ?? 0,
        totalPages: Math.ceil((count ?? 0) / query.limit),
      },
    };
  });

  app.get('/telegram-users/download', { onRequest: [app.authenticate, requireAdmin] }, async (request, reply) => {
    const query = telegramUsersQuerySchema.parse(request.query);

    let q = db.from('telegram_users').select('*', { count: 'exact' });

    if (query.subscribed !== undefined) {
      q = q.eq('is_channel_subscriber', query.subscribed);
    }
    if (query.premium !== undefined) {
      q = q.eq('is_premium', query.premium);
    }
    if (query.language) {
      q = q.eq('language_code', query.language);
    }
    if (query.search) {
      const s = query.search.replace(/%/g, '\\%').replace(/_/g, '\\_');
      q = q.or(
        `username.ilike.%${s}%,first_name.ilike.%${s}%,last_name.ilike.%${s}%`,
      );
    }

    q = q.order('last_seen_at', { ascending: false });

    const { data, error } = await q;
    if (error) throw error;

    const users = data ?? [];

    const header = 'telegram_id,username,first_name,last_name,language_code,is_premium,is_channel_subscriber,access_level,first_seen_at,last_seen_at';
    const rows = users.map((u: any) =>
      [
        u.telegram_id,
        u.username ?? '',
        u.first_name ?? '',
        u.last_name ?? '',
        u.language_code ?? '',
        u.is_premium,
        u.is_channel_subscriber,
        u.access_level,
        u.first_seen_at,
        u.last_seen_at,
      ].join(','),
    );
    const csv = [header, ...rows].join('\n');

    reply.header('Content-Type', 'text/csv');
    reply.header('Content-Disposition', 'attachment; filename="telegram-users.csv"');
    return reply.send(csv);
  });

  app.get('/telegram-users/:telegramId', { onRequest: [app.authenticate, requireAdmin] }, async (request, reply) => {
    const { telegramId } = request.params as { telegramId: string };
    const id = Number(telegramId);
    if (Number.isNaN(id)) {
      return reply.code(400).send({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid telegram_id' },
      });
    }

    const { data: user, error: userError } = await db
      .from('telegram_users')
      .select('*')
      .eq('telegram_id', id)
      .single();

    if (userError || !user) {
      return reply.code(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Telegram user not found' },
      });
    }

    const { data: activity, error: activityError } = await db
      .from('user_activity')
      .select('*')
      .eq('telegram_id', id)
      .order('created_at', { ascending: false })
      .limit(200);

    if (activityError) throw activityError;

    const grouped = (activity ?? []).reduce(
      (acc: Record<string, number>, a: any) => {
        const page = a.page || 'unknown';
        acc[page] = (acc[page] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    return {
      success: true,
      data: {
        user,
        activity: activity ?? [],
        stats: {
          total_interactions: activity?.length ?? 0,
          unique_pages: Object.keys(grouped).length,
          page_breakdown: grouped,
        },
      },
    };
  });

  app.post('/telegram-link-code', { onRequest: [app.authenticate, requireAdmin] }, async (request, reply) => {
    const adminId = request.user.sub;
    const code = crypto.randomBytes(4).toString('hex').toUpperCase().slice(0, 7);

    const { error } = await app.supabase.from('telegram_link_codes').insert({
      admin_id: adminId,
      code,
      expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
    });

    if (error) {
      return reply.code(500).send({
        success: false,
        error: { code: 'INTERNAL', message: 'Failed to generate link code' },
      });
    }

    return {
      success: true,
      data: { code, expires_in_minutes: 10 },
    };
  });

  app.get('/telegram-link-status', { onRequest: [app.authenticate, requireAdmin] }, async (request) => {
    const adminId = request.user.sub;

    const { data } = await app.supabase
      .from('admins')
      .select('telegram_id')
      .eq('id', adminId)
      .maybeSingle();

    return {
      success: true,
      data: { linked: !!data?.telegram_id, telegram_id: data?.telegram_id ?? null },
    };
  });
}
