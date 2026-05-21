import { useLocalized } from '../../hooks/useLocalized.js';
import { cn } from '../../lib/cn.js';
import type { BlogArticle } from '@dark-angels/types';

interface BlogCardProps {
  article: BlogArticle;
  onClick?: () => void;
}

function AccessBadge({ level }: { level: string }) {
  if (level === 'public') return null;

  const colors: Record<string, string> = {
    vip: 'bg-accent/90 text-bg-primary',
    premium: 'bg-purple-600/90 text-white',
    invite: 'bg-blue-600/90 text-white',
  };

  const labels: Record<string, string> = {
    vip: 'VIP',
    premium: 'Premium',
    invite: 'Invite',
  };

  return (
    <div
      className={cn(
        'absolute top-2 left-2 flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium backdrop-blur-sm',
        colors[level] || 'bg-accent/90 text-bg-primary',
      )}
    >
      {level === 'vip' && (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-3 w-3">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      )}
      {labels[level] || level}
    </div>
  );
}

export default function BlogCard({ article, onClick }: BlogCardProps) {
  const title = useLocalized(article.title);

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
        {article.preview_image ? (
          <img
            src={article.preview_image}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full bg-bg-elevated" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-bg-card/80 to-transparent" />

        <AccessBadge level={article.access_level} />
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-text-primary line-clamp-2">{title}</h3>

        <p className="mt-2 text-sm text-accent group-hover:underline">
          {/* Read more → rendered by parent via i18n */}
        </p>

        {article.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {article.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-border px-2 py-0.5 text-xs text-text-muted"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
