import bcrypt from 'bcrypt';
import type { FastifyInstance } from 'fastify';
import { randomBytes } from 'node:crypto';

const BCRYPT_ROUNDS = 12;
const REFRESH_TOKEN_BYTES = 48;

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

export function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateRefreshToken(): string {
  return randomBytes(REFRESH_TOKEN_BYTES).toString('hex');
}

export function hashToken(token: string): string {
  return bcrypt.hashSync(token, 10);
}

export function verifyTokenHash(token: string, hash: string): Promise<boolean> {
  return bcrypt.compare(token, hash);
}

export function signAccessToken(app: FastifyInstance, admin: { id: string; email: string }): string {
  return app.jwt.sign({ sub: admin.id, email: admin.email });
}

export function getRefreshTokenExpiry(expiresIn: string): Date {
  const match = expiresIn.match(/^(\d+)(s|m|h|d)$/);
  if (!match) throw new Error(`Invalid expiry format: ${expiresIn}`);
  const value = parseInt(match[1]!);
  const unit = match[2]!;
  const ms = { s: 1000, m: 60000, h: 3600000, d: 86400000 }[unit]! * value;
  return new Date(Date.now() + ms);
}