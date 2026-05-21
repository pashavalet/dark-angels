import { create } from 'zustand';

type SupportedLocale = 'ru' | 'en';

interface LocaleState {
  locale: SupportedLocale;
  setLocale: (locale: SupportedLocale) => void;
}

export const useLocaleStore = create<LocaleState>((set) => ({
  locale: (localStorage.getItem('app_locale') as SupportedLocale) ?? 'en',
  setLocale: (locale) => {
    localStorage.setItem('app_locale', locale);
    set({ locale });
  },
}));