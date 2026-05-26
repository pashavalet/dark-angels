import { useRef, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { cn } from '../../lib/cn.js';

interface HorizontalCarouselProps {
  title: string;
  items: unknown[];
  renderItem: (item: unknown, index: number) => ReactNode;
  emptyMessage?: string;
  isLoading?: boolean;
  compact?: boolean;
}

const containerVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.06 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: 20 },
  show: { opacity: 1, x: 0, transition: { duration: 0.25, ease: 'easeOut' } },
};

function SkeletonCard({ compact }: { compact?: boolean }) {
  return (
    <div className={cn('shrink-0 rounded-xl border border-border bg-bg-card overflow-hidden animate-pulse', compact ? 'w-[180px] sm:w-[200px]' : 'w-[280px] sm:w-[320px]')}>
      <div className={cn('bg-bg-elevated', compact ? 'h-28' : 'aspect-video')} />
      <div className={cn('space-y-2', compact ? 'p-3' : 'p-4')}>
        <div className={cn('bg-bg-elevated rounded', compact ? 'h-3 w-3/4' : 'h-5 w-3/4')} />
        <div className={cn('bg-bg-elevated rounded', compact ? 'h-2 w-1/2' : 'h-4 w-1/2')} />
      </div>
    </div>
  );
}

export default function HorizontalCarousel({
  title,
  items,
  renderItem,
  emptyMessage,
  isLoading,
  compact,
}: HorizontalCarouselProps) {
  const { t } = useTranslation('common');
  const scrollRef = useRef<HTMLDivElement>(null);

  function scroll(dir: 'left' | 'right') {
    if (!scrollRef.current) return;
    const amount = compact ? 200 : 300;
    scrollRef.current.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
  }

  const cardWidth = compact ? 'w-[180px] sm:w-[200px]' : 'w-[280px] sm:w-[320px]';

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4 px-4">
        <h2 className="font-serif text-2xl font-bold text-accent">{title}</h2>
        {items.length > 0 && (
          <div className="hidden sm:flex gap-2">
            <button
              onClick={() => scroll('left')}
              className={cn(
                'flex items-center justify-center w-[44px] h-[44px] rounded-full',
                'bg-bg-card/80 backdrop-blur-sm border border-border',
                'text-accent hover:text-accent hover:border-accent/50',
                'transition-colors active:scale-95',
                'focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2',
              )}
              aria-label={t('scroll_left')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => scroll('right')}
              className={cn(
                'flex items-center justify-center w-[44px] h-[44px] rounded-full',
                'bg-bg-card/80 backdrop-blur-sm border border-border',
                'text-accent hover:text-accent hover:border-accent/50',
                'transition-colors active:scale-95',
                'focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2',
              )}
              aria-label={t('scroll_right')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="flex gap-4 px-4 overflow-x-auto scrollbar-none">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} compact={compact} />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="px-4 py-12 text-center text-text-muted">
          <p className="text-sm">{emptyMessage}</p>
        </div>
      ) : (
        <motion.div
          ref={scrollRef}
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-50px' }}
          className="flex gap-4 px-4 overflow-x-auto scrollbar-none snap-x snap-mandatory"
        >
          {items.map((item: any, index: number) => (
            <motion.div
              key={item.id ?? index}
              variants={itemVariants}
              className={cn('snap-start shrink-0', cardWidth)}
            >
              {renderItem(item, index)}
            </motion.div>
          ))}
        </motion.div>
      )}
    </section>
  );
}