import { Link } from 'react-router-dom';
import { useLocalized } from '../../hooks/useLocalized.js';
import { cn } from '../../lib/cn.js';
import { useAuthStore } from '../../stores/auth.js';
import SubscriptionModal from '../ui/SubscriptionModal.js';
import type { Service } from '@dark-angels/types';

interface ServiceCardProps {
  service: Service;
  to?: string;
  compact?: boolean;
}

export default function ServiceCard({ service, to, compact }: ServiceCardProps) {
  const title = useLocalized(service.title);
  const description = useLocalized(service.description);
  const isSubscribed = useAuthStore((s) => s.isSubscribed);
  const isLocked = service.requires_subscription && !isSubscribed;

  const cardContent = (
    <>
      <div className={cn('relative overflow-hidden bg-bg-elevated', compact ? 'aspect-[4/3]' : 'aspect-video')}>
        {service.image_url ? (
          <img
            src={service.image_url}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-bg-card/80 to-transparent" />

        {isLocked && (
          <div className="absolute inset-0 flex items-center justify-center bg-bg-card/60 backdrop-blur-[2px]">
            <span className="text-2xl opacity-80">🔒</span>
          </div>
        )}
      </div>

      <div className={cn('flex flex-col gap-1.5', compact ? 'p-3' : 'p-4')}>
        <h3 className={cn('text-text-primary leading-tight', compact ? 'text-sm font-medium line-clamp-1' : 'font-semibold line-clamp-2')}>
          {title}
        </h3>

        {description && (
          <p className={cn('text-text-secondary', compact ? 'text-xs line-clamp-2' : 'text-sm line-clamp-3')}>
            {description}
          </p>
        )}

        {service.tags.length > 0 && (
          <div className={cn('flex flex-wrap gap-1', compact ? 'mt-0.5' : 'mt-3')}>
            {service.tags.slice(0, compact ? 2 : undefined).map((tag) => (
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
            {compact && service.tags.length > 2 && (
              <span className="px-1.5 py-0.5 text-[10px] rounded-full border border-border text-text-secondary">
                +{service.tags.length - 2}
              </span>
            )}
          </div>
        )}

        {service.price && (
          <p className={cn('font-semibold text-accent', compact ? 'text-xs' : 'mt-3 text-sm')}>
            {service.price}
          </p>
        )}
      </div>
    </>
  );

  if (to && isLocked) {
    return (
      <SubscriptionModal isLocked>
        <div
          className={cn(
            'group rounded-xl border border-border bg-bg-card overflow-hidden',
            'hover:border-accent/30 transition-all duration-200',
            'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
            'block cursor-pointer',
            compact ? 'active:scale-[0.97]' : 'active:scale-[0.98]',
          )}
        >
          {cardContent}
        </div>
      </SubscriptionModal>
    );
  }

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