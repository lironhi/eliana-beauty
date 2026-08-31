import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useI18n } from '@/i18n';
import { api } from '@/lib/api';
import { PasswordStrength } from '@/components/PasswordStrength';
import AuthShell from '@/components/AuthShell';
import AuthInput, { LockIcon, ShieldIcon } from '@/components/AuthInput';
import AuthSubmitButton from '@/components/AuthSubmitButton';
import AuthError from '@/components/AuthError';

export default function ResetPassword() {
  const { t } = useI18n();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const mismatch = confirmPassword.length > 0 && password !== confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError(t('auth.passwordMismatch'));
      return;
    }

    setLoading(true);

    try {
      await api.resetPassword(token, password);
      setDone(true);
    } catch (err: any) {
      setError(err.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- Lien absent ---------------- */
  if (!token) {
    return (
      <AuthShell>
        <div className="animate-fade-in-up text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100">
            <svg
              className="h-8 w-8 text-amber-600"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
              />
            </svg>
          </div>

          <h1 className="text-3xl text-gray-900">{t('auth.resetInvalidTitle')}</h1>
          <p className="mt-4 text-[15px] leading-relaxed text-gray-600">
            {t('auth.resetInvalidBody')}
          </p>

          <Link
            to="/forgot-password"
            className="mt-8 inline-flex items-center gap-2 font-semibold text-pink-600 underline-offset-4 transition-colors hover:text-purple-600 hover:underline"
          >
            {t('auth.requestNewLink')}
          </Link>
        </div>
      </AuthShell>
    );
  }

  /* ---------------- Mot de passe enregistré ---------------- */
  if (done) {
    return (
      <AuthShell>
        <div className="animate-fade-in-up text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 shadow-lg shadow-pink-500/25">
            <svg
              className="h-8 w-8 text-white"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="text-3xl text-gray-900">{t('auth.resetSuccessTitle')}</h1>
          <p className="mt-4 text-[15px] leading-relaxed text-gray-600">
            {t('auth.resetSuccessBody')}
          </p>

          <Link
            to="/login"
            className="animate-gradient mt-8 inline-block w-full rounded-full bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-600 py-3.5 font-semibold text-white shadow-lg shadow-purple-500/30 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl"
          >
            {t('auth.login')}
          </Link>
        </div>
      </AuthShell>
    );
  }

  /* ---------------- Formulaire ---------------- */
  return (
    <AuthShell>
      <header className="animate-fade-in-up mb-8 text-center lg:text-start">
        <div className="animate-glow mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 lg:hidden">
          <img src="/logo.svg" alt="" className="h-9 w-9" />
        </div>
        <h1 className="text-4xl text-gray-900">{t('auth.resetTitle')}</h1>
        <p className="mt-2.5 text-[15px] leading-relaxed text-gray-500">
          {t('auth.resetSubtitle')}
        </p>
      </header>

      <AuthError message={error} />

      <form onSubmit={handleSubmit} className="animate-fade-in-up animation-delay-100 space-y-5">
        <div>
          <AuthInput
            id="reset-password"
            label={t('auth.newPassword')}
            icon={<LockIcon />}
            passwordToggle
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            maxLength={24}
            autoFocus
            placeholder="••••••••"
          />
          <div className="mt-3">
            <PasswordStrength password={password} />
          </div>
        </div>

        <div>
          <AuthInput
            id="reset-confirm-password"
            label={t('auth.confirmNewPassword')}
            icon={<ShieldIcon />}
            passwordToggle
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={6}
            maxLength={24}
            placeholder="••••••••"
            aria-invalid={mismatch}
          />
          {mismatch && (
            <p className="mt-2 flex items-center gap-1.5 text-sm text-red-600">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              {t('auth.passwordMismatch')}
            </p>
          )}
        </div>

        <AuthSubmitButton
          loading={loading}
          label={t('auth.resetSubmit')}
          loadingLabel={t('auth.resetting')}
        />
      </form>

      {/* Un lien périmé se manifeste par une erreur du serveur : on propose
          alors d'en redemander un plutôt que de laisser dans l'impasse. */}
      <p className="animate-fade-in-up animation-delay-200 mt-8 text-center text-sm text-gray-600">
        {error ? (
          <Link
            to="/forgot-password"
            className="font-semibold text-pink-600 underline-offset-4 transition-colors hover:text-purple-600 hover:underline"
          >
            {t('auth.requestNewLink')}
          </Link>
        ) : (
          <Link
            to="/login"
            className="font-semibold text-pink-600 underline-offset-4 transition-colors hover:text-purple-600 hover:underline"
          >
            {t('auth.backToLogin')}
          </Link>
        )}
      </p>
    </AuthShell>
  );
}
