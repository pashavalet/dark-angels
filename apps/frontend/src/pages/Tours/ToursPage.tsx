import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTours } from '../../api/tours.js';
import TourCard from '../../components/tours/TourCard.js';

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function ToursPage() {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const params = useMemo(() => {
    const p: Record<string, string | number> = { page, limit: 20 };
    if (selectedTag) p.tags = selectedTag;
    if (search) p.search = search;
    return p;
  }, [page, search, selectedTag]);

  const { data, isLoading } = useTours(params);

  const allTags = useMemo(() => {
    if (!data?.data) return [];
    const tags = new Set<string>();
    data.data.forEach((tour) => tour.tags.forEach((tag) => tags.add(tag)));
    return Array.from(tags).sort();
  }, [data?.data]);

  const tours = data?.data ?? [];
  const meta = data?.meta;

  return (
    <div className="px-4 py-8">
      <div className="mb-8">
        <h1 className="font-serif text-4xl font-bold tracking-tight text-accent">
          {t('tours')}
        </h1>
        <p className="mt-2 text-text-muted">
          {t('explore_tours', 'Explore our exclusive tours')}
        </p>
      </div>

      <div className="relative mb-6">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-text-muted"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.3-4.3" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder={t('search', 'Search')}
          className="w-full rounded-xl border border-border bg-bg-card py-3 pl-12 pr-4 text-text-primary placeholder:text-text-muted outline-none transition-colors focus:border-accent/50 min-h-[44px]"
        />
      </div>

      {allTags.length > 0 && (
        <div className="mb-6 flex gap-2 overflow-x-auto pb-2 scroll-smooth">
          <button
            onClick={() => {
              setSelectedTag(null);
              setPage(1);
            }}
            className={cn(
              'shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors min-h-[44px] flex items-center',
              selectedTag === null
                ? 'border-accent bg-accent/10 text-accent'
                : 'border-border text-text-muted hover:border-text-muted',
            )}
          >
            {t('all', 'All')}
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => {
                setSelectedTag(tag);
                setPage(1);
              }}
              className={cn(
                'shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors min-h-[44px] flex items-center',
                selectedTag === tag
                  ? 'border-accent bg-accent/10 text-accent'
                  : 'border-border text-text-muted hover:border-text-muted',
              )}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {isLoading ? (
        <SkeletonGrid />
      ) : tours.length === 0 ? (
        <EmptyState />
      ) : (
        <motion.div
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
        >
          {tours.map((tour) => (
            <motion.div key={tour.id} variants={itemVariants}>
              <TourCard tour={tour} onClick={() => navigate(`/tours/${tour.id}`)} />
            </motion.div>
          ))}
        </motion.div>
      )}

      {meta && meta.totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-3">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-border text-text-primary transition-colors hover:border-accent/30 disabled:opacity-30"
            aria-label={t('previous', 'Previous')}
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
          </button>
          <span className="min-w-[80px] text-center text-sm text-text-muted">
            {t('page', 'Page')} {meta.page} / {meta.totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
            disabled={page >= meta.totalPages}
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-border text-text-primary transition-colors hover:border-accent/30 disabled:opacity-30"
            aria-label={t('next', 'Next')}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              className="h-5 w-5"
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="rounded-xl border border-border bg-bg-card overflow-hidden animate-pulse">
      <div className="aspect-video bg-bg-elevated" />
      <div className="space-y-3 p-4">
        <div className="h-5 w-3/4 rounded bg-bg-elevated" />
        <div className="h-4 w-1/2 rounded bg-bg-elevated" />
        <div className="flex gap-2">
          <div className="h-5 w-12 rounded-full bg-bg-elevated" />
          <div className="h-5 w-16 rounded-full bg-bg-elevated" />
        </div>
      </div>
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

function EmptyState() {
  const { t } = useTranslation('common');

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full border border-border bg-bg-card">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1}
          className="h-10 w-10 text-text-muted"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.3-4.3" />
          <line x1="8" y1="11" x2="14" y2="11" strokeWidth={1.5} />
        </svg>
      </div>
      <p className="text-text-muted">{t('no_tours_found', 'No tours found')}</p>
    </div>
  );
}

import { cn } from '../../lib/cn.js';
