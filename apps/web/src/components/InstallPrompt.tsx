import { useState } from 'react';
import { useI18n } from '@/i18n';
import { usePlatform } from '@/hooks/usePlatform';

const DISMISSED_KEY = 'eliana-install-dismissed';

/**
 * Invite à installer la PWA, uniquement quand c'est pertinent : sur mobile,
 * hors application déjà installée, et si l'utilisateur n'a pas déjà refusé.
 *
 * Android expose `beforeinstallprompt` et permet d'ouvrir la boîte de dialogue
 * native. iOS n'a aucune API équivalente : on ne peut qu'indiquer le geste.
 */
export default function InstallPrompt() {
  const { t } = useI18n();
  const { isStandalone, isMobile, canPrompt, needsManualInstall, promptInstall } = usePlatform();
  const [dismissed, setDismissed] = useState(() => {
    try {
      return localStorage.getItem(DISMISSED_KEY) === '1';
    } catch {
      return false;
    }
  });

  const hide = () => {
    setDismissed(true);
    try {
      localStorage.setItem(DISMISSED_KEY, '1');
    } catch {
      // navigation privée : on masque pour la session, sans persister
    }
  };

  if (isStandalone || dismissed || !isMobile) return null;
  if (!canPrompt && !needsManualInstall) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 sm:left-auto sm:right-6 sm:w-96">
      <div className="rounded-2xl border-2 border-pink-100 bg-white/95 p-4 shadow-2xl backdrop-blur-xl">
        <div className="absolute inset-x-0 top-0 h-1 rounded-t-2xl bg-gradient-to-r from-pink-400 via-purple-400 to-pink-400" />
        <div className="flex items-start gap-3">
          <img src="/icon-192.png" alt="" className="h-12 w-12 shrink-0 rounded-xl shadow-md" />
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-gray-900">{t('install.title')}</p>
            <p className="mt-0.5 text-sm text-gray-600">
              {needsManualInstall ? t('install.iosHint') : t('install.subtitle')}
            </p>
            <div className="mt-3 flex gap-2">
              {canPrompt && (
                <button
                  onClick={async () => {
                    const outcome = await promptInstall();
                    if (outcome !== 'unavailable') hide();
                  }}
                  className="rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 px-4 py-2 text-sm font-semibold text-white shadow-md transition-transform hover:scale-105"
                >
                  {t('install.button')}
                </button>
              )}
              <button
                onClick={hide}
                className="rounded-xl px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
              >
                {t('install.later')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
