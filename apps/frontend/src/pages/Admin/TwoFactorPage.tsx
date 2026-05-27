import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { setup2FA, verify2FA, disable2FA } from '../../api/auth.js';

export default function TwoFactorPage() {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const [step, setStep] = useState<'idle' | 'setup' | 'codes' | 'disable'>('idle');
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [code, setCode] = useState(Array(6).fill(''));
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>(Array(6).fill(null));

  const quickNav = (
    <div className="grid w-full max-w-sm grid-cols-3 gap-2">
      <button type="button" onClick={() => navigate('/admin')} className="min-h-[44px] rounded-lg border border-border bg-bg-card px-3 text-sm text-text-secondary">Stats</button>
      <button type="button" onClick={() => navigate('/admin/settings')} className="min-h-[44px] rounded-lg border border-border bg-bg-card px-3 text-sm text-text-secondary">{t('settings')}</button>
      <button type="button" onClick={() => navigate('/admin/telegram-users')} className="min-h-[44px] rounded-lg border border-border bg-bg-card px-3 text-sm text-text-secondary">Telegram</button>
    </div>
  );

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

  async function handleSetup() {
    setError('');
    setLoading(true);
    try {
      const data = await setup2FA();
      setQrCode(data.qr_code);
      setSecret(data.secret);
      setStep('setup');
    } catch (err: any) {
      setError(err.response?.data?.error?.message ?? t('error_setup_failed'));
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify() {
    const token = code.join('');
    if (token.length !== 6) return;
    setError('');
    setLoading(true);
    try {
      const data = await verify2FA(token);
      setRecoveryCodes(data.recovery_codes);
      setStep('codes');
    } catch (err: any) {
      setError(err.response?.data?.error?.message ?? t('error_verification_failed'));
    } finally {
      setLoading(false);
    }
  }

  async function handleDisable() {
    const token = code.join('');
    if (token.length !== 6) return;
    setError('');
    setLoading(true);
    try {
      await disable2FA(token);
      setStep('idle');
      setCode(Array(6).fill(''));
    } catch (err: any) {
      setError(err.response?.data?.error?.message ?? t('error_disable_failed'));
    } finally {
      setLoading(false);
    }
  }

  async function handleCopyCodes() {
    await navigator.clipboard.writeText(recoveryCodes.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDone() {
    setStep('idle');
    setQrCode(null);
    setRecoveryCodes([]);
    setCode(Array(6).fill(''));
  }

  if (step === 'setup' && qrCode) {
    return (
      <div className="flex flex-col items-center gap-6 px-4 py-8">
        {quickNav}
        <h1 className="font-serif text-2xl font-bold text-accent">{t('two_factor_auth')}</h1>
        <p className="text-sm text-text-secondary">{t('scan_qr_code')}</p>
        <div className="rounded-xl bg-white p-4">
          <img src={qrCode} alt={t('qr_code_alt')} className="size-52" />
        </div>
        {secret && (
          <p className="font-mono text-xs text-text-muted break-all">{secret}</p>
        )}
        {error && (
          <div className="w-full max-w-sm rounded-lg border border-danger bg-danger/10 p-3 text-sm text-danger">{error}</div>
        )}
        <div className="flex gap-2">
          {code.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { inputRefs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleCodeChange(i, e.target.value)}
              onKeyDown={(e) => handleCodeKeyDown(i, e)}
              className="w-11 h-11 rounded-lg border border-border bg-bg-card text-center text-lg text-text-primary focus:border-accent focus:outline-none"
              style={{ minWidth: '44px', minHeight: '44px' }}
              aria-label={t('digit_n', 'Digit {{n}}').replace('{{n}}', String(i + 1))}
            />
          ))}
        </div>
        <button
          onClick={handleVerify}
          disabled={loading || code.join('').length !== 6}
          className="w-full max-w-sm rounded-lg bg-accent py-3 font-semibold text-bg-primary transition-opacity hover:opacity-90 active:opacity-80 disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
          style={{ minHeight: '44px' }}
        >
          {loading ? t('loading') : t('verify_2fa')}
        </button>
      </div>
    );
  }

  if (step === 'codes') {
    return (
      <div className="flex flex-col items-center gap-6 px-4 py-8">
        {quickNav}
        <h1 className="font-serif text-2xl font-bold text-accent">{t('recovery_codes')}</h1>
        <p className="text-sm text-text-secondary">{t('save_recovery_codes')}</p>
        <div className="grid grid-cols-2 gap-2 w-full max-w-sm">
          {recoveryCodes.map((rc, i) => (
            <div
              key={i}
              className="rounded-lg border border-border bg-bg-card px-3 py-2 text-center font-mono text-sm text-text-primary"
            >
              {rc}
            </div>
          ))}
        </div>
        <div className="flex gap-3 w-full max-w-sm">
          <button
            onClick={handleCopyCodes}
            className="flex-1 rounded-lg border border-border py-3 text-sm text-text-secondary transition-colors hover:bg-bg-elevated active:opacity-80 focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
            style={{ minHeight: '44px' }}
          >
            {copied ? t('copied') : t('copy')}
          </button>
          <button
            onClick={handleDone}
            className="flex-1 rounded-lg bg-accent py-3 font-semibold text-bg-primary transition-opacity hover:opacity-90 active:opacity-80 focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
            style={{ minHeight: '44px' }}
          >
            {t('done')}
          </button>
        </div>
      </div>
    );
  }

  if (step === 'disable') {
    return (
      <div className="flex flex-col items-center gap-6 px-4 py-8">
        {quickNav}
        <h1 className="font-serif text-2xl font-bold text-accent">{t('disable_2fa')}</h1>
        <p className="text-sm text-text-secondary">{t('enter_2fa_code')}</p>
        {error && (
          <div className="w-full max-w-sm rounded-lg border border-danger bg-danger/10 p-3 text-sm text-danger">{error}</div>
        )}
        <div className="flex gap-2">
          {code.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { inputRefs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleCodeChange(i, e.target.value)}
              onKeyDown={(e) => handleCodeKeyDown(i, e)}
              className="w-11 h-11 rounded-lg border border-border bg-bg-card text-center text-lg text-text-primary focus:border-accent focus:outline-none"
              style={{ minWidth: '44px', minHeight: '44px' }}
              aria-label={t('digit_n', 'Digit {{n}}').replace('{{n}}', String(i + 1))}
            />
          ))}
        </div>
        <div className="flex gap-3 w-full max-w-sm">
          <button
            onClick={() => { setStep('idle'); setCode(Array(6).fill('')); setError(''); }}
            className="flex-1 rounded-lg border border-border py-3 text-sm text-text-secondary transition-colors hover:bg-bg-elevated active:opacity-80 focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
            style={{ minHeight: '44px' }}
          >
            {t('back')}
          </button>
          <button
            onClick={handleDisable}
            disabled={loading || code.join('').length !== 6}
            className="flex-1 rounded-lg bg-accent py-3 font-semibold text-bg-primary transition-opacity hover:opacity-90 active:opacity-80 disabled:opacity-50"
            style={{ minHeight: '44px' }}
          >
            {loading ? t('loading') : t('disable_2fa')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6 px-4 py-8">
      {quickNav}
      <h1 className="font-serif text-2xl font-bold text-accent">{t('two_factor_auth')}</h1>

      {error && (
        <div className="w-full max-w-sm rounded-lg border border-danger bg-danger/10 p-3 text-sm text-danger">{error}</div>
      )}

      <div className="flex flex-col gap-3 w-full max-w-sm">
        <button
          onClick={handleSetup}
          disabled={loading}
          className="w-full rounded-lg bg-accent py-3 font-semibold text-bg-primary transition-opacity hover:opacity-90 active:opacity-80 disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
          style={{ minHeight: '44px' }}
        >
          {loading ? t('loading') : t('enable_2fa')}
        </button>
        <button
          onClick={() => { setStep('disable'); setCode(Array(6).fill('')); setError(''); }}
          className="w-full rounded-lg border border-border py-3 text-sm text-text-secondary transition-colors hover:bg-bg-elevated active:opacity-80 focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
          style={{ minHeight: '44px' }}
        >
          {t('disable_2fa')}
        </button>
      </div>
    </div>
  );
}
