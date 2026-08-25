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

/**
 * Bouton « Continuer avec Google ».
 *
 * On laisse Google dessiner son propre bouton : ses règles de marque imposent
 * un rendu officiel, et cela nous évite de reproduire logo et libellés traduits.
 * Sans `VITE_GOOGLE_CLIENT_ID`, le composant ne rend rien — la connexion par
 * mot de passe reste alors le seul chemin.
 */
export default function GoogleSignInButton() {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const { locale } = useI18n();
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
          width: 320,
          locale,
        });
      })
      .catch(() => !cancelled && setFailed(true));

    return () => {
      cancelled = true;
    };
  }, [clientId, locale, loginWithGoogle, navigate]);

  if (!clientId || failed) return null;

  return <div ref={container} className="flex justify-center" />;
}
