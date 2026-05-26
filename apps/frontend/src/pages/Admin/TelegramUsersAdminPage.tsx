import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTelegramUsers, useDownloadTelegramUsers } from '../../api/admin.js';

export default function TelegramUsersAdminPage() {
  const { t } = useTranslation('common');
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [subscribedOnly, setSubscribedOnly] = useState(false);
  const [premiumOnly, setPremiumOnly] = useState(false);
  const [language, setLanguage] = useState('');

  const params = {
    page,
    limit: 20,
    ...(subscribedOnly ? { subscribed: true } : {}),
    ...(premiumOnly ? { premium: true } : {}),
    ...(language ? { language } : {}),
    ...(search ? { search } : {}),
  };

  const { data, isLoading } = useTelegramUsers(params);
  const downloadMutation = useDownloadTelegramUsers();

  const users = data?.data ?? [];
  const meta = data?.meta;

  return (
    <div className="flex flex-col gap-6 px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl font-bold text-accent">Telegram Users</h1>
        <div className="flex gap-2">
          <button
            onClick={() => downloadMutation.mutate(params)}
            disabled={downloadMutation.isPending}
            className="min-h-[44px] min-w-[44px] rounded-lg px-4 py-2.5 text-sm font-medium border border-accent/40 text-accent hover:bg-accent/10 disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
          >
            {downloadMutation.isPending ? '...' : 'CSV'}
          </button>
          <button
            onClick={() => navigate('/admin')}
            className="min-h-[44px] min-w-[44px] rounded-lg px-4 py-2.5 text-sm font-medium border border-border text-text-secondary hover:border-accent/30 focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
          >
            {t('back')}
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <input
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder={t('search', 'Search')}
          className="w-48 rounded-lg border border-border bg-bg-elevated px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted/50 focus:border-accent/50 focus:outline-none min-h-[44px]"
        />
        <label className="flex items-center gap-2 min-h-[44px] cursor-pointer">
          <input
            type="checkbox"
            checked={subscribedOnly}
            onChange={(e) => { setSubscribedOnly(e.target.checked); setPage(1); }}
            className="h-4 w-4 rounded border-border text-accent"
          />
          <span className="text-sm text-text-secondary">Subscribed</span>
        </label>
        <label className="flex items-center gap-2 min-h-[44px] cursor-pointer">
          <input
            type="checkbox"
            checked={premiumOnly}
            onChange={(e) => { setPremiumOnly(e.target.checked); setPage(1); }}
            className="h-4 w-4 rounded border-border text-accent"
          />
          <span className="text-sm text-text-secondary">Premium</span>
        </label>
        <select
          value={language}
          onChange={(e) => { setLanguage(e.target.value); setPage(1); }}
          className="rounded-lg border border-border bg-bg-elevated px-3 py-2.5 text-sm text-text-primary min-h-[44px]"
        >
          <option value="">All languages</option>
          <option value="ru">RU</option>
          <option value="en">EN</option>
          <option value="kk">KK</option>
          <option value="uz">UZ</option>
          <option value="ky">KY</option>
          <option value="uk">UK</option>
        </select>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-bg-card animate-pulse" />
          ))}
        </div>
      ) : users.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-16 text-center text-text-muted">
          <p>No Telegram users found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {users.map((u) => (
            <button
              key={u.telegram_id}
              onClick={() => navigate(`/admin/telegram-users/${u.telegram_id}`)}
              className="flex w-full items-center gap-4 rounded-xl border border-border bg-bg-card p-4 text-left transition-colors hover:border-accent/30 focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
            >
              <div className="h-10 w-10 shrink-0 rounded-full bg-bg-elevated flex items-center justify-center text-sm text-text-secondary">
                {u.first_name?.[0] ?? '?'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-text-primary truncate">
                    {u.first_name ?? u.username ?? `#${u.telegram_id}`}
                  </span>
                  {u.is_premium && (
                    <span className="shrink-0 text-xs px-1.5 py-0.5 rounded-full border border-accent/40 text-accent">⭐</span>
                  )}
                  {u.is_channel_subscriber && (
                    <span className="shrink-0 text-xs px-1.5 py-0.5 rounded-full bg-green-500/10 text-green-400">Sub</span>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-0.5 text-xs text-text-secondary">
                  {u.username && <span>@{u.username}</span>}
                  {u.language_code && <span>{u.language_code}</span>}
                  <span>{new Date(u.last_seen_at).toLocaleDateString()}</span>
                </div>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4 text-text-muted shrink-0">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          ))}
        </div>
      )}

      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="min-h-[44px] min-w-[44px] rounded-lg border border-border text-text-primary disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
          >
            ←
          </button>
          <span className="text-sm text-text-muted">
            {meta.page} / {meta.totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
            disabled={page >= meta.totalPages}
            className="min-h-[44px] min-w-[44px] rounded-lg border border-border text-text-primary disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
          >
            →
          </button>
        </div>
      )}
    </div>
  );
}