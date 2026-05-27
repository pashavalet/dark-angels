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

  return (
    <div className={cn('mt-2', className)}>
      <p className="text-xs uppercase tracking-widest text-text-muted">
        {t('contacts')}
      </p>
      {link ? (
        <a
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 block text-sm font-medium text-accent hover:underline break-all"
        >
          {link.label}
        </a>
      ) : (
        <p className="mt-1 text-sm font-medium text-text-primary break-all">{contacts}</p>
      )}
    </div>
  );
}
