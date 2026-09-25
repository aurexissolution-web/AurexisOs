// src/components/admin/DarkGradientBg.tsx
// Dark corner-lit gradient with skewed cyan streaks, fine grain and a dot grid.
// Pure CSS layers — no video, no network requests.
import { SOLUTION_NOISE } from '@/components/sections/solutions/SolutionGlow';

const STREAK = 'linear-gradient(rgb(94,227,218) 0%, rgba(94,227,218,0) 100%)';

// Each mask carves a different set of vertical bands; skewed 45° they read as light rays.
const STREAK_MASKS = [
  'linear-gradient(90deg, rgba(0,0,0,0) 0%, #000 20%, rgba(0,0,0,0) 36%, #000 55%, rgba(0,0,0,0.13) 67%, #000 78%, rgba(0,0,0,0) 97%)',
  'linear-gradient(90deg, rgba(0,0,0,0) 11%, #000 25%, rgba(0,0,0,0.55) 41%, rgba(0,0,0,0.13) 67%, #000 78%, rgba(0,0,0,0) 97%)',
  'linear-gradient(90deg, rgba(0,0,0,0) 9%, #000 20%, rgba(0,0,0,0.55) 28%, rgba(0,0,0,0.424) 40%, #000 48%, rgba(0,0,0,0.267) 54%, rgba(0,0,0,0.13) 78%, #000 88%, rgba(0,0,0,0) 97%)',
  'linear-gradient(90deg, rgba(0,0,0,0) 0%, #000 17%, rgba(0,0,0,0.55) 26%, #000 35%, rgba(0,0,0,0) 47%, rgba(0,0,0,0.13) 69%, #000 79%, rgba(0,0,0,0) 97%)',
  'linear-gradient(90deg, rgba(0,0,0,0) 0%, #000 20%, rgba(0,0,0,0.55) 27%, #000 42%, rgba(0,0,0,0) 48%, rgba(0,0,0,0.13) 67%, #000 74%, #000 82%, rgba(0,0,0,0.47) 88%, rgba(0,0,0,0) 97%)',
];

export function DarkGradientBg() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden bg-black">
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(100% 100% at 0% 0%, rgb(46,46,46) 0%, rgb(0,0,0) 100%)',
          mask: 'radial-gradient(125% 100% at 0% 0%, #000 0%, rgba(0,0,0,0.224) 88.3%, rgba(0,0,0,0) 100%)',
          WebkitMask:
            'radial-gradient(125% 100% at 0% 0%, #000 0%, rgba(0,0,0,0.224) 88.3%, rgba(0,0,0,0) 100%)',
        }}
      >
        {STREAK_MASKS.map((m) => (
          <div
            key={m}
            className="absolute inset-0 opacity-20"
            style={{ background: STREAK, mask: m, WebkitMask: m, transform: 'skewX(45deg)' }}
          />
        ))}
      </div>
      <div
        className="absolute inset-0 opacity-[0.06] mix-blend-overlay"
        style={{ backgroundImage: SOLUTION_NOISE }}
      />
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.5) 1px, transparent 0)',
          backgroundSize: '20px 20px',
        }}
      />
    </div>
  );
}
