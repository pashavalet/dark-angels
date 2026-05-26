import { useState, useRef, useEffect } from 'react';
import i18n from '../../i18n/index.js';
import { useLocaleStore } from '../../stores/locale.js';

const LANGS: { code: 'ru' | 'en' | 'kk' | 'uz' | 'ky' | 'uk'; label: string }[] = [
  { code: 'ru', label: 'RU' },
  { code: 'en', label: 'EN' },
  { code: 'kk', label: 'KK' },
  { code: 'uz', label: 'UZ' },
  { code: 'ky', label: 'KY' },
  { code: 'uk', label: 'UK' },
];

export default function LanguageSwitcher() {
  const locale = useLocaleStore((s) => s.locale);
  const setLocale = useLocaleStore((s) => s.setLocale);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [open]);

  const toggle = (code: 'ru' | 'en' | 'kk' | 'uz' | 'ky' | 'uk') => {
    setLocale(code);
    i18n.changeLanguage(code);
    setOpen(false);
  };

  const current = LANGS.find((l) => l.code === locale)!;

  return (
    <div ref={ref} className="fixed bottom-20 right-4 z-40">
      {open && (
        <div className="mb-2 rounded-xl border border-border bg-bg-card p-1.5 shadow-lg">
          {LANGS.map((lng) => (
            <button
              key={lng.code}
              onClick={() => toggle(lng.code)}
              className={`flex min-h-[40px] w-full items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors ${
                locale === lng.code
                  ? 'bg-accent/20 text-accent'
                  : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated'
              }`}
            >
              <span className="w-5 text-center text-xs uppercase tracking-wider">{lng.label}</span>
            </button>
          ))}
        </div>
      )}
      <button
        onClick={() => setOpen(!open)}
        className="flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-bg-card text-sm font-bold uppercase tracking-wider text-accent shadow-lg transition-all hover:border-accent/30 active:scale-95"
        aria-label="Language"
      >
        {current.label}
      </button>
    </div>
  );
}