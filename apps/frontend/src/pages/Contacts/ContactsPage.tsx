import { useTranslation } from 'react-i18next';

export default function ContactsPage() {
  const { t } = useTranslation('common');

  return (
    <div className="flex flex-col gap-4 px-4 py-8">
      <h1 className="font-serif text-3xl font-bold text-accent">{t('contacts')}</h1>

      <div className="mt-6 space-y-4">
        <a
          href="https://t.me/darkangels_admin"
          target="_blank"
          rel="noopener noreferrer"
          className="block rounded-xl border border-accent bg-bg-card p-4 text-center font-medium text-accent transition-colors hover:bg-bg-elevated active:opacity-80 focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2 min-h-[44px] flex items-center justify-center"
        >
          {t('telegram_contact_label')}
        </a>
      </div>
    </div>
  );
}