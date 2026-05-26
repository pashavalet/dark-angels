import i18n from '../../i18n/index.js';
import { useLocaleStore } from '../../stores/locale.js';

export default function LanguageSwitcher() {
  const locale = useLocaleStore((s) => s.locale);
  const setLocale = useLocaleStore((s) => s.setLocale);

  const toggle = (next: 'ru' | 'en') => {
    setLocale(next);
    i18n.changeLanguage(next);
  };

  return (
    <div className="inline-flex rounded-lg border border-border p-0.5" role="radiogroup" aria-label="Language">
      {(['ru', 'en'] as const).map((lng) => (
        <button
          key={lng}
          onClick={() => toggle(lng)}
          role="radio"
          aria-checked={locale === lng}
          className={`min-h-[40px] min-w-[40px] rounded-md px-3 text-xs font-semibold uppercase tracking-wider transition-colors ${
            locale === lng
              ? 'bg-accent/20 text-accent'
              : 'text-text-muted hover:text-text-secondary'
          }`}
        >
          {lng}
        </button>
      ))}
    </div>
  );
}