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

  return (
    <div className="flex flex-col gap-6 px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl font-bold text-accent">{t('admin')}</h1>
        <button
          onClick={handleLogout}
          className="rounded-lg border border-border px-4 py-2 text-sm text-text-secondary transition-colors hover:bg-bg-elevated active:opacity-80 min-h-[44px]"
        >
          Logout
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {['Tours', 'Services', 'Blog', 'Homepage', 'Settings'].map((item) => (
          <div
            key={item}
            className="rounded-xl border border-border bg-bg-card p-6 text-center font-medium text-text-secondary"
          >
            {item} — coming soon
          </div>
        ))}
      </div>
    </div>
  );
}