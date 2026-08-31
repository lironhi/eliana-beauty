import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useI18n } from '@/i18n';
import { useAuthStore } from '@/store/authStore';

const GSI_SRC = 'https://accounts.google.com/gsi/client';

interface GoogleAccountsId {
  initialize: (config: {
    client_id: string;
    callback: (response: { credential: string }) => void;
  }) => void;
  renderButton: (parent: HTMLElement, options: Record<string, unknown>) => void;
}

declare global {
  interface Window {
    google?: { accounts: { id: GoogleAccountsId } };
  }
}

/** Charge le script Google Identity Services une seule fois pour toute la page. */
function loadGsi(): Promise<void> {
  const existing = document.querySelector<HTMLScriptElement>(`script[src="${GSI_SRC}"]`);
  if (existing) {
    return existing.dataset.loaded === '1'
      ? Promise.resolve()
      : new Promise((resolve, reject) => {
          existing.addEventListener('load', () => resolve());
          existing.addEventListener('error', () => reject(new Error('GSI load failed')));
        });
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = GSI_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      script.dataset.loaded = '1';
      resolve();
    };
    script.onerror = () => reject(new Error('GSI load failed'));
    document.head.appendChild(script);
  });
}

/** Le « G » officiel, en quatre couleurs. */
function GoogleLogo() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.65l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0012 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.11a6.6 6.6 0 010-4.22V7.05H2.18a11 11 0 000 9.9l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1a11 11 0 00-9.82 6.05l3.66 2.84c.87-2.6 3.3-4.51 6.16-4.51z"
      />
    </svg>
  );
}

/**
 * Bouton « Continuer avec Google ».
 *
 * Quand `VITE_GOOGLE_CLIENT_ID` est défini, on laisse Google dessiner son
 * propre bouton : ses règles de marque imposent un rendu officiel. Sinon on
 * affiche un bouton désactivé de la même taille — la page garde sa mise en
 * page, et on voit tout de suite qu'il reste une variable à renseigner plutôt
 * que de croire le bouton oublié.
 */
export default function GoogleSignInButton() {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const { t, locale } = useI18n();
  const loginWithGoogle = useAuthStore((s) => s.loginWithGoogle);
  const navigate = useNavigate();
  const container = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!clientId || !container.current) return;
    let cancelled = false;

    loadGsi()
      .then(() => {
        if (cancelled || !container.current || !window.google) return;
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: async ({ credential }) => {
            try {
              await loginWithGoogle(credential);
              navigate('/');
            } catch (err) {
              toast.error(err instanceof Error ? err.message : 'Google sign-in failed');
            }
          },
        });
        window.google.accounts.id.renderButton(container.current, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          shape: 'pill',
          text: 'continue_with',
          logo_alignment: 'center',
          width: 400,
          locale,
        });
      })
      .catch(() => !cancelled && setFailed(true));

    return () => {
      cancelled = true;
    };
  }, [clientId, locale, loginWithGoogle, navigate]);

  if (!clientId || failed) {
    return (
      <div className="space-y-2">
        <button
          type="button"
          disabled
          className="flex w-full cursor-not-allowed items-center justify-center gap-3 rounded-full border border-gray-200 bg-white/70 py-3.5 font-medium text-gray-500 shadow-sm"
        >
          <GoogleLogo />
          <span>{t('auth.continueWithGoogle')}</span>
        </button>
        <p className="text-center text-xs text-gray-400">{t('auth.googleUnavailable')}</p>
      </div>
    );
  }

  return <div ref={container} className="flex justify-center [&>div]:!w-full" />;
}
