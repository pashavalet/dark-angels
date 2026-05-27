import { cn } from '../../lib/cn.js';
import { useTranslation } from 'react-i18next';
import { parseContactLink } from '../../lib/contact-link.js';

interface ContactsDisplayProps {
  contacts: string | null;
  className?: string;
}

export default function ContactsDisplay({ contacts, className }: ContactsDisplayProps) {
  const { t } = useTranslation('common');

  if (!contacts) return null;

  const link = parseContactLink(contacts);
  const raw = contacts.trim();
  const buttonText = link && (raw === link.href || /^(https?:|tg:|mailto:)/i.test(raw))
    ? t('contacts')
    : link?.label ?? t('contacts');

  return (
    <div className={cn('mt-2', className)}>
      {link ? (
        <a
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className="block rounded-xl border border-accent bg-bg-card px-4 py-2.5 text-center text-sm font-medium text-accent transition-colors hover:bg-bg-elevated active:opacity-80 focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2 min-h-[44px]"
        >
          {buttonText}
        </a>
      ) : (
        <p className="text-sm font-medium text-text-primary break-all">{contacts}</p>
      )}
    </div>
  );
}
