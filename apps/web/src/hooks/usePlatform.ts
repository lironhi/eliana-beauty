import { useEffect, useState } from 'react';

export type Platform = 'ios' | 'android' | 'desktop';

/** Événement Chromium non encore standardisé, absent des types du DOM. */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export interface PlatformInfo {
  /** L'application tourne installée (écran d'accueil), pas dans un onglet. */
  isStandalone: boolean;
  platform: Platform;
  isMobile: boolean;
  /** Android/Chrome a proposé l'installation : on peut l'ouvrir nous-mêmes. */
  canPrompt: boolean;
  /** iOS n'a pas d'API d'installation : il faut guider l'utilisateur à la main. */
  needsManualInstall: boolean;
  promptInstall: () => Promise<'accepted' | 'dismissed' | 'unavailable'>;
}

function detectPlatform(): Platform {
  const ua = navigator.userAgent;

  if (/android/i.test(ua)) return 'android';
  if (/iphone|ipod/i.test(ua)) return 'ios';

  // Depuis iPadOS 13 un iPad s'annonce comme un Mac ; seul l'écran tactile
  // permet encore de les distinguer.
  if (/ipad/i.test(ua) || (/macintosh/i.test(ua) && navigator.maxTouchPoints > 1)) {
    return 'ios';
  }

  return 'desktop';
}

function detectStandalone(): boolean {
  // Android et navigateurs de bureau
  if (window.matchMedia('(display-mode: standalone)').matches) return true;
  // Safari iOS, qui n'implémente pas display-mode
  if ((navigator as Navigator & { standalone?: boolean }).standalone) return true;
  // Lancement depuis une TWA Android
  return document.referrer.startsWith('android-app://');
}

/**
 * Renseigne sur le contexte d'exécution : application installée ou simple
 * onglet, et sur quel type d'appareil. Sert notamment à ne proposer
 * l'installation qu'à ceux qui ne l'ont pas encore faite.
 */
export function usePlatform(): PlatformInfo {
  const [isStandalone, setIsStandalone] = useState(detectStandalone);
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const platform = detectPlatform();

  useEffect(() => {
    const media = window.matchMedia('(display-mode: standalone)');
    const onDisplayModeChange = () => setIsStandalone(detectStandalone());
    media.addEventListener('change', onDisplayModeChange);

    const onBeforeInstallPrompt = (e: Event) => {
      // Sans preventDefault, Chrome affiche sa propre bannière et l'événement
      // n'est plus réutilisable ensuite.
      e.preventDefault();
      setInstallEvent(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);

    const onInstalled = () => {
      setInstallEvent(null);
      setIsStandalone(true);
    };
    window.addEventListener('appinstalled', onInstalled);

    return () => {
      media.removeEventListener('change', onDisplayModeChange);
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const promptInstall = async () => {
    if (!installEvent) return 'unavailable' as const;
    await installEvent.prompt();
    const { outcome } = await installEvent.userChoice;
    // L'événement ne peut servir qu'une fois.
    setInstallEvent(null);
    return outcome;
  };

  return {
    isStandalone,
    platform,
    isMobile: platform !== 'desktop',
    canPrompt: installEvent !== null,
    needsManualInstall: platform === 'ios' && !isStandalone,
    promptInstall,
  };
}
