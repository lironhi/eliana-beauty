import { useEffect, useState } from 'react';

/**
 * Suit une media query en JavaScript.
 *
 * Utile quand `hidden lg:block` ne suffit pas : un élément masqué en CSS est
 * quand même téléchargé par le navigateur. Pour éviter de servir une vidéo de
 * 3 Mo aux téléphones, il faut ne pas la monter du tout.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() =>
    typeof window === 'undefined' ? false : window.matchMedia(query).matches,
  );

  useEffect(() => {
    const media = window.matchMedia(query);
    const onChange = (e: MediaQueryListEvent) => setMatches(e.matches);
    setMatches(media.matches);
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}

/** `true` si la personne a demandé à réduire les animations dans son système. */
export function usePrefersReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}
