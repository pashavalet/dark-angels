import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useLocalized } from '../../hooks/useLocalized.js';
import { useLocaleStore } from '../../stores/locale.js';

describe('useLocalized', () => {
  it('returns value for current locale', () => {
    useLocaleStore.getState().setLocale('ru');
    const { result } = renderHook(() => useLocalized({ ru: 'Привет', en: 'Hello' }));
    expect(result.current).toBe('Привет');
  });

  it('falls back to en', () => {
    useLocaleStore.getState().setLocale('de' as any);
    const { result } = renderHook(() => useLocalized({ ru: 'Привет', en: 'Hello' }));
    expect(result.current).toBe('Hello');
  });

  it('returns empty for undefined', () => {
    const { result } = renderHook(() => useLocalized(undefined));
    expect(result.current).toBe('');
  });
});
