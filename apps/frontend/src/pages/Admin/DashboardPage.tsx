import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { logout as logoutApi } from '../../api/auth.js';
import { useAdminStats } from '../../api/admin.js';
import { useAuthStore } from '../../stores/auth.js';
import { useLocaleStore } from '../../stores/locale.js';

function getLocTitle(obj: Record<string, string> | undefined, locale: string) {
  if (!obj) return '';
  return obj[locale] ?? obj['ru'] ?? obj['en'] ?? Object.values(obj)[0] ?? '';
}

export default function AdminDashboard() {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const auth = useAuthStore();
  const { locale } = useLocaleStore();
  const { data: stats, isLoading } = useAdminStats();

  async function handleLogout() {
    try {
      await logoutApi();
    } catch {
      // ignore
    }
    auth.logout();
    navigate('/admin/login');
  }

  const statCards = [
    { label: t('tours'), count: stats?.counts.tours ?? 0, path: '/admin/tours' },
    { label: t('services'), count: stats?.counts.services ?? 0, path: '/admin/services' },
    { label: t('blog'), count: stats?.counts.blog ?? 0, path: '/admin/blog' },
    { label: 'Telegram', count: stats?.counts.telegram_users ?? 0, path: '/admin/telegram-users' },
  ];

  const navCards = [
    { label: t('tours'), path: '/admin/tours' },
    { label: t('services'), path: '/admin/services' },
    { label: t('blog'), path: '/admin/blog' },
    { label: t('collections'), path: '/admin/collections' },
    { label: 'Telegram Users', path: '/admin/telegram-users' },
    { label: t('two_factor_auth'), path: '/admin/two-factor' },
    { label: t('settings'), path: '/admin/settings' },
  ];

  return (
    <div className="flex flex-col gap-6 px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl font-bold text-accent">{t('admin')}</h1>
        <button
          onClick={handleLogout}
          className="rounded-lg border border-border px-4 py-2 text-sm text-text-secondary transition-colors hover:bg-bg-elevated active:opacity-80 focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
          style={{ minHeight: '44px' }}
        >
          {t('logout')}
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {statCards.map((item) => (
          <button
            key={item.label}
            onClick={() => navigate(item.path)}
            className="rounded-xl border border-border bg-bg-card p-6 text-left transition-colors hover:border-accent focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
          >
            <div className="text-3xl font-bold text-accent">
              {isLoading ? '...' : item.count}
            </div>
            <div className="mt-1 text-sm text-text-secondary">{item.label}</div>
          </button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {navCards.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className="rounded-xl border border-border bg-bg-card px-4 py-3 text-left text-sm font-medium text-text-primary transition-colors hover:border-accent focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
          >
            {item.label}
          </button>
        ))}
      </div>

      {stats?.recent && (
        <>
          <h2 className="mt-4 font-serif text-xl font-bold text-text-primary">{t('new_tours')}</h2>
          <div className="space-y-2">
            {stats.recent.tours.slice(0, 3).map((tour) => (
              <button
                key={tour.id}
                onClick={() => navigate(`/admin/tours/${tour.id}`)}
                className="flex w-full items-center gap-3 rounded-lg border border-border bg-bg-card p-3 text-left text-sm transition-colors hover:border-accent focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
              >
                <span className="flex-1 truncate text-text-primary">{getLocTitle(tour.title, locale)}</span>
                <span className="text-xs text-text-secondary">
                  {new Date(tour.created_at).toLocaleDateString()}
                </span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
