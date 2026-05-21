import { useTranslation } from 'react-i18next';

export default function ServicesPage() {
  const { t } = useTranslation('common');

  return (
    <div className="flex flex-col gap-4 px-4 py-8">
      <h1 className="font-serif text-3xl font-bold text-text-primary">{t('services')}</h1>
      <p className="text-text-secondary">{t('services')} — coming soon</p>
    </div>
  );
}