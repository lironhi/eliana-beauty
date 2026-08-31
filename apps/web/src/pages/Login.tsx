import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useI18n } from '@/i18n';
import { useAuthStore } from '@/store/authStore';
import AuthShell from '@/components/AuthShell';
import AuthInput, { MailIcon, LockIcon } from '@/components/AuthInput';
import AuthSubmitButton from '@/components/AuthSubmitButton';
import AuthError from '@/components/AuthError';
import GoogleSignInButton from '@/components/GoogleSignInButton';

export default function Login() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || t('auth.loginError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell>
      <header className="animate-fade-in-up mb-8 text-center lg:text-start">
        {/* Sur grand écran, le logo ferait doublon avec la vitrine. */}
        <div className="animate-glow mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 lg:hidden">
          <img src="/logo.svg" alt="" className="h-9 w-9" />
        </div>
        <h1 className="text-4xl text-gray-900">{t('auth.login')}</h1>
        <p className="mt-2.5 text-[15px] text-gray-500">{t('auth.welcomeBack')}</p>
      </header>

      <AuthError message={error} />

      {/* Google en premier : c'est le chemin le plus court. */}
      <div className="animate-fade-in-up animation-delay-100">
        <GoogleSignInButton />
      </div>

      <div className="animate-fade-in-up animation-delay-200 my-7 flex items-center gap-4">
        <span className="h-px flex-1 bg-gradient-to-r from-transparent to-gray-200" />
        <span className="whitespace-nowrap text-xs uppercase tracking-wider text-gray-400">
          {t('auth.withEmail')}
        </span>
        <span className="h-px flex-1 bg-gradient-to-l from-transparent to-gray-200" />
      </div>

      <form onSubmit={handleSubmit} className="animate-fade-in-up animation-delay-300 space-y-5">
        <AuthInput
          id="login-email"
          label={t('auth.email')}
          icon={<MailIcon />}
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="nom@exemple.com"
        />

        <div>
          <AuthInput
            id="login-password"
            label={t('auth.password')}
            icon={<LockIcon />}
            passwordToggle
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            placeholder="••••••••"
          />
          <div className="mt-2 text-end">
            <Link
              to="/forgot-password"
              className="text-sm text-gray-500 underline-offset-4 transition-colors hover:text-pink-600 hover:underline"
            >
              {t('auth.forgotPassword')}
            </Link>
          </div>
        </div>

        <AuthSubmitButton
          loading={loading}
          label={t('auth.login')}
          loadingLabel={t('auth.signingIn')}
        />
      </form>

      <p className="animate-fade-in-up animation-delay-400 mt-8 text-center text-sm text-gray-600">
        {t('auth.noAccount')}{' '}
        <Link
          to="/register"
          className="font-semibold text-pink-600 underline-offset-4 transition-colors hover:text-purple-600 hover:underline"
        >
          {t('auth.register')}
        </Link>
      </p>
    </AuthShell>
  );
}
