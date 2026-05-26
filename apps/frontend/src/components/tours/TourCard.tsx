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

  const cardContent = (
    <>
      <div className={cn('relative overflow-hidden bg-bg-elevated', compact ? 'h-28' : 'aspect-video')}>
        {tour.image_url ? (
          <img
            src={tour.image_url}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-bg-card/80 to-transparent" />

        {tour.is_vip && compact && (
          <div className="absolute top-1 right-1">
            <VipBadge level="vip" />
          </div>
        )}
        {tour.is_vip && !compact && (
          <div className="absolute top-2 right-2">
            <VipBadge level="vip" />
          </div>
        )}
      </div>

      <div className={cn(compact ? 'p-3' : 'p-4')}>
        <h3 className={cn('text-text-primary leading-tight', compact ? 'text-xs font-medium line-clamp-1' : 'font-semibold line-clamp-2')}>
          {title}
        </h3>

        {(city || country) && !compact && (
          <p className="mt-1.5 text-sm text-text-secondary">
            {[city, country].filter(Boolean).join(', ')}
          </p>
        )}

        {tour.tags.length > 0 && !compact && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {tour.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-border px-2 py-0.5 text-xs text-text-secondary"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {tour.earnings && !compact && (
          <p className="mt-3 text-sm font-medium text-accent">{tour.earnings}</p>
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