/**
 * Bandeau d'erreur des formulaires d'authentification.
 *
 * `role="alert"` pour que le message soit annoncé aux lecteurs d'écran : il
 * apparaît après coup, donc rien ne le signalerait autrement.
 */
export default function AuthError({ message }: { message: string }) {
  if (!message) return null;

  return (
    <div
      role="alert"
      className="animate-fade-in mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-700"
    >
      <svg className="mt-0.5 h-5 w-5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
          clipRule="evenodd"
        />
      </svg>
      <span className="text-sm">{message}</span>
    </div>
  );
}
