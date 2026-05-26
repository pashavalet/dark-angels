import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface SubscriptionModalProps {
  isLocked: boolean;
  children: React.ReactNode;
}

export default function SubscriptionModal({ isLocked, children }: SubscriptionModalProps) {
  const { t } = useTranslation('common');
  const [open, setOpen] = useState(false);

  if (!isLocked) return <>{children}</>;

  return (
    <>
      <div onClick={() => setOpen(true)} className="cursor-pointer">
        {children}
      </div>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-border bg-bg-card p-6 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="text-5xl block mb-4">🔒</span>
            <h3 className="font-serif text-lg font-bold text-accent mb-2">
              {t('requires_subscription')}
            </h3>
            <p className="text-sm text-text-secondary mb-6">
              Подпишитесь на канал @markmakemoney, чтобы получить доступ к этому контенту
            </p>
            <div className="flex flex-col gap-3">
              <a
                href="https://t.me/markmakemoney"
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[44px] inline-flex items-center justify-center rounded-lg bg-accent px-6 text-sm font-medium text-bg-primary hover:opacity-90 focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
              >
                Подписаться
              </a>
              <button
                onClick={() => setOpen(false)}
                className="min-h-[44px] rounded-lg border border-border text-sm text-text-secondary hover:text-text-primary focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
              >
                {t('close', 'Закрыть')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}