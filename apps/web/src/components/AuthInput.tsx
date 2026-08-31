import { useState, type InputHTMLAttributes, type ReactNode } from 'react';
import { useI18n } from '@/i18n';

const FIELD_CLASS =
  'w-full rounded-2xl border border-gray-200 bg-white py-3.5 text-gray-900 shadow-sm outline-none transition duration-200 placeholder:text-gray-400 hover:border-pink-200 focus:border-pink-400 focus:ring-4 focus:ring-pink-100';

interface AuthInputProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  icon: ReactNode;
  /** Ajoute l'œil qui bascule entre texte clair et masqué. */
  passwordToggle?: boolean;
}

/**
 * Champ des formulaires de connexion et d'inscription.
 *
 * Les icônes sont posées en `start`/`end` plutôt qu'en `left`/`right` : elles
 * suivent ainsi le sens de lecture et passent à droite en hébreu.
 */
export default function AuthInput({
  id,
  label,
  icon,
  passwordToggle = false,
  ...props
}: AuthInputProps) {
  const { t } = useI18n();
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="relative">
        <span className="pointer-events-none absolute inset-y-0 start-4 flex items-center text-gray-400">
          {icon}
        </span>

        <input
          {...props}
          id={id}
          type={passwordToggle ? (visible ? 'text' : 'password') : props.type}
          className={`${FIELD_CLASS} ps-12 ${passwordToggle ? 'pe-12' : 'pe-4'}`}
        />

        {passwordToggle && (
          <button
            type="button"
            onClick={() => setVisible(!visible)}
            aria-label={visible ? t('auth.hidePassword') : t('auth.showPassword')}
            className="absolute inset-y-0 end-2 flex items-center rounded-lg px-2 text-gray-400 transition-colors hover:text-pink-500 focus-visible:text-pink-500 focus-visible:outline-none"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {visible ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                />
              ) : (
                <>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </>
              )}
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

/* ---------------- Icônes des champs ---------------- */

function Icon({ d }: { d: string }) {
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={d} />
    </svg>
  );
}

export const UserIcon = () => (
  <Icon d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
);

export const MailIcon = () => (
  <Icon d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
);

export const PhoneIcon = () => (
  <Icon d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
);

export const LockIcon = () => (
  <Icon d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
);

export const ShieldIcon = () => (
  <Icon d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
);
