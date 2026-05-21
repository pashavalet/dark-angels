import type { FastifyInstance } from 'fastify';
import { hashPassword, verifyPassword, verifyTokenHash } from '../services/auth.service.js';

export function createAuthRepository(app: FastifyInstance) {
  const db = app.supabase;

  return {
    async findByEmail(email: string) {
      const { data } = await db
        .from('admins')
        .select('*')
        .eq('email', email)
        .single();
      return data;
    },

    async findById(id: string) {
      const { data } = await db
        .from('admins')
        .select('id, email, totp_enabled, last_login')
        .eq('id', id)
        .single();
      return data;
    },

    async updateLastLogin(id: string) {
      await db.from('admins').update({ last_login: new Date().toISOString(), failed_login_attempts: 0 }).eq('id', id);
    },

    async incrementFailedAttempts(id: string) {
      const { data } = await db.from('admins').select('failed_login_attempts').eq('id', id).single();
      const attempts = (data?.failed_login_attempts ?? 0) + 1;
      const locked = attempts >= 5 ? new Date(Date.now() + 15 * 60000).toISOString() : null;
      await db.from('admins').update({ failed_login_attempts: attempts, locked_until: locked }).eq('id', id);
      return { attempts, locked_until: locked };
    },

    async isLocked(id: string): Promise<boolean> {
      const { data } = await db.from('admins').select('locked_until').eq('id', id).single();
      if (!data?.locked_until) return false;
      return new Date(data.locked_until) > new Date();
    },

    async storeRefreshToken(adminId: string, tokenHash: string, expiresAt: Date) {
      await db.from('refresh_tokens').insert({
        admin_id: adminId,
        token_hash: tokenHash,
        expires_at: expiresAt.toISOString(),
      });
    },

    async findRefreshToken(tokenHash: string) {
      const { data } = await db
        .from('refresh_tokens')
        .select('*')
        .eq('token_hash', tokenHash)
        .single();
      return data;
    },

    async deleteRefreshToken(id: string) {
      await db.from('refresh_tokens').delete().eq('id', id);
    },

    async deleteAllRefreshTokens(adminId: string) {
      await db.from('refresh_tokens').delete().eq('admin_id', adminId);
    },
  };
}

export type AuthRepository = ReturnType<typeof createAuthRepository>;