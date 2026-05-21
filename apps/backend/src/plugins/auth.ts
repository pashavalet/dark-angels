import fp from 'fastify-plugin';

export default fp(async (fastify) => {
  fastify.decorate('authenticate', async function (request: any, reply: any) {
    try {
      await request.jwtVerify();
    } catch {
      return reply.code(401).send({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Invalid or expired access token' },
      });
    }
  });
}, {
  name: 'auth-plugin',
  dependencies: ['@fastify/jwt'],
});