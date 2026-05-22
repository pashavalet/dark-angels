import { useTranslation } from 'react-i18next';
import { cn } from '../../lib/cn.js';

interface VipBadgeProps {
  level?: string;
}

export default function VipBadge({ level = 'vip' }: VipBadgeProps) {
  const { t } = useTranslation('common');

  if (level === 'public') return null;

  const styles: Record<string, string> = {
    vip: 'bg-accent/90 text-bg-primary',
    premium: 'bg-purple-600/90 text-white',
    invite: 'bg-blue-600/90 text-white',
  };

  return (
    <span
      className={cn(
        'min-h-[44px] inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold backdrop-blur-sm',
        styles[level] || 'bg-accent/90 text-bg-primary',
      )}
    >
      {level === 'vip' && (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-3 w-3">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      )}
      {t(`vip_level_${level}`, level.charAt(0).toUpperCase() + level.slice(1))}
    </span>
  );
}
