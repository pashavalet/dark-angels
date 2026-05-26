import { Link } from 'react-router-dom';
import { useLocalized } from '../../hooks/useLocalized.js';
import { cn } from '../../lib/cn.js';
import VipBadge from '../ui/VipBadge.js';
import type { Tour } from '@dark-angels/types';

interface TourCardProps {
  tour: Tour;
  to?: string;
  compact?: boolean;
}

export default function TourCard({ tour, to, compact }: TourCardProps) {
  const title = useLocalized(tour.title);
  const city = useLocalized(tour.city);
  const country = useLocalized(tour.country);
  const description = useLocalized(tour.description);

  const cardContent = (
    <>
      <div className={cn('relative overflow-hidden bg-bg-elevated', compact ? 'aspect-[4/3]' : 'aspect-video')}>
        {tour.image_url ? (
          <img
            src={tour.image_url}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-bg-card/80 to-transparent" />

        {tour.is_vip && (
          <div className={cn('absolute', compact ? 'top-1 right-1' : 'top-2 right-2')}>
            <VipBadge level="vip" />
          </div>
        )}
      </div>

      <div className={cn('flex flex-col gap-1.5', compact ? 'p-3' : 'p-4')}>
        <h3 className={cn('text-text-primary leading-tight', compact ? 'text-sm font-medium line-clamp-1' : 'font-semibold line-clamp-2')}>
          {title}
        </h3>

        {(city || country) && (
          <p className={cn('text-text-secondary', compact ? 'text-xs line-clamp-1' : 'text-sm')}>
            {[city, country].filter(Boolean).join(', ')}
          </p>
        )}

        {description && compact && (
          <p className="text-xs text-text-secondary line-clamp-2">
            {description}
          </p>
        )}

        {tour.tags.length > 0 && (
          <div className={cn('flex flex-wrap gap-1', compact ? 'mt-0.5' : 'mt-3')}>
            {tour.tags.slice(0, compact ? 2 : undefined).map((tag) => (
              <span
                key={tag}
                className={cn(
                  'rounded-full border border-border text-text-secondary',
                  compact ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-xs',
                )}
              >
                {tag}
              </span>
            ))}
            {compact && tour.tags.length > 2 && (
              <span className="px-1.5 py-0.5 text-[10px] rounded-full border border-border text-text-secondary">
                +{tour.tags.length - 2}
              </span>
            )}
          </div>
        )}

        {tour.earnings && (
          <p className={cn('font-medium text-accent', compact ? 'text-xs' : 'mt-3 text-sm')}>
            {tour.earnings}
          </p>
        )}
      </div>
    </>
  );

  if (to) {
    return (
      <Link
        to={to}
        className={cn(
          'group rounded-xl border border-border bg-bg-card overflow-hidden',
          'hover:border-accent/30 transition-all duration-200',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
          'block cursor-pointer',
          compact ? 'active:scale-[0.97]' : 'active:scale-[0.98]',
        )}
      >
        {cardContent}
      </Link>
    );
  }

  return (
    <div
      className={cn(
        'group rounded-xl border border-border bg-bg-card overflow-hidden',
        'hover:border-accent/30 transition-all duration-200',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
      )}
    >
      {cardContent}
    </div>
  );
}