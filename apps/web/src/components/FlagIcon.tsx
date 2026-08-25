interface FlagIconProps {
  code: 'en' | 'he';
  className?: string;
}

/**
 * Country flags as inline SVG rather than emoji.
 *
 * Windows ships no glyphs for the regional-indicator pairs that make up flag
 * emoji, so 🇺🇸 and 🇮🇱 render as the bare letters "US" and "IL" there. Drawing
 * the flags ourselves keeps them identical on every platform.
 */
export default function FlagIcon({ code, className = 'w-full h-full' }: FlagIconProps) {
  if (code === 'he') {
    return (
      <svg viewBox="0 0 640 480" className={className} role="img" aria-label="דגל ישראל">
        <rect width="640" height="480" fill="#fff" />
        <rect y="55" width="640" height="55" fill="#0038b8" />
        <rect y="370" width="640" height="55" fill="#0038b8" />
        <path
          d="M320 155l52 90h-104zM320 325l-52-90h104z"
          fill="none"
          stroke="#0038b8"
          strokeWidth="16"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 640 480" className={className} role="img" aria-label="United States flag">
      <rect width="640" height="480" fill="#fff" />
      {[0, 2, 4, 6, 8, 10, 12].map((i) => (
        <rect key={i} y={(i * 480) / 13} width="640" height={480 / 13} fill="#b22234" />
      ))}
      <rect width="364" height={(480 / 13) * 7} fill="#3c3b6e" />
      {Array.from({ length: 9 }, (_, row) =>
        Array.from({ length: row % 2 === 0 ? 6 : 5 }, (_, col) => (
          <circle
            key={`${row}-${col}`}
            cx={30 + col * 60 + (row % 2 === 0 ? 0 : 30)}
            cy={22 + row * 27}
            r="9"
            fill="#fff"
          />
        )),
      )}
    </svg>
  );
}
