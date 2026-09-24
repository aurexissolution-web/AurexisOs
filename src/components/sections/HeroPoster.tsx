export function HeroPoster() {
  return (
    <svg
      aria-hidden="true"
      className="absolute inset-0 h-full w-full"
      preserveAspectRatio="xMidYMid slice"
      viewBox="0 0 1600 900"
    >
      <defs>
        <radialGradient id="hero-poster-core" cx="50%" cy="55%" r="65%">
          <stop offset="0%" stopColor="var(--color-electric-cyan)" stopOpacity="0.16" />
          <stop offset="35%" stopColor="var(--color-cyber-blue)" stopOpacity="0.10" />
          <stop offset="100%" stopColor="var(--color-deep-void)" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="hero-poster-cyan" cx="22%" cy="28%" r="45%">
          <stop offset="0%" stopColor="var(--color-electric-cyan)" stopOpacity="0.18" />
          <stop offset="100%" stopColor="var(--color-electric-cyan)" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="hero-poster-blue" cx="78%" cy="78%" r="55%">
          <stop offset="0%" stopColor="var(--color-cyber-blue)" stopOpacity="0.20" />
          <stop offset="100%" stopColor="var(--color-cyber-blue)" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="1600" height="900" fill="var(--color-background)" />
      <rect width="1600" height="900" fill="url(#hero-poster-core)" />
      <rect width="1600" height="900" fill="url(#hero-poster-cyan)" />
      <rect width="1600" height="900" fill="url(#hero-poster-blue)" />
    </svg>
  );
}
