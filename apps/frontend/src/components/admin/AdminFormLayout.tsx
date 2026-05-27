import type { ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

interface AdminFormLayoutProps {
  title: string;
  children: ReactNode;
  loading?: boolean;
  error?: string | null;
}

export default function AdminFormLayout({ title, children, loading, error }: AdminFormLayoutProps) {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const location = useLocation();

  const quickLinks = [
    { label: t('admin'), path: '/admin' },
    { label: t('settings'), path: '/admin/settings' },
    { label: t('two_factor_auth'), path: '/admin/two-factor' },
    { label: 'Telegram Users', path: '/admin/telegram-users' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="flex flex-col gap-6 px-4 py-8"
    >
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="flex min-h-[44px] min-w-[44px] items-center gap-1.5 rounded-lg border border-border px-4 text-sm text-text-secondary transition-colors hover:border-accent/30 focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
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
        <h1 className="font-serif text-3xl font-bold text-accent">{title}</h1>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {quickLinks.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              type="button"
              onClick={() => navigate(item.path)}
              className={isActive
                ? 'min-h-[44px] rounded-lg border border-accent bg-accent/10 px-3 text-sm font-medium text-accent focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2'
                : 'min-h-[44px] rounded-lg border border-border bg-bg-card px-3 text-sm text-text-secondary transition-colors hover:border-accent/30 focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2'}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {loading ? (
        <div className="animate-pulse space-y-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-bg-card" />
          ))}
        </div>
      ) : (
        <form
          className="space-y-6"
          onSubmit={(e) => e.preventDefault()}
        >
          {children}
        </form>
      )}
    </motion.div>
  );
}
