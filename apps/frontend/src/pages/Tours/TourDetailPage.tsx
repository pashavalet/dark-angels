import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useTour } from '../../api/tours.js';
import { useLocalized } from '../../hooks/useLocalized.js';
import VipBadge from '../../components/ui/VipBadge.js';

export default function TourDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation('common');

  const { data, isLoading, isError } = useTour(id ?? '');

  const tour = data?.data;
  const title = useLocalized(tour?.title);
  const description = useLocalized(tour?.description);
  const country = useLocalized(tour?.country);
  const city = useLocalized(tour?.city);
  const agency = useLocalized(tour?.agency);

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6 px-4 py-8">
        <div className="h-10 w-24 rounded bg-bg-elevated" />
        <div className="aspect-video w-full rounded-xl bg-bg-elevated" />
        <div className="h-8 w-2/3 rounded bg-bg-elevated" />
        <div className="space-y-3">
          <div className="h-4 w-full rounded bg-bg-elevated" />
          <div className="h-4 w-5/6 rounded bg-bg-elevated" />
          <div className="h-4 w-4/6 rounded bg-bg-elevated" />
        </div>
      </div>
    );
  }

  if (isError || !tour) {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-16">
        <p className="text-text-muted">{t('no_tours_found', 'No tours found')}</p>
        <button
          onClick={() => navigate('/tours')}
          className="mt-4 min-h-[44px] rounded-lg border border-border px-6 text-text-primary transition-colors hover:border-accent/30 focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
        >
          {t('back')}
        </button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <div className="relative aspect-video md:aspect-[21/9] overflow-hidden">
        {tour.image_url ? (
          <img
            src={tour.image_url}
            alt={title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full bg-bg-elevated" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-bg-primary/60 to-transparent" />

        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 z-10 flex min-h-[44px] min-w-[44px] items-center gap-1.5 rounded-lg border border-white/20 bg-black/40 px-4 text-sm text-white backdrop-blur-sm transition-colors hover:bg-black/60 focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
          aria-label={t('back')}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            className="h-5 w-5"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
          {t('back')}
        </button>

        <div className="absolute bottom-0 left-0 right-0 p-6 pb-8">
          <h1 className="font-serif text-3xl font-bold text-accent">{title}</h1>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            {(city || country) && (
              <span className="text-sm text-text-secondary">
                {[city, country].filter(Boolean).join(', ')}
              </span>
            )}

            {tour.is_vip && (
              <VipBadge level="vip" />
            )}
          </div>
        </div>
      </div>

      <div className="space-y-6 px-4 py-8">
        {description && (
          <section>
            <p className="leading-relaxed text-text-secondary whitespace-pre-line">
              {description}
            </p>
          </section>
        )}

        <section className="grid gap-4 sm:grid-cols-2">
          {agency && (
            <div className="rounded-xl border border-border bg-bg-card p-4">
              <p className="text-xs uppercase tracking-widest text-text-muted">
                {t('agency', 'Agency')}
              </p>
              <p className="mt-1 font-medium text-text-primary">{agency}</p>
            </div>
          )}

          {tour.earnings && (
            <div className="rounded-xl border border-border bg-bg-card p-4">
              <p className="text-xs uppercase tracking-widest text-text-muted">
                {t('earnings', 'Earnings')}
              </p>
              <p className="mt-1 font-medium text-accent">{tour.earnings}</p>
            </div>
          )}

          {tour.contacts && (
            <div className="rounded-xl border border-border bg-bg-card p-4 sm:col-span-2">
              <p className="text-xs uppercase tracking-widest text-text-muted">
                {t('contacts', 'Contacts')}
              </p>
              <p className="mt-1 font-medium text-text-primary">{tour.contacts}</p>
            </div>
          )}
        </section>

        {tour.tags.length > 0 && (
          <section>
            <div className="flex flex-wrap gap-2">
              {tour.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-accent/40 px-3 py-1 text-sm text-accent"
                >
                  {tag}
                </span>
              ))}
            </div>
          </section>
        )}
      </div>
    </motion.div>
  );
}
