// src/components/sections/solutions/SolutionGlow.tsx
export const SOLUTION_NOISE =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.6 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

export function GlowDivider({ position, rgb }: { position: 'top' | 'bottom'; rgb: string }) {
  const accent = (a: number) => `rgba(${rgb},${a})`;
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-x-0 ${position === 'top' ? 'top-0' : 'bottom-0'}`}
    >
      <div
        className="h-px w-full"
        style={{
          background: `linear-gradient(90deg, transparent, ${accent(0.7)} 50%, transparent)`,
        }}
      />
      <div
        className={`absolute inset-x-[20%] h-8 blur-2xl ${position === 'top' ? 'top-0' : 'bottom-0'}`}
        style={{ background: accent(0.18) }}
      />
    </div>
  );
}
