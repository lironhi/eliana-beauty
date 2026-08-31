interface AuthSubmitButtonProps {
  loading: boolean;
  label: string;
  loadingLabel: string;
}

/** Bouton principal des formulaires d'authentification. */
export default function AuthSubmitButton({ loading, label, loadingLabel }: AuthSubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="animate-gradient group relative mt-2 w-full overflow-hidden rounded-full bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-600 py-4 font-semibold text-white shadow-lg shadow-purple-500/30 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-purple-500/40 active:translate-y-0 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none"
    >
      {/* Reflet qui balaie le bouton au survol. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 -start-1/3 w-1/3 bg-white/30 opacity-0 blur-md group-hover:animate-sheen group-hover:opacity-100"
      />
      <span className="relative flex items-center justify-center gap-2.5">
        {loading ? (
          <>
            <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            {loadingLabel}
          </>
        ) : (
          label
        )}
      </span>
    </button>
  );
}
