import 'fastify';
import '@fastify/jwt';

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (
      request: FastifyRequest,
      reply: FastifyReply
    ) => Promise<void>;
  }
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: { sub: string; email?: string; purpose?: string; telegram_id?: number; is_subscribed?: boolean; access_level?: string };
    user: { sub: string; email?: string; purpose?: string; telegram_id?: number; is_subscribed?: boolean; access_level?: string };
  }
}
