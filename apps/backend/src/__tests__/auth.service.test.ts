import { describe, it, expect } from 'vitest';
import {
  hashPassword,
  verifyPassword,
  hashToken,
  verifyTokenHash,
  generateRefreshToken,
  getRefreshTokenExpiry,
} from '../services/auth.service.js';

describe('auth service', () => {
  it('hash and verify password', async () => {
    const hash = await hashPassword('test-password-123');
    expect(await verifyPassword('test-password-123', hash)).toBe(true);
    expect(await verifyPassword('wrong', hash)).toBe(false);
  });

  it('hash and verify token', async () => {
    const token = generateRefreshToken();
    const h = hashToken(token);
    expect(await verifyTokenHash(token, h)).toBe(true);
  });

  it('generate unique refresh tokens', () => {
    expect(generateRefreshToken()).not.toBe(generateRefreshToken());
  });

  it('parse expiry correctly', () => {
    const d = getRefreshTokenExpiry('7d');
    const diff = d.getTime() - Date.now();
    expect(diff).toBeGreaterThan(7 * 24 * 3600000 - 5000);
  });
});
