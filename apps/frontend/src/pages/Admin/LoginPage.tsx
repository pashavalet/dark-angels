import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { login as loginApi } from '../../api/auth.js';
import { useAuthStore } from '../../stores/auth.js';

export default function LoginPage() {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const auth = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await loginApi(email, password);
      auth.login(res.data.access_token, res.data.admin);
      navigate('/admin');
    } catch (err: any) {
      setError(err.response?.data?.error?.message ?? 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-6">
        <h1 className="text-center font-serif text-3xl font-bold text-accent">Dark Angels</h1>

        {error && (
          <div className="rounded-lg border border-danger bg-danger/10 p-3 text-sm text-danger">{error}</div>
        )}

        <label className="block space-y-2">
          <span className="text-sm text-text-secondary">{t('email')}</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-lg border border-border bg-bg-card px-4 py-3 text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none min-h-[44px]"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm text-text-secondary">{t('password')}</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={12}
            className="w-full rounded-lg border border-border bg-bg-card px-4 py-3 text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none min-h-[44px]"
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-accent py-3 font-semibold text-bg-primary transition-opacity hover:opacity-90 active:opacity-80 disabled:opacity-50 min-h-[44px]"
        >
          {loading ? '...' : t('submit')}
        </button>
      </form>
    </div>
  );
}