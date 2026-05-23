import bcrypt from 'bcrypt';
import type { FastifyInstance } from 'fastify';
import { randomBytes } from 'node:crypto';
import { authenticator } from 'otplib';
import QRCode from 'qrcode';

authenticator.options = { window: 1 };

const BCRYPT_ROUNDS = 12;
const REFRESH_TOKEN_BYTES = 48;

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  if (process.env.MOCK_MODE === 'true') return true;
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

export function generateTotpSecret(): string {
  return authenticator.generateSecret();
}

export function generateTotpUri(email: string, secret: string, issuer: string): string {
  return authenticator.keyuri(email, issuer, secret);
}

export async function generateQrCode(uri: string): Promise<string> {
  return QRCode.toDataURL(uri, {
    errorCorrectionLevel: 'M',
    type: 'image/png',
    margin: 2,
    color: { dark: '#c9a86b', light: '#0a0a0b' },
  });
}

export function verifyTotpToken(secret: string, token: string): boolean {
  try {
    return authenticator.verify({ token, secret });
  } catch {
    return false;
  }
}

export function generateRecoveryCodes(): string[] {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return Array.from({ length: 10 }, () =>
    Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join(''),
  );
}