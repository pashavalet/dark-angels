import type { FastifyInstance } from 'fastify';
import { loginSchema, refreshSchema, updateEmailSchema, changePasswordSchema } from '@dark-angels/shared';
import {
  verifyPassword,
  hashPassword,
  signAccessToken,
  generateRefreshToken,
  hashToken,
  verifyTokenHash,
  getRefreshTokenExpiry,
  generateTotpSecret,
  generateTotpUri,
  generateQrCode,
  verifyTotpToken,
  generateRecoveryCodes,
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

    if (await repo.isTotpEnabled(admin.id)) {
      const tempToken = app.jwt.sign(
        { sub: admin.id, email: admin.email, purpose: '2fa_challenge' },
        { expiresIn: '5m' },
      );
      return reply.code(200).send({
        success: true,
        data: { requires_2fa: true, temp_token: tempToken },
      });
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

  // POST /2fa/setup
  app.post('/2fa/setup', { onRequest: [app.authenticate] }, async (request) => {
    const adminId = request.user.sub;
    const admin = await repo.findById(adminId);
    if (!admin) {
      return { success: false, error: { code: 'NOT_FOUND', message: 'Admin not found' } };
    }
    const secret = generateTotpSecret();
    await repo.enableTotp(adminId, secret);
    const uri = generateTotpUri(admin.email, secret, env.OTPLIB_ISSUER);
    const qrCode = await generateQrCode(uri);
    return { success: true, data: { secret, qr_code: qrCode } };
  });

  // POST /2fa/verify
  app.post('/2fa/verify', { onRequest: [app.authenticate] }, async (request, reply) => {
    const adminId = request.user.sub;
    const { code } = request.body as { code: string };
    const secret = await repo.getTotpSecret(adminId);
    if (!secret) {
      return reply.code(400).send({ success: false, error: { code: 'VALIDATION_ERROR', message: '2FA not set up' } });
    }
    const valid = await verifyTotpToken(secret, code);
    if (!valid) {
      return reply.code(400).send({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid code' } });
    }
    await repo.confirmTotp(adminId);
    const recoveryCodes = generateRecoveryCodes();
    const hashes = await Promise.all(recoveryCodes.map((c) => hashToken(c)));
    await repo.storeRecoveryCodes(adminId, hashes);
    return { success: true, data: { recovery_codes: recoveryCodes } };
  });

  // POST /2fa/disable
  app.post('/2fa/disable', { onRequest: [app.authenticate] }, async (request, reply) => {
    const adminId = request.user.sub;
    const { code } = request.body as { code: string };
    const secret = await repo.getTotpSecret(adminId);
    if (!secret) {
      return reply.code(400).send({ success: false, error: { code: 'VALIDATION_ERROR', message: '2FA not set up' } });
    }
    const valid = await verifyTotpToken(secret, code);
    if (!valid) {
      return reply.code(400).send({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid code' } });
    }
    await repo.disableTotp(adminId);
    return { success: true, data: { message: '2FA disabled' } };
  });

  // POST /2fa/challenge
  app.post('/2fa/challenge', async (request, reply) => {
    const { temp_token, code } = request.body as { temp_token: string; code: string };
    let payload: { sub: string; email: string; purpose?: string };
    try {
      payload = app.jwt.verify(temp_token) as { sub: string; email: string; purpose?: string };
    } catch {
      return reply.code(401).send({ success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid or expired temp token' } });
    }
    if (payload.purpose !== '2fa_challenge') {
      return reply.code(401).send({ success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid token purpose' } });
    }
    const adminId = payload.sub;
    const admin = await repo.findById(adminId);
    if (!admin) {
      return reply.code(401).send({ success: false, error: { code: 'UNAUTHORIZED', message: 'Admin not found' } });
    }
    const secret = await repo.getTotpSecret(adminId);
    if (!secret) {
      return reply.code(400).send({ success: false, error: { code: 'VALIDATION_ERROR', message: '2FA not set up' } });
    }
    const valid = await verifyTotpToken(secret, code);
    if (!valid) {
      await repo.incrementFailedAttempts(adminId);
      return reply.code(401).send({ success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid TOTP code' } });
    }

    await repo.updateLastLogin(adminId);

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

  // POST /recovery
  app.post('/recovery', async (request, reply) => {
    const { email, recovery_code } = request.body as { email: string; recovery_code: string };
    const admin = await repo.findByEmail(email);
    if (!admin) {
      return reply.code(401).send({ success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid email' } });
    }
    const codes = await repo.getRecoveryCodes(admin.id);
    if (!codes) {
      return reply.code(400).send({ success: false, error: { code: 'VALIDATION_ERROR', message: 'No recovery codes found' } });
    }
    let matchedIndex = -1;
    for (let i = 0; i < codes.length; i++) {
      if (await verifyTokenHash(recovery_code, codes[i]!)) {
        matchedIndex = i;
        break;
      }
    }
    if (matchedIndex === -1) {
      return reply.code(401).send({ success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid recovery code' } });
    }
    await repo.consumeRecoveryCode(admin.id, matchedIndex);
    await repo.disableTotp(admin.id);

    await repo.updateLastLogin(admin.id);

    const accessToken = signAccessToken(app, { id: admin.id, email: admin.email });
    const refreshToken = generateRefreshToken();
    const hash = hashToken(refreshToken);
    const expiresAt = getRefreshTokenExpiry(env.REFRESH_TOKEN_EXPIRES_IN);

    await repo.storeRefreshToken(admin.id, hash, expiresAt);

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

  // GET /profile
  app.get('/profile', { onRequest: [app.authenticate] }, async (request, reply) => {
    const adminId = request.user.sub;
    const admin = await repo.findFullById(adminId);
    if (!admin) {
      return reply.code(404).send({ success: false, error: { code: 'NOT_FOUND', message: 'Admin not found' } });
    }
    return {
      success: true,
      data: {
        id: admin.id,
        email: admin.email,
        totp_enabled: admin.totp_enabled,
        last_login: admin.last_login,
        created_at: admin.created_at,
      },
    };
  });

  // PUT /profile/email
  app.put('/profile/email', { onRequest: [app.authenticate] }, async (request, reply) => {
    const adminId = request.user.sub;
    const body = updateEmailSchema.parse(request.body);

    const admin = await repo.findFullById(adminId);
    if (!admin) {
      return reply.code(404).send({ success: false, error: { code: 'NOT_FOUND', message: 'Admin not found' } });
    }

    const valid = await verifyPassword(body.password, admin.password_hash);
    if (!valid) {
      return reply.code(401).send({ success: false, error: { code: 'UNAUTHORIZED', message: 'Incorrect password' } });
    }

    const existing = await repo.findByEmail(body.new_email);
    if (existing && existing.id !== adminId) {
      return reply.code(409).send({ success: false, error: { code: 'CONFLICT', message: 'Email already in use' } });
    }

    await repo.updateEmail(adminId, body.new_email);
    return { success: true, data: { email: body.new_email } };
  });

  // PUT /profile/password
  app.put('/profile/password', { onRequest: [app.authenticate] }, async (request, reply) => {
    const adminId = request.user.sub;
    const body = changePasswordSchema.parse(request.body);

    const admin = await repo.findFullById(adminId);
    if (!admin) {
      return reply.code(404).send({ success: false, error: { code: 'NOT_FOUND', message: 'Admin not found' } });
    }

    const valid = await verifyPassword(body.current_password, admin.password_hash);
    if (!valid) {
      return reply.code(401).send({ success: false, error: { code: 'UNAUTHORIZED', message: 'Incorrect current password' } });
    }

    const newHash = await hashPassword(body.new_password);
    await repo.updatePasswordHash(adminId, newHash);

    await repo.deleteAllRefreshTokens(adminId);

    return { success: true, data: { message: 'Password changed' } };
  });
}
