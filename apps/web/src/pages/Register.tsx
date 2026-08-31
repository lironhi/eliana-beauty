import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useI18n } from '@/i18n';
import { useAuthStore } from '@/store/authStore';
import { PasswordStrength } from '@/components/PasswordStrength';
import AuthShell from '@/components/AuthShell';
import AuthInput, {
  UserIcon,
  MailIcon,
  PhoneIcon,
  LockIcon,
  ShieldIcon,
} from '@/components/AuthInput';
import AuthSubmitButton from '@/components/AuthSubmitButton';
import AuthError from '@/components/AuthError';
import GoogleSignInButton from '@/components/GoogleSignInButton';

export default function Register() {
  const { t, locale } = useI18n();
  const navigate = useNavigate();
  const { register } = useAuthStore();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const mismatch =
    formData.confirmPassword.length > 0 && formData.password !== formData.confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError(t('auth.passwordMismatch'));
      return;
    }

    setLoading(true);

    try {
      const { confirmPassword, ...registerData } = formData;
      await register({ ...registerData, locale });
      navigate('/');
    } catch (err: any) {
      setError(err.message || t('auth.registerError'));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <AuthShell>
      <header className="animate-fade-in-up mb-8 text-center lg:text-start">
        {/* Sur grand écran, le logo ferait doublon avec la vitrine. */}
        <div className="animate-glow mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 lg:hidden">
          <img src="/logo.svg" alt="" className="h-9 w-9" />
        </div>
        <h1 className="text-4xl text-gray-900">{t('auth.register')}</h1>
        <p className="mt-2.5 text-[15px] text-gray-500">{t('auth.joinFamily')}</p>
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
          id="register-name"
          label={t('auth.name')}
          icon={<UserIcon />}
          type="text"
          name="name"
          autoComplete="name"
          value={formData.name}
          onChange={handleChange}
          required
          minLength={2}
          placeholder={t('auth.namePlaceholder')}
        />

        <AuthInput
          id="register-email"
          label={t('auth.email')}
          icon={<MailIcon />}
          type="email"
          name="email"
          autoComplete="email"
          value={formData.email}
          onChange={handleChange}
          required
          placeholder="nom@exemple.com"
        />

        <AuthInput
          id="register-phone"
          label={t('auth.phone')}
          icon={<PhoneIcon />}
          type="tel"
          name="phone"
          autoComplete="tel"
          value={formData.phone}
          onChange={handleChange}
          required
          placeholder="05X-XXX-XXXX"
        />

        <div>
          <AuthInput
            id="register-password"
            label={t('auth.password')}
            icon={<LockIcon />}
            passwordToggle
            name="password"
            autoComplete="new-password"
            value={formData.password}
            onChange={handleChange}
            required
            minLength={6}
            maxLength={24}
            placeholder="••••••••"
          />
          <div className="mt-3">
            <PasswordStrength password={formData.password} />
          </div>
        </div>

        <div>
          <AuthInput
            id="register-confirm-password"
            label={t('auth.confirmPassword')}
            icon={<ShieldIcon />}
            passwordToggle
            name="confirmPassword"
            autoComplete="new-password"
            value={formData.confirmPassword}
            onChange={handleChange}
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
          label={t('auth.register')}
          loadingLabel={t('auth.creatingAccount')}
        />
      </form>

      <div className="animate-fade-in-up animation-delay-400">
        <p className="mt-8 text-center text-sm text-gray-600">
          {t('auth.hasAccount')}{' '}
          <Link
            to="/login"
            className="font-semibold text-pink-600 underline-offset-4 transition-colors hover:text-purple-600 hover:underline"
          >
            {t('auth.login')}
          </Link>
        </p>

        <div className="mt-7 flex items-center justify-center gap-6 border-t border-gray-100 pt-6 text-xs text-gray-500">
          <span className="flex items-center gap-1.5">
            <span className="text-pink-500 [&>svg]:h-4 [&>svg]:w-4">
              <LockIcon />
            </span>
            {t('auth.secureRegistration')}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="text-purple-500 [&>svg]:h-4 [&>svg]:w-4">
              <ShieldIcon />
            </span>
            {t('auth.privacyProtected')}
          </span>
        </div>
      </div>
    </AuthShell>
  );
}
