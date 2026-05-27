import { cn } from '../../lib/cn.js';
import { useTranslation } from 'react-i18next';
import type { Tour, Service } from '@dark-angels/types';

interface ContactsDisplayProps {
  contacts: string | null;
  className?: string;
}

export default function ContactsDisplay({ contacts, className }: ContactsDisplayProps) {
  const { t } = useTranslation('common');

  if (!contacts) return null;

  const isTelegramUsername = contacts.startsWith('@');
  const href = isTelegramUsername 
    ? `https://t.me/${contacts.replace('@', '')}`
    : `https://t.me/${contacts}`;

  return (
    <div className={cn('mt-2', className)}>
      <p className="text-xs uppercase tracking-widest text-text-muted">
        {t('contacts')}
      </p>
      <a 
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-1 text-sm font-medium text-accent hover:underline"
      >
        {contacts}
      </a>
    </div>
  );
}