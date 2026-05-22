import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { logout as logoutApi } from '../../api/auth.js';
import { useAuthStore } from '../../stores/auth.js';

export default function AdminDashboard() {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const auth = useAuthStore();

  async function handleLogout() {
    try {
      await logoutApi();
    } catch {
      // ignore
    }
    auth.logout();
    navigate('/admin/login');
  }

  const cards = [
    { label: t('tours'), path: '/admin' },
    { label: t('services'), path: '/admin' },
    { label: t('blog'), path: '/admin' },
    { label: t('home'), path: '/admin' },
    { label: t('two_factor_auth'), path: '/admin/two-factor' },
    { label: t('settings'), path: '/admin' },
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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((item) => (
          <button
            key={item.label}
            onClick={() => item.path !== '/admin' && navigate(item.path)}
            className="rounded-xl border border-border bg-bg-card p-6 text-center font-medium text-text-secondary transition-colors hover:border-accent hover:text-text-primary focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
            style={{ minHeight: '64px' }}
          >
            {item.label}{item.path === '/admin' ? ` — ${t('coming_soon')}` : ''}
          </button>
        ))}
      </div>
    </div>
  );
}