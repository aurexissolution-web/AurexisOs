"use client";

interface StarRatingProps {
  value: number;
  onChange?: (rating: number) => void;
  size?: number;
  /** Display only (no hover/click) */
  readOnly?: boolean;
}

export function StarRating({ value, onChange, size = 22, readOnly = false }: StarRatingProps) {
  const stars = [1, 2, 3, 4, 5];

  return (
    <div className="inline-flex items-center gap-1">
      {stars.map((n) => {
        const filled = n <= value;
        const interactive = !readOnly && onChange;
        return (
          <button
            key={n}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onChange(n)}
            aria-label={`${n} star${n === 1 ? "" : "s"}`}
            className={
              interactive
                ? "transition-transform hover:scale-110 cursor-pointer"
                : "cursor-default"
            }
            style={{
              padding: 0,
              background: "transparent",
              border: "none",
              lineHeight: 0,
              color: filled ? "#FBBF24" : "rgba(255,255,255,0.18)",
              filter: filled ? "drop-shadow(0 0 6px rgba(251,191,36,0.45))" : "none",
            }}
          >
            <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M12 2.25l2.92 6.51 7.08.65-5.36 4.72 1.6 6.98L12 17.77l-6.24 3.34 1.6-6.98L2 9.41l7.08-.65L12 2.25z" />
            </svg>
          </button>
        );
      })}
    </div>
  );
}
