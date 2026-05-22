import { describe, it, expect } from 'vitest';
import { localizedStringSchema } from '../schemas/common.js';
import { createTourSchema } from '../schemas/tour.js';
import { loginSchema } from '../schemas/auth.js';

describe('localizedStringSchema', () => {
  it('accepts valid localized string', () => {
    expect(localizedStringSchema.safeParse({ ru: 'R', en: 'E' }).success).toBe(true);
  });

  it('rejects missing ru', () => {
    expect(localizedStringSchema.safeParse({ en: 'E' }).success).toBe(false);
  });
});

describe('createTourSchema', () => {
  it('accepts full tour', () => {
    const r = createTourSchema.safeParse({
      title: { ru: 'T', en: 'T' },
      description: { ru: 'D', en: 'D' },
      country: { ru: 'C', en: 'C' },
      city: { ru: 'C', en: 'C' },
      agency: { ru: 'A', en: 'A' },
    });
    expect(r.success).toBe(true);
  });

  it('sets defaults', () => {
    const r = createTourSchema.safeParse({
      title: { ru: 'T', en: 'T' },
      description: { ru: 'D', en: 'D' },
      country: { ru: 'C', en: 'C' },
      city: { ru: 'C', en: 'C' },
      agency: { ru: 'A', en: 'A' },
    });
    if (r.success) {
      expect(r.data.is_vip).toBe(false);
      expect(r.data.tags).toEqual([]);
    }
  });
});

describe('loginSchema', () => {
  it('accepts valid login', () => {
    expect(loginSchema.safeParse({ email: 'a@b.com', password: '123456789012' }).success).toBe(true);
  });

  it('rejects short password', () => {
    expect(loginSchema.safeParse({ email: 'a@b.com', password: '123' }).success).toBe(false);
  });
});
