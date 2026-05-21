import type { FastifyInstance } from 'fastify';
import { loginSchema, refreshSchema } from '@dark-angels/shared';
import {
  verifyPassword,
  signAccessToken,
  generateRefreshToken,
  hashToken,
  verifyTokenHash,
  getRefreshTokenExpiry,
} from '../../services/auth.service.js';
import { createAuthRepository } from '../../repositories/auth.repository.js';
import { loadEnv } from '../../config/env.js';

export default async function authRoutes(app: FastifyInstance) {
  const repo = createAuthRepository(app);
  const env = loadEnv();

  // POST /login
  app.post('/login', async (request, reply) => {
    const body = loginSchema.parse(request.body);
    const admin = await repo.findByEmail(body.email);

    if (!admin) {
      return reply.code(401).send({ success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid credentials' } });
    }

    if (await repo.isLocked(admin.id)) {
      return reply.code(423).send({ success: false, error: { code: 'FORBIDDEN', message: 'Account locked. Try again in 15 minutes.' } });
    }

    const valid = await verifyPassword(body.password, admin.password_hash);
    if (!valid) {
      await repo.incrementFailedAttempts(admin.id);
      return reply.code(401).send({ success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid credentials' } });
    }

    await repo.updateLastLogin(admin.id);

    const accessToken = signAccessToken(app, { id: admin.id, email: admin.email });
    const refreshToken = generateRefreshToken();
    const refreshHash = hashToken(refreshToken);
    const expiresAt = getRefreshTokenExpiry(env.REFRESH_TOKEN_EXPIRES_IN);

    await repo.storeRefreshToken(admin.id, refreshHash, expiresAt);

    reply.setCookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/api/v1/auth/refresh',
      maxAge: Math.floor((expiresAt.getTime() - Date.now()) / 1000),
    });

    return {
      success: true,
      data: {
        access_token: accessToken,
        admin: { id: admin.id, email: admin.email },
      },
    };
  });

  // POST /refresh
  app.post('/refresh', async (request, reply) => {
    const refreshToken = request.cookies?.refresh_token;
    if (!refreshToken) {
      return reply.code(401).send({ success: false, error: { code: 'UNAUTHORIZED', message: 'No refresh token' } });
    }

    const tokenHash = hashToken(refreshToken);
    const stored = await repo.findRefreshToken(tokenHash);

    if (!stored || new Date(stored.expires_at) < new Date()) {
      if (stored) await repo.deleteRefreshToken(stored.id);
      return reply.code(401).send({ success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid or expired refresh token' } });
    }

    const admin = await repo.findById(stored.admin_id);
    if (!admin) {
      await repo.deleteRefreshToken(stored.id);
      return reply.code(401).send({ success: false, error: { code: 'UNAUTHORIZED', message: 'Admin not found' } });
    }

    // Rotate: delete old, issue new
    await repo.deleteRefreshToken(stored.id);

    const accessToken = signAccessToken(app, { id: admin.id, email: admin.email });
    const newRefreshToken = generateRefreshToken();
    const newHash = hashToken(newRefreshToken);
    const expiresAt = getRefreshTokenExpiry(env.REFRESH_TOKEN_EXPIRES_IN);

    await repo.storeRefreshToken(admin.id, newHash, expiresAt);

    reply.setCookie('refresh_token', newRefreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/api/v1/auth/refresh',
      maxAge: Math.floor((expiresAt.getTime() - Date.now()) / 1000),
    });

    return {
      success: true,
      data: { access_token: accessToken },
    };
  });

  // POST /logout
  app.post('/logout', async (request, reply) => {
    const refreshToken = request.cookies?.refresh_token;
    if (refreshToken) {
      const tokenHash = hashToken(refreshToken);
      const stored = await repo.findRefreshToken(tokenHash);
      if (stored) await repo.deleteRefreshToken(stored.id);
    }

    reply.clearCookie('refresh_token', { path: '/api/v1/auth/refresh' });

    return { success: true, data: { message: 'Logged out' } };
  });
}