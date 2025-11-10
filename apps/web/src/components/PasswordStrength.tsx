import { useI18n } from '@/i18n';

interface PasswordStrengthProps {
  password: string;
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const { t } = useI18n();

  const calculateStrength = (pwd: string): { score: number; label: string; color: string } => {
    if (!pwd) return { score: 0, label: '', color: 'bg-gray-200' };

    let score = 0;

    // Length check
    if (pwd.length >= 8) score += 1;
    if (pwd.length >= 12) score += 1;

    // Character type checks
    if (/[a-z]/.test(pwd)) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/\d/.test(pwd)) score += 1;
    if (/[@$!%*?&]/.test(pwd)) score += 1;

    // Consecutive checks (bonus)
    if (pwd.length >= 10 && score >= 4) score += 1;

    // Map score to strength
    if (score <= 2) return { score: 1, label: t('auth.passwordStrength.weak'), color: 'bg-red-500' };
    if (score <= 4) return { score: 2, label: t('auth.passwordStrength.medium'), color: 'bg-yellow-500' };
    if (score <= 5) return { score: 3, label: t('auth.passwordStrength.good'), color: 'bg-blue-500' };
    return { score: 4, label: t('auth.passwordStrength.excellent'), color: 'bg-green-500' };
  };

  const { score, label, color } = calculateStrength(password);

  if (!password) return null;

  return (
    <div className="mt-2">
      <div className="flex items-center gap-2 mb-1">
        <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden flex gap-0.5">
          {[1, 2, 3, 4].map((level) => (
            <div
              key={level}
              className={`flex-1 transition-all duration-300 ${
                level <= score ? color : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
        {label && (
          <span className={`text-xs font-medium ${
            color === 'bg-red-500' ? 'text-red-600' :
            color === 'bg-yellow-500' ? 'text-yellow-600' :
            color === 'bg-blue-500' ? 'text-blue-600' :
            'text-green-600'
          }`}>
            {label}
          </span>
        )}
      </div>

      <div className="text-xs text-gray-600 space-y-0.5">
        <div className="flex items-center gap-1.5">
          <span className={password.length >= 6 && password.length <= 24 ? 'text-green-600' : 'text-gray-400'}>
            {password.length >= 6 && password.length <= 24 ? '✓' : '○'}
          </span>
          <span>{t('auth.passwordStrength.minLength')}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={password.length <= 24 ? 'text-green-600' : 'text-red-600'}>
            {password.length <= 24 ? '✓' : '✗'}
          </span>
          <span className={password.length > 24 ? 'text-red-600 font-medium' : ''}>
            {t('auth.passwordStrength.maxLength')}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={/[A-Z]/.test(password) ? 'text-green-600' : 'text-gray-400'}>
            {/[A-Z]/.test(password) ? '✓' : '○'}
          </span>
          <span>{t('auth.passwordStrength.uppercase')}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={/[a-z]/.test(password) ? 'text-green-600' : 'text-gray-400'}>
            {/[a-z]/.test(password) ? '✓' : '○'}
          </span>
          <span>{t('auth.passwordStrength.lowercase')}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={/\d/.test(password) ? 'text-green-600' : 'text-gray-400'}>
            {/\d/.test(password) ? '✓' : '○'}
          </span>
          <span>{t('auth.passwordStrength.number')}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={/[@$!%*?&]/.test(password) ? 'text-green-600' : 'text-gray-400'}>
            {/[@$!%*?&]/.test(password) ? '✓' : '○'}
          </span>
          <span>{t('auth.passwordStrength.special')}</span>
        </div>
      </div>
    </div>
  );
}
