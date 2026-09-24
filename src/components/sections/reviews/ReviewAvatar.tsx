import type { ReviewAvatarKey } from "@/types/portal";

interface ReviewAvatarProps {
  avatarKey: ReviewAvatarKey;
  size?: number;
}

/**
 * 8 brand orb avatars. Pure SVG, no external assets. Echoes the
 * Aurexis Architect bot orb design for visual cohesion across the site.
 */
export function ReviewAvatar({ avatarKey, size = 44 }: ReviewAvatarProps) {
  const id = `orb-${avatarKey}-${size}`;
  const r = size / 2;

  switch (avatarKey) {
    case "cyan":
      return <Orb id={id} size={size} stops={["#A0FFFF", "#00F0FF", "#0080FF"]} accent="rgba(0,240,255,0.45)" />;
    case "violet":
      return <Orb id={id} size={size} stops={["#D8C8FF", "#A78BFA", "#5B3FBA"]} accent="rgba(167,139,250,0.45)" />;
    case "emerald":
      return <Orb id={id} size={size} stops={["#9FF3D0", "#10B981", "#047857"]} accent="rgba(16,185,129,0.45)" />;
    case "amber":
      return <Orb id={id} size={size} stops={["#FFE4A0", "#F59E0B", "#92400E"]} accent="rgba(245,158,11,0.45)" />;
    case "cyan-violet":
      return <SplitOrb id={id} size={size} leftStops={["#A0FFFF", "#00F0FF"]} rightStops={["#D8C8FF", "#A78BFA"]} />;
    case "amber-emerald":
      return <SplitOrb id={id} size={size} leftStops={["#FFE4A0", "#F59E0B"]} rightStops={["#9FF3D0", "#10B981"]} />;
    case "silver":
      return <Orb id={id} size={size} stops={["#FFFFFF", "#C0CAD6", "#48505C"]} accent="rgba(255,255,255,0.35)" />;
    case "constellation":
      return <ConstellationOrb id={id} size={size} r={r} />;
  }
}

function Orb({
  id,
  size,
  stops,
  accent,
}: {
  id: string;
  size: number;
  stops: [string, string, string];
  accent: string;
}) {
  const r = size / 2;
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      aria-hidden
      style={{ filter: `drop-shadow(0 0 ${size / 6}px ${accent})` }}
    >
      <defs>
        <radialGradient id={`${id}-base`} cx="50%" cy="55%" r="65%">
          <stop offset="0%" stopColor={stops[0]} />
          <stop offset="55%" stopColor={stops[1]} />
          <stop offset="100%" stopColor={stops[2]} />
        </radialGradient>
        <radialGradient id={`${id}-shine`} cx="40%" cy="30%" r="35%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.95)" />
          <stop offset="60%" stopColor="rgba(255,255,255,0)" />
        </radialGradient>
      </defs>
      <circle cx={r} cy={r} r={r - 1} fill={`url(#${id}-base)`} />
      <circle cx={r} cy={r} r={r - 1} fill={`url(#${id}-shine)`} />
      <circle
        cx={r}
        cy={r}
        r={r - 0.5}
        fill="none"
        stroke="rgba(255,255,255,0.18)"
        strokeWidth={0.5}
      />
    </svg>
  );
}

function SplitOrb({
  id,
  size,
  leftStops,
  rightStops,
}: {
  id: string;
  size: number;
  leftStops: [string, string];
  rightStops: [string, string];
}) {
  const r = size / 2;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
      <defs>
        <linearGradient id={`${id}-grad`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={leftStops[0]} />
          <stop offset="48%" stopColor={leftStops[1]} />
          <stop offset="52%" stopColor={rightStops[0]} />
          <stop offset="100%" stopColor={rightStops[1]} />
        </linearGradient>
        <radialGradient id={`${id}-shine`} cx="40%" cy="30%" r="35%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.85)" />
          <stop offset="60%" stopColor="rgba(255,255,255,0)" />
        </radialGradient>
      </defs>
      <circle cx={r} cy={r} r={r - 1} fill={`url(#${id}-grad)`} />
      <circle cx={r} cy={r} r={r - 1} fill={`url(#${id}-shine)`} />
      <circle
        cx={r}
        cy={r}
        r={r - 0.5}
        fill="none"
        stroke="rgba(255,255,255,0.18)"
        strokeWidth={0.5}
      />
    </svg>
  );
}

function ConstellationOrb({ id, size, r }: { id: string; size: number; r: number }) {
  // Dark navy base with 5 cyan stars in a small constellation pattern
  const stars = [
    { x: 0.28, y: 0.32 },
    { x: 0.58, y: 0.28 },
    { x: 0.72, y: 0.55 },
    { x: 0.46, y: 0.62 },
    { x: 0.34, y: 0.74 },
  ];
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      aria-hidden
      style={{ filter: "drop-shadow(0 0 8px rgba(0,240,255,0.30))" }}
    >
      <defs>
        <radialGradient id={`${id}-bg`} cx="50%" cy="55%" r="65%">
          <stop offset="0%" stopColor="#1B2A4A" />
          <stop offset="100%" stopColor="#02040A" />
        </radialGradient>
      </defs>
      <circle cx={r} cy={r} r={r - 1} fill={`url(#${id}-bg)`} />
      {stars.map((s, i) => (
        <circle
          key={i}
          cx={s.x * size}
          cy={s.y * size}
          r={Math.max(0.8, size * 0.025)}
          fill="#00F0FF"
        />
      ))}
      {/* faint connecting lines */}
      <path
        d={`M ${stars[0].x * size} ${stars[0].y * size} L ${stars[1].x * size} ${stars[1].y * size} L ${stars[2].x * size} ${stars[2].y * size} L ${stars[3].x * size} ${stars[3].y * size} L ${stars[4].x * size} ${stars[4].y * size}`}
        stroke="rgba(0,240,255,0.35)"
        strokeWidth={0.5}
        fill="none"
      />
      <circle
        cx={r}
        cy={r}
        r={r - 0.5}
        fill="none"
        stroke="rgba(255,255,255,0.18)"
        strokeWidth={0.5}
      />
    </svg>
  );
}
