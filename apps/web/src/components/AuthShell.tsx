import { useEffect, useState, type ReactNode } from 'react';
import { useI18n } from '@/i18n';
import { useMediaQuery, usePrefersReducedMotion } from '@/hooks/useMediaQuery';

/**
 * Photos du panneau vitrine.
 *
 * Tout fichier déposé dans `src/assets/login/` est ramassé ici au build : pas
 * de liste à tenir à jour, et Vite se charge de l'empreinte dans le nom (donc
 * pas de photo périmée en cache chez les clientes). Voir le README du dossier.
 */
const SLIDES = Object.values(
  import.meta.glob<string>('../assets/login/*.{jpg,jpeg,png,webp,avif}', {
    eager: true,
    import: 'default',
  }),
);

const SLIDE_DURATION_MS = 6000;

/** Positions figées : un Math.random() rejouerait à chaque rendu. */
const SPARKLES = [
  { top: '12%', left: '18%', size: 4, delay: '0s' },
  { top: '26%', left: '78%', size: 3, delay: '1.2s' },
  { top: '61%', left: '9%', size: 5, delay: '2.4s' },
  { top: '74%', left: '66%', size: 3, delay: '0.6s' },
  { top: '40%', left: '46%', size: 4, delay: '3.1s' },
  { top: '88%', left: '30%', size: 3, delay: '1.8s' },
];

function Check() {
  return (
    <svg
      className="h-4 w-4 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

/**
 * Décor commun aux pages de connexion et d'inscription : aurore animée en
 * fond, carte flottante, et panneau vitrine à partir de `lg`.
 *
 * Les deux pages passent par ici pour ne pas diverger à la première retouche —
 * seul le contenu du formulaire change.
 */
export default function AuthShell({ children }: { children: ReactNode }) {
  const { t } = useI18n();

  // La vidéo de repli pèse 3 Mo : on ne la monte que sur les écrans qui
  // l'affichent, et jamais si la personne a demandé à réduire les animations.
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const reducedMotion = usePrefersReducedMotion();
  const showVideo = SLIDES.length === 0 && isDesktop && !reducedMotion;

  const [slide, setSlide] = useState(0);

  useEffect(() => {
    if (SLIDES.length < 2 || !isDesktop || reducedMotion) return;
    const id = setInterval(
      () => setSlide((current) => (current + 1) % SLIDES.length),
      SLIDE_DURATION_MS,
    );
    return () => clearInterval(id);
  }, [isDesktop, reducedMotion]);

  return (
    <div className="relative min-h-screen bg-[#190a2c]">
      {/* ---------------- Aurore animée ----------------
          `fixed` plutôt qu'`absolute` : sur la page d'inscription, plus haute
          qu'un écran, le décor reste ainsi cadré pendant le défilement. */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div className="animate-aurora absolute -start-1/4 -top-1/4 h-[75vmax] w-[75vmax] rounded-full bg-[radial-gradient(circle,rgba(236,72,153,0.55),transparent_65%)] blur-3xl" />
        <div className="animate-aurora absolute -end-1/4 top-1/3 h-[70vmax] w-[70vmax] rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.5),transparent_65%)] blur-3xl [animation-delay:-8s]" />
        <div className="animate-aurora absolute -bottom-1/3 start-1/4 h-[60vmax] w-[60vmax] rounded-full bg-[radial-gradient(circle,rgba(251,146,180,0.4),transparent_65%)] blur-3xl [animation-delay:-16s]" />

        {SPARKLES.map((s) => (
          <span
            key={`${s.top}-${s.left}`}
            className="animate-twinkle absolute rounded-full bg-white"
            style={{
              top: s.top,
              left: s.left,
              width: s.size,
              height: s.size,
              animationDelay: s.delay,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center p-4 sm:p-6 lg:p-10">
        <div className="animate-scale-in grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/20 shadow-[0_35px_120px_-25px_rgba(0,0,0,0.75)] lg:grid-cols-2">
          {/* ---------------- Panneau vitrine, à partir de lg ---------------- */}
          <aside className="relative hidden min-h-[660px] overflow-hidden bg-gradient-to-br from-pink-600 via-purple-700 to-[#2a0f45] lg:block">
            {SLIDES.map((src, i) => (
              <img
                key={src}
                src={src}
                alt=""
                aria-hidden="true"
                decoding="async"
                loading={i === 0 ? 'eager' : 'lazy'}
                className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
                  i === slide ? 'animate-ken-burns opacity-100' : 'opacity-0'
                }`}
              />
            ))}

            {showVideo && (
              <video
                className="absolute inset-0 h-full w-full object-cover opacity-45"
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                aria-hidden="true"
              >
                <source src="/videos/studio1.mp4" type="video/mp4" />
              </video>
            )}

            {/* Voile sombre : sans lui, le texte blanc devient illisible dès
                qu'une photo passe sur une zone claire. */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#1a0929]/95 via-purple-950/60 to-pink-700/25" />

            <div className="relative flex h-full flex-col justify-between p-12 xl:p-14">
              <img
                src="/logo.svg"
                alt="Eliana Beauty"
                className="animate-float h-14 w-14 drop-shadow-[0_4px_20px_rgba(255,255,255,0.35)]"
              />

              <div className="max-w-md">
                <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.18em] text-pink-100 backdrop-blur-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-pink-300" />
                  Beauty Studio
                </p>

                <h2 className="text-5xl leading-[1.05] text-white drop-shadow-md xl:text-6xl">
                  Eliana <span className="text-pink-200">Beauty</span>
                </h2>

                <p className="mt-5 text-lg leading-relaxed text-pink-50/85">
                  {t('auth.heroTagline')}
                </p>

                <ul className="mt-9 space-y-3.5">
                  {[t('auth.heroPoint1'), t('auth.heroPoint2'), t('auth.heroPoint3')].map(
                    (point) => (
                      <li key={point} className="flex items-center gap-3 text-pink-50/85">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full border border-white/25 bg-white/10 text-pink-200 backdrop-blur-sm">
                          <Check />
                        </span>
                        <span className="text-[15px]">{point}</span>
                      </li>
                    ),
                  )}
                </ul>
              </div>

              <div className="flex items-end justify-between">
                <div className="flex items-center gap-2.5 text-sm text-pink-100/75">
                  <span className="text-lg leading-none text-pink-200">★★★★★</span>
                  <span>5.0 · 2000+</span>
                </div>

                {SLIDES.length > 1 && (
                  <div className="flex gap-2">
                    {SLIDES.map((src, i) => (
                      <button
                        key={src}
                        type="button"
                        onClick={() => setSlide(i)}
                        aria-label={`${i + 1} / ${SLIDES.length}`}
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          i === slide ? 'w-7 bg-white' : 'w-1.5 bg-white/45 hover:bg-white/70'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </aside>

          {/* ---------------- Panneau formulaire ---------------- */}
          <main className="relative bg-gradient-to-b from-white via-white to-pink-50/70 px-6 py-10 sm:px-10 lg:px-12 lg:py-14">
            <div className="mx-auto w-full max-w-sm">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
