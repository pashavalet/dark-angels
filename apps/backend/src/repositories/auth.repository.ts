import type { FastifyInstance } from 'fastify';
import { hashPassword, verifyPassword, verifyTokenHash, hashToken } from '../services/auth.service.js';

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

    async getTotpSecret(adminId: string): Promise<string | null> {
      const { data } = await db.from('admins').select('totp_secret').eq('id', adminId).single();
      return data?.totp_secret ?? null;
    },

    async enableTotp(adminId: string, secret: string): Promise<void> {
      await db.from('admins').update({ totp_secret: secret }).eq('id', adminId);
    },

    async confirmTotp(adminId: string): Promise<void> {
      await db.from('admins').update({ totp_enabled: true }).eq('id', adminId);
    },

    async disableTotp(adminId: string): Promise<void> {
      await db.from('admins').update({ totp_secret: null, totp_enabled: false, recovery_codes_hash: null }).eq('id', adminId);
    },

    async storeRecoveryCodes(adminId: string, hashes: string[]): Promise<void> {
      await db.from('admins').update({ recovery_codes_hash: JSON.stringify(hashes) }).eq('id', adminId);
    },

    async getRecoveryCodes(adminId: string): Promise<string[] | null> {
      const { data } = await db.from('admins').select('recovery_codes_hash').eq('id', adminId).single();
      if (!data?.recovery_codes_hash) return null;
      return JSON.parse(data.recovery_codes_hash);
    },

    async consumeRecoveryCode(adminId: string, codeIndex: number): Promise<void> {
      const codes = await this.getRecoveryCodes(adminId);
      if (!codes) return;
      codes.splice(codeIndex, 1);
      if (codes.length === 0) {
        await db.from('admins').update({ recovery_codes_hash: null }).eq('id', adminId);
      } else {
        await db.from('admins').update({ recovery_codes_hash: JSON.stringify(codes) }).eq('id', adminId);
      }
    },

    async isTotpEnabled(adminId: string): Promise<boolean> {
      const { data } = await db.from('admins').select('totp_enabled').eq('id', adminId).single();
      return data?.totp_enabled === true;
    },

    async findFullById(id: string) {
      const { data } = await db
        .from('admins')
        .select('*')
        .eq('id', id)
        .single();
      return data;
    },

    async updateEmail(id: string, email: string) {
      await db.from('admins').update({ email, updated_at: new Date().toISOString() }).eq('id', id);
    },

    async updatePasswordHash(id: string, passwordHash: string) {
      await db.from('admins').update({ password_hash: passwordHash, updated_at: new Date().toISOString() }).eq('id', id);
    },
  };
}

export type AuthRepository = ReturnType<typeof createAuthRepository>;