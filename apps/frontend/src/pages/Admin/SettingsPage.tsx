import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import AdminFormLayout from '../../components/admin/AdminFormLayout.js';
import { getProfile, updateEmail, changePassword } from '../../api/auth.js';
import { useAuthStore } from '../../stores/auth.js';

interface ProfileData {
  id: string;
  email: string;
  totp_enabled: boolean;
  last_login: string | null;
  created_at: string | null;
}

interface EmailForm {
  new_email: string;
  password: string;
}

interface PasswordForm {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

const initialEmailForm: EmailForm = { new_email: '', password: '' };
const initialPasswordForm: PasswordForm = { current_password: '', new_password: '', confirm_password: '' };

export default function SettingsPage() {
  const { t } = useTranslation('common');
  const auth = useAuthStore();

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState('');

  const [emailForm, setEmailForm] = useState<EmailForm>(initialEmailForm);
  const [savingEmail, setSavingEmail] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [emailSuccess, setEmailSuccess] = useState(false);

  const [passwordForm, setPasswordForm] = useState<PasswordForm>(initialPasswordForm);
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await getProfile();
        if (!cancelled) setProfile(data);
      } catch (err: any) {
        if (!cancelled) setProfileError(err.response?.data?.error?.message ?? t('save_error'));
      } finally {
        if (!cancelled) setProfileLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [t]);

  async function handleUpdateEmail() {
    setEmailError('');
    setEmailSuccess(false);
    setSavingEmail(true);
    try {
      await updateEmail(emailForm.new_email, emailForm.password);
      auth.updateEmail(emailForm.new_email);
      setEmailForm(initialEmailForm);
      setEmailSuccess(true);
      setProfile((p) => p ? { ...p, email: emailForm.new_email } : p);
    } catch (err: any) {
      const msg = err.response?.data?.error?.message;
      if (msg?.toLowerCase().includes('password')) {
        setEmailError(t('incorrect_password'));
      } else if (msg?.toLowerCase().includes('already') || msg?.toLowerCase().includes('exist')) {
        setEmailError(t('email_in_use'));
      } else {
        setEmailError(msg ?? t('save_error'));
      }
    } finally {
      setSavingEmail(false);
    }
  }

  async function handleChangePassword() {
    setPasswordError('');
    setPasswordSuccess(false);
    if (passwordForm.new_password.length < 12) {
      setPasswordError(t('password_min_length'));
      return;
    }
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setPasswordError(t('passwords_dont_match'));
      return;
    }
    setSavingPassword(true);
    try {
      await changePassword(passwordForm.current_password, passwordForm.new_password);
      setPasswordForm(initialPasswordForm);
      setPasswordSuccess(true);
    } catch (err: any) {
      const msg = err.response?.data?.error?.message;
      if (msg?.toLowerCase().includes('password')) {
        setPasswordError(t('incorrect_password'));
      } else {
        setPasswordError(msg ?? t('save_error'));
      }
    } finally {
      setSavingPassword(false);
    }
  }

  return (
    <AdminFormLayout title={t('settings')} loading={profileLoading} error={profileError || undefined}>
      <section className="rounded-xl border border-border bg-bg-card p-6 space-y-3">
        <h2 className="text-lg font-semibold text-text-primary">{t('profile')}</h2>
        <div className="flex flex-col gap-3 text-sm">
          <div className="flex justify-between border-b border-border/50 pb-2">
            <span className="text-text-muted">{t('email')}</span>
            <span className="text-text-primary">{profile?.email ?? '...'}</span>
          </div>
          <div className="flex justify-between border-b border-border/50 pb-2">
            <span className="text-text-muted">{t('two_factor_status')}</span>
            <span className={profile?.totp_enabled ? 'text-green-400' : 'text-text-muted'}>
              {profile?.totp_enabled ? t('enabled') : t('disabled')}
            </span>
          </div>
          <div className="flex justify-between border-b border-border/50 pb-2">
            <span className="text-text-muted">{'Last login'}</span>
            <span className="text-text-primary">{formatDate(profile?.last_login ?? null)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-muted">{t('member_since')}</span>
            <span className="text-text-primary">{formatDate(profile?.created_at ?? null)}</span>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-bg-card p-6 space-y-4">
        <h2 className="text-lg font-semibold text-text-primary">{t('change_email')}</h2>

        {emailSuccess && (
          <div className="rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-400">
            {t('email_updated')}
          </div>
        )}
        {emailError && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {emailError}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-secondary">{t('new_email')}</label>
            <input
              type="email"
              value={emailForm.new_email}
              onChange={(e) => setEmailForm((f) => ({ ...f, new_email: e.target.value }))}
              className="w-full rounded-lg border border-border bg-bg-elevated px-4 py-3 text-sm text-text-primary placeholder:text-text-muted/50 transition-colors focus:border-accent/50 focus:outline-none focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-secondary">{t('current_password')}</label>
            <input
              type="password"
              value={emailForm.password}
              onChange={(e) => setEmailForm((f) => ({ ...f, password: e.target.value }))}
              className="w-full rounded-lg border border-border bg-bg-elevated px-4 py-3 text-sm text-text-primary placeholder:text-text-muted/50 transition-colors focus:border-accent/50 focus:outline-none focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
            />
          </div>
          <button
            type="button"
            onClick={handleUpdateEmail}
            disabled={savingEmail || !emailForm.new_email || !emailForm.password}
            className="min-h-[44px] rounded-lg bg-accent px-6 py-2.5 text-sm font-medium text-bg-primary hover:opacity-90 disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
          >
            {savingEmail ? t('saving') : t('save')}
          </button>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-bg-card p-6 space-y-4">
        <h2 className="text-lg font-semibold text-text-primary">{t('change_password')}</h2>

        {passwordSuccess && (
          <div className="rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-400">
            {t('password_updated')}
          </div>
        )}
        {passwordError && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {passwordError}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-secondary">{t('current_password')}</label>
            <input
              type="password"
              value={passwordForm.current_password}
              onChange={(e) => setPasswordForm((f) => ({ ...f, current_password: e.target.value }))}
              className="w-full rounded-lg border border-border bg-bg-elevated px-4 py-3 text-sm text-text-primary placeholder:text-text-muted/50 transition-colors focus:border-accent/50 focus:outline-none focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-secondary">{t('new_password')}</label>
            <input
              type="password"
              value={passwordForm.new_password}
              onChange={(e) => setPasswordForm((f) => ({ ...f, new_password: e.target.value }))}
              className="w-full rounded-lg border border-border bg-bg-elevated px-4 py-3 text-sm text-text-primary placeholder:text-text-muted/50 transition-colors focus:border-accent/50 focus:outline-none focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
            />
            <p className="mt-1 text-xs text-text-muted">{t('password_min_length')}</p>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-secondary">{t('confirm_new_password')}</label>
            <input
              type="password"
              value={passwordForm.confirm_password}
              onChange={(e) => setPasswordForm((f) => ({ ...f, confirm_password: e.target.value }))}
              className="w-full rounded-lg border border-border bg-bg-elevated px-4 py-3 text-sm text-text-primary placeholder:text-text-muted/50 transition-colors focus:border-accent/50 focus:outline-none focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
            />
          </div>
          <button
            type="button"
            onClick={handleChangePassword}
            disabled={savingPassword || !passwordForm.current_password || !passwordForm.new_password || !passwordForm.confirm_password}
            className="min-h-[44px] rounded-lg bg-accent px-6 py-2.5 text-sm font-medium text-bg-primary hover:opacity-90 disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
          >
            {savingPassword ? t('saving') : t('save')}
          </button>
        </div>
      </section>
    </AdminFormLayout>
  );
}