import { useLocalized } from '../../hooks/useLocalized.js';
import { cn } from '../../lib/cn.js';
import VipBadge from '../ui/VipBadge.js';
import type { Tour } from '@dark-angels/types';

interface TourCardProps {
  tour: Tour;
  onClick?: () => void;
}

export default function TourCard({ tour, onClick }: TourCardProps) {
  const title = useLocalized(tour.title);
  const city = useLocalized(tour.city);
  const country = useLocalized(tour.country);

  return (
    <div
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && onClick) onClick();
      }}
      role="button"
      tabIndex={0}
      className={cn(
        'group rounded-xl border border-border bg-bg-card overflow-hidden',
        'hover:border-accent/30 transition-all duration-200',
        'active:scale-[0.98]',
        'cursor-pointer',
      )}
    >
      <div className="relative aspect-video overflow-hidden">
        {tour.image_url ? (
          <img
            src={tour.image_url}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full bg-bg-elevated" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-bg-card/80 to-transparent" />

        {tour.is_vip && (
          <div className="absolute top-2 right-2">
            <VipBadge level="vip" />
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-text-primary line-clamp-2">{title}</h3>

        {(city || country) && (
          <p className="mt-1.5 text-sm text-text-muted">
            {[city, country].filter(Boolean).join(', ')}
          </p>
        )}

        {tour.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {tour.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-border px-2 py-0.5 text-xs text-text-muted"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {tour.earnings && (
          <p className="mt-3 text-sm font-medium text-accent">{tour.earnings}</p>
        )}
      </div>
    </div>
  );
}
