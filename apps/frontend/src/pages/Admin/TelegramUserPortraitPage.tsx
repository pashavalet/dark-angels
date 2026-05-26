import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTelegramUser } from '../../api/admin.js';

export default function TelegramUserPortraitPage() {
  const { telegramId } = useParams<{ telegramId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation('common');

  const { data, isLoading, isError } = useTelegramUser(telegramId ?? '');

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6 px-4 py-8">
        <div className="h-10 w-24 rounded bg-bg-elevated" />
        <div className="h-32 w-full rounded-xl bg-bg-elevated" />
        <div className="h-8 w-1/2 rounded bg-bg-elevated" />
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 rounded-xl bg-bg-elevated" />
          ))}
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-16">
        <p className="text-text-muted">User not found</p>
        <button
          onClick={() => navigate('/admin/telegram-users')}
          className="mt-4 min-h-[44px] rounded-lg border border-border px-6 text-text-primary"
        >
          {t('back')}
        </button>
      </div>
    );
  }

  const { user, activity, stats } = data;

  const avatarUrl = user.username
    ? `https://t.me/i/userpic/320/${user.username}.jpg`
    : null;

  const locale = user.language_code ?? 'ru';

  return (
    <div className="flex flex-col gap-6 px-4 py-8 max-w-2xl mx-auto">
      <button
        onClick={() => navigate('/admin/telegram-users')}
        className="self-start min-h-[44px] rounded-lg border border-border px-4 text-sm text-text-secondary hover:border-accent/30 focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
      >
        ← {t('back')}
      </button>

      <div className="flex items-center gap-6 rounded-xl border border-border bg-bg-card p-6">
        {avatarUrl ? (
          <img src={avatarUrl} alt="" className="h-20 w-20 rounded-full object-cover" />
        ) : (
          <div className="h-20 w-20 rounded-full bg-bg-elevated flex items-center justify-center text-2xl text-text-secondary">
            {user.first_name?.[0] ?? '?'}
          </div>
        )}
        <div className="min-w-0">
          <h1 className="font-serif text-2xl font-bold text-accent">
            {user.first_name ?? 'Unknown'}
          </h1>
          <div className="mt-1 flex flex-wrap gap-3 text-sm text-text-secondary">
            {user.username && <span>@{user.username}</span>}
            <span>ID: {user.telegram_id}</span>
            {user.language_code && <span>{user.language_code}</span>}
          </div>
          <div className="mt-3 flex gap-2">
            {user.is_channel_subscriber && (
              <span className="text-xs px-2 py-1 rounded-full bg-green-500/10 text-green-400">Subscribed</span>
            )}
            {user.is_premium && (
              <span className="text-xs px-2 py-1 rounded-full border border-accent/40 text-accent">Premium</span>
            )}
            <span className="text-xs px-2 py-1 rounded-full bg-bg-elevated text-text-secondary">
              {user.access_level}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-border bg-bg-card p-4 text-center">
          <div className="text-2xl font-bold text-accent">{stats.total_interactions}</div>
          <div className="text-xs text-text-secondary mt-1">Interactions</div>
        </div>
        <div className="rounded-xl border border-border bg-bg-card p-4 text-center">
          <div className="text-2xl font-bold text-accent">{stats.unique_pages}</div>
          <div className="text-xs text-text-secondary mt-1">Pages</div>
        </div>
        <div className="rounded-xl border border-border bg-bg-card p-4 text-center">
          <div className="text-2xl font-bold text-accent">{new Date(user.first_seen_at).toLocaleDateString(locale)}</div>
          <div className="text-xs text-text-secondary mt-1">First seen</div>
        </div>
      </div>

      <div>
        <h2 className="font-serif text-lg font-bold text-text-primary mb-3">Page Breakdown</h2>
        <div className="rounded-xl border border-border bg-bg-card p-4">
          {Object.keys(stats.page_breakdown).length === 0 ? (
            <p className="text-sm text-text-muted">No data</p>
          ) : (
            <div className="space-y-2">
              {Object.entries(stats.page_breakdown)
                .sort(([, a], [, b]) => b - a)
                .map(([page, count]) => (
                  <div key={page} className="flex items-center justify-between">
                    <span className="text-sm text-text-primary">{page}</span>
                    <span className="text-sm text-text-secondary">{count}x</span>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      <div>
        <h2 className="font-serif text-lg font-bold text-text-primary mb-3">Activity Log</h2>
        <div className="space-y-2">
          {activity.length === 0 ? (
            <div className="rounded-xl border border-border bg-bg-card p-4 text-center text-sm text-text-muted">
              No activity yet
            </div>
          ) : (
            activity.slice(0, 50).map((a) => (
              <div key={a.id} className="flex items-center gap-3 rounded-xl border border-border bg-bg-card p-3 text-sm">
                <span className="text-text-accent font-medium">{a.page ?? '—'}</span>
                {a.item_type && (
                  <span className="text-xs px-1.5 py-0.5 rounded-full bg-bg-elevated text-text-secondary">{a.item_type}</span>
                )}
                <span className="text-xs text-text-muted ml-auto">
                  {new Date(a.created_at).toLocaleString(locale)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}