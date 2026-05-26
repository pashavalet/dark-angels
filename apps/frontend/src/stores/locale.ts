import { create } from 'zustand';

export type SupportedLocale = 'ru' | 'en' | 'kk' | 'uz' | 'ky' | 'uk';

interface LocaleState {
  locale: SupportedLocale;
  setLocale: (locale: SupportedLocale) => void;
}

export const useLocaleStore = create<LocaleState>((set) => ({
  locale: (localStorage.getItem('app_locale') as SupportedLocale) ?? 'ru',
  setLocale: (locale) => {
    localStorage.setItem('app_locale', locale);
    set({ locale });
  },
}));