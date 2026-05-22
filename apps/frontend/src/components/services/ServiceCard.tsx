import { useLocalized } from '../../hooks/useLocalized.js';
import { cn } from '../../lib/cn.js';
import type { Service } from '@dark-angels/types';

interface ServiceCardProps {
  service: Service;
  onClick?: () => void;
}

export default function ServiceCard({ service, onClick }: ServiceCardProps) {
  const title = useLocalized(service.title);
  const isInteractive = !!onClick;

  return (
    <div
      onClick={onClick}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && onClick) {
          e.preventDefault();
          onClick();
        }
      }}
      role={isInteractive ? 'button' : 'article'}
      tabIndex={isInteractive ? 0 : undefined}
      className={cn(
        'group rounded-xl border border-border bg-bg-card overflow-hidden',
        'hover:border-accent/30 transition-all duration-200',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
        isInteractive && 'cursor-pointer active:scale-[0.98]',
      )}
    >
      <div className="relative aspect-video overflow-hidden">
        {service.image_url ? (
          <img
            src={service.image_url}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full bg-bg-elevated" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-bg-card/80 to-transparent" />
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-text-primary line-clamp-2">{title}</h3>

        {service.description && (
          <p className="mt-1.5 text-sm text-text-secondary line-clamp-3">
            {useLocalized(service.description)}
          </p>
        )}

        {service.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {service.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-border px-2 py-0.5 text-xs text-text-secondary"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {service.price && (
          <p className="mt-3 text-sm font-semibold text-accent">{service.price}</p>
        )}
      </div>
    </div>
  );
}
