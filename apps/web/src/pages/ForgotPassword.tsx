import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '@/i18n';
import { api } from '@/lib/api';
import AuthShell from '@/components/AuthShell';
import AuthInput, { MailIcon } from '@/components/AuthInput';
import AuthSubmitButton from '@/components/AuthSubmitButton';
import AuthError from '@/components/AuthError';

export default function ForgotPassword() {
  const { t, locale } = useI18n();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.forgotPassword(email, locale);
      setSent(true);
    } catch (err: any) {
      // L'API répond pareil pour un e-mail inconnu : une erreur ici veut dire
      // que la requête n'est pas passée du tout.
      setError(err.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <AuthShell>
        <div className="animate-fade-in-up text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 shadow-lg shadow-pink-500/25">
            <svg
              className="h-8 w-8 text-white"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>

          <h1 className="text-3xl text-gray-900">{t('auth.resetLinkSentTitle')}</h1>
          <p className="mt-4 text-[15px] leading-relaxed text-gray-600">
            {t('auth.resetLinkSentBody', { email })}
          </p>
          <p className="mt-4 text-sm text-gray-400">{t('auth.resetLinkNotReceived')}</p>

          <Link
            to="/login"
            className="mt-8 inline-flex items-center gap-2 font-semibold text-pink-600 underline-offset-4 transition-colors hover:text-purple-600 hover:underline"
          >
            {t('auth.backToLogin')}
          </Link>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <header className="animate-fade-in-up mb-8 text-center lg:text-start">
        <div className="animate-glow mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 lg:hidden">
          <img src="/logo.svg" alt="" className="h-9 w-9" />
        </div>
        <h1 className="text-4xl text-gray-900">{t('auth.forgotTitle')}</h1>
        <p className="mt-2.5 text-[15px] leading-relaxed text-gray-500">
          {t('auth.forgotSubtitle')}
        </p>
      </header>

      <AuthError message={error} />

      <form onSubmit={handleSubmit} className="animate-fade-in-up animation-delay-100 space-y-5">
        <AuthInput
          id="forgot-email"
          label={t('auth.email')}
          icon={<MailIcon />}
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoFocus
          placeholder="nom@exemple.com"
        />

        <AuthSubmitButton
          loading={loading}
          label={t('auth.sendResetLink')}
          loadingLabel={t('auth.sendingResetLink')}
        />
      </form>

      <p className="animate-fade-in-up animation-delay-200 mt-8 text-center text-sm text-gray-600">
        <Link
          to="/login"
          className="font-semibold text-pink-600 underline-offset-4 transition-colors hover:text-purple-600 hover:underline"
        >
          {t('auth.backToLogin')}
        </Link>
      </p>
    </AuthShell>
  );
}
