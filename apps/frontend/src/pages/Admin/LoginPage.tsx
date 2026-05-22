import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { login as loginApi, challenge2FA, recover2FA } from '../../api/auth.js';
import { useAuthStore } from '../../stores/auth.js';

export default function LoginPage() {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const auth = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [step, setStep] = useState<'login' | '2fa' | 'recovery'>('login');
  const [tempToken, setTempToken] = useState('');
  const [code, setCode] = useState(Array(6).fill(''));
  const [recoveryCode, setRecoveryCode] = useState('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>(Array(6).fill(null));

  function handleCodeChange(index: number, value: string) {
    if (!/^\d?$/.test(value)) return;
    const next = [...code];
    next[index] = value;
    setCode(next);
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleCodeKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await loginApi(email, password);
      if (res.data?.requires_2fa) {
        setTempToken(res.data.temp_token);
        setStep('2fa');
        setCode(Array(6).fill(''));
        setTimeout(() => inputRefs.current[0]?.focus(), 100);
      } else {
        auth.login(res.data.access_token, res.data.admin);
        navigate('/admin');
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message ?? 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  async function handle2FAVerify() {
    const token = code.join('');
    if (token.length !== 6) return;
    setError('');
    setLoading(true);
    try {
      const data = await challenge2FA(tempToken, token);
      auth.login(data.access_token, data.admin);
      navigate('/admin');
    } catch (err: any) {
      setError(err.response?.data?.error?.message ?? 'Verification failed');
    } finally {
      setLoading(false);
    }
  }

  async function handleRecovery() {
    if (!recoveryCode) return;
    setError('');
    setLoading(true);
    try {
      const data = await recover2FA(email, recoveryCode);
      auth.login(data.access_token, data.admin);
      navigate('/admin');
    } catch (err: any) {
      setError(err.response?.data?.error?.message ?? 'Recovery failed');
    } finally {
      setLoading(false);
    }
  }

  if (step === '2fa') {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center px-4">
        <div className="w-full max-w-sm space-y-6">
          <h1 className="text-center font-serif text-3xl font-bold text-accent">Dark Angels</h1>
          <p className="text-center text-sm text-text-secondary">{t('enter_2fa_code')}</p>

          {error && (
            <div className="rounded-lg border border-danger bg-danger/10 p-3 text-sm text-danger">{error}</div>
          )}

          <div className="flex justify-center gap-2">
            {code.map((digit, i) => (
              <input
                key={i}
                ref={(el) => { inputRefs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                autoFocus={i === 0}
                onChange={(e) => handleCodeChange(i, e.target.value)}
                onKeyDown={(e) => handleCodeKeyDown(i, e)}
                className="w-11 h-11 rounded-lg border border-border bg-bg-card text-center text-lg text-text-primary focus:border-accent focus:outline-none"
                style={{ minWidth: '44px', minHeight: '44px' }}
              />
            ))}
          </div>

          <button
            onClick={handle2FAVerify}
            disabled={loading || code.join('').length !== 6}
            className="w-full rounded-lg bg-accent py-3 font-semibold text-bg-primary transition-opacity hover:opacity-90 active:opacity-80 disabled:opacity-50"
            style={{ minHeight: '44px' }}
          >
            {loading ? '...' : t('verify_2fa')}
          </button>

          <button
            onClick={() => { setStep('recovery'); setError(''); }}
            className="w-full text-center text-sm text-text-muted hover:text-text-secondary transition-colors"
            style={{ minHeight: '44px' }}
          >
            {t('lost_access')}
          </button>

          <button
            onClick={() => { setStep('login'); setError(''); }}
            className="w-full text-center text-sm text-text-muted hover:text-text-secondary transition-colors"
            style={{ minHeight: '44px' }}
          >
            {t('back')}
          </button>
        </div>
      </div>
    );
  }

  if (step === 'recovery') {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center px-4">
        <div className="w-full max-w-sm space-y-6">
          <h1 className="text-center font-serif text-3xl font-bold text-accent">Dark Angels</h1>
          <p className="text-center text-sm text-text-secondary">{t('recover_account')}</p>

          {error && (
            <div className="rounded-lg border border-danger bg-danger/10 p-3 text-sm text-danger">{error}</div>
          )}

          <label className="block space-y-2">
            <span className="text-sm text-text-secondary">{t('email')}</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-border bg-bg-card px-4 py-3 text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none"
              style={{ minHeight: '44px' }}
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm text-text-secondary">{t('recovery_code')}</span>
            <input
              type="text"
              value={recoveryCode}
              onChange={(e) => setRecoveryCode(e.target.value.toUpperCase())}
              className="w-full rounded-lg border border-border bg-bg-card px-4 py-3 text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none font-mono"
              style={{ minHeight: '44px' }}
            />
          </label>

          <button
            onClick={handleRecovery}
            disabled={loading || !recoveryCode}
            className="w-full rounded-lg bg-accent py-3 font-semibold text-bg-primary transition-opacity hover:opacity-90 active:opacity-80 disabled:opacity-50"
            style={{ minHeight: '44px' }}
          >
            {loading ? '...' : t('recover_account')}
          </button>

          <button
            onClick={() => { setStep('2fa'); setError(''); }}
            className="w-full text-center text-sm text-text-muted hover:text-text-secondary transition-colors"
            style={{ minHeight: '44px' }}
          >
            {t('back')}
          </button>
        </div>
      </div>
    );
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
            className="w-full rounded-lg border border-border bg-bg-card px-4 py-3 text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none"
            style={{ minHeight: '44px' }}
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
            className="w-full rounded-lg border border-border bg-bg-card px-4 py-3 text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none"
            style={{ minHeight: '44px' }}
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-accent py-3 font-semibold text-bg-primary transition-opacity hover:opacity-90 active:opacity-80 disabled:opacity-50"
          style={{ minHeight: '44px' }}
        >
          {loading ? '...' : t('submit')}
        </button>
      </form>
    </div>
  );
}