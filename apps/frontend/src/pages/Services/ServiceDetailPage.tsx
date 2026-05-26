import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useService } from '../../api/services.js';
import { useLocalized } from '../../hooks/useLocalized.js';
import { useAuthStore } from '../../stores/auth.js';
import { useBackButton } from '../../hooks/useBackButton.js';
import { useMainButton } from '../../hooks/useMainButton.js';

export default function ServiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation('common');

  const { data, isLoading, isError } = useService(id ?? '');

  const service = data?.data;
  const isSubscribed = useAuthStore((s) => s.isSubscribed);
  const isLocked = service?.requires_subscription && !isSubscribed;
  const title = useLocalized(service?.title);
  const description = useLocalized(service?.description);
  useBackButton(() => navigate(-1));
  useMainButton(t('contacts'), () => {
    if (service?.contacts) window.open(`https://t.me/${service.contacts.replace('@', '')}`, '_blank');
  }, !isLocked && !!service?.contacts);

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6 px-4 py-8">
        <div className="h-10 w-24 rounded bg-bg-elevated" />
        <div className="aspect-video w-full rounded-xl bg-bg-elevated" />
        <div className="h-8 w-2/3 rounded bg-bg-elevated" />
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="h-20 rounded-xl bg-bg-elevated" />
          <div className="h-20 rounded-xl bg-bg-elevated" />
        </div>
        <div className="space-y-3">
          <div className="h-4 w-full rounded bg-bg-elevated" />
          <div className="h-4 w-5/6 rounded bg-bg-elevated" />
          <div className="h-4 w-4/6 rounded bg-bg-elevated" />
        </div>
      </div>
    );
  }

  if (isError || !service) {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-16">
        <p className="text-text-muted">{t('no_services_found')}</p>
        <button
          onClick={() => navigate('/services')}
          className="mt-4 min-h-[44px] rounded-lg border border-border px-6 text-text-primary transition-colors hover:border-accent/30 focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
        >
          {t('back')}
        </button>
      </div>
    );
  }

  if (isLocked) {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-20 text-center">
        <span className="text-5xl mb-4">🔒</span>
        <h2 className="font-serif text-xl font-bold text-accent mb-2">По подписке</h2>
        <p className="text-text-secondary mb-6 max-w-xs">
          Этот контент доступен только подписчикам канала @markmakemoney
        </p>
        <a
          href="https://t.me/markmakemoney"
          target="_blank"
          rel="noopener noreferrer"
          className="min-h-[44px] inline-flex items-center rounded-lg bg-accent px-6 text-sm font-medium text-bg-primary hover:opacity-90 focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
        >
          Подписаться
        </a>
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
        {service.image_url ? (
          <img
            src={service.image_url}
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
          {description && (
            <p className="mt-2 text-sm text-text-secondary line-clamp-3">
              {description}
            </p>
          )}
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
          {service.price && (
            <div className="rounded-xl border border-border bg-bg-card p-4">
              <p className="text-xs uppercase tracking-widest text-text-muted">
                {t('price', 'Price')}
              </p>
              <p className="mt-1 font-medium text-accent">{service.price}</p>
            </div>
          )}

          {service.contacts && (
            <div className="rounded-xl border border-border bg-bg-card p-4 sm:col-span-2">
              <p className="text-xs uppercase tracking-widest text-text-muted">
                {t('contacts', 'Contacts')}
              </p>
              <p className="mt-1 font-medium text-text-primary">{service.contacts}</p>
            </div>
          )}
        </section>

        {service.tags.length > 0 && (
          <section>
            <div className="flex flex-wrap gap-2">
              {service.tags.map((tag) => (
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
