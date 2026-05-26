import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useBlog } from '../../api/blogs.js';
import { useLocalized } from '../../hooks/useLocalized.js';
import { useAuthStore } from '../../stores/auth.js';
import MarkdownRenderer from '../../components/blog/MarkdownRenderer.js';
import VipBadge from '../../components/ui/VipBadge.js';

export default function BlogDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation('common');

  const { data, isLoading, isError } = useBlog(id ?? '');

  const article = data?.data;
  const isSubscribed = useAuthStore((s) => s.isSubscribed);
  const isLocked = article?.requires_subscription && !isSubscribed;
  const title = useLocalized(article?.title);
  const content = useLocalized(article?.content);

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6 px-4 py-8">
        <div className="h-10 w-24 rounded bg-bg-elevated" />
        <div className="aspect-video w-full rounded-xl bg-bg-elevated" />
        <div className="h-8 w-2/3 rounded bg-bg-elevated" />
        <div className="space-y-3 mt-6">
          <div className="h-4 w-full rounded bg-bg-elevated" />
          <div className="h-4 w-5/6 rounded bg-bg-elevated" />
          <div className="h-4 w-4/6 rounded bg-bg-elevated" />
          <div className="h-4 w-full rounded bg-bg-elevated" />
          <div className="h-4 w-3/4 rounded bg-bg-elevated" />
          <div className="h-4 w-1/2 rounded bg-bg-elevated" />
        </div>
        <div className="space-y-3 mt-6">
          <div className="h-4 w-full rounded bg-bg-elevated" />
          <div className="h-4 w-5/6 rounded bg-bg-elevated" />
          <div className="h-4 w-2/3 rounded bg-bg-elevated" />
        </div>
      </div>
    );
  }

  if (isError || !article) {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-16">
        <p className="text-text-muted">{t('no_articles_found', 'No articles found')}</p>
        <button
          onClick={() => navigate('/blog')}
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
        {article.preview_image ? (
          <img
            src={article.preview_image}
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
            {article.created_at && (
              <span className="text-sm text-text-secondary">
                {new Date(article.created_at).toLocaleDateString()}
              </span>
            )}

            <VipBadge level={article.access_level} />
          </div>
        </div>
      </div>

      <div className="px-4 py-8">
        {content && <MarkdownRenderer content={content} />}

        {article.tags.length > 0 && (
          <div className="mt-10 flex flex-wrap gap-2">
            {article.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-accent/40 px-3 py-1 text-sm text-accent"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
