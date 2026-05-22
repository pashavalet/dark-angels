import { describe, it, expect } from 'vitest';
import { cn } from '../../lib/cn.js';

describe('cn', () => {
  it('merges classes', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('filters falsy', () => {
    expect(cn('foo', false && 'bar', undefined, 'baz')).toBe('foo baz');
  });

  it('handles conditions', () => {
    expect(cn('base', true && 'active')).toBe('base active');
  });
});
