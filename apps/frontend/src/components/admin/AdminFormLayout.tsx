import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
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
