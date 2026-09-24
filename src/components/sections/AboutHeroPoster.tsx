export function AboutHeroPoster() {
  return (
    <svg
      aria-hidden="true"
      className="absolute inset-0 h-full w-full"
      preserveAspectRatio="xMidYMid slice"
      viewBox="0 0 1600 900"
    >
      <defs>
        <radialGradient id="about-poster-core" cx="50%" cy="52%" r="65%">
          <stop offset="0%" stopColor="var(--color-electric-cyan)" stopOpacity="0.14" />
          <stop offset="38%" stopColor="var(--color-cyber-blue)" stopOpacity="0.08" />
          <stop offset="100%" stopColor="var(--color-deep-void)" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="about-poster-violet" cx="18%" cy="22%" r="48%">
          <stop offset="0%" stopColor="var(--color-nebula-violet)" stopOpacity="0.10" />
          <stop offset="100%" stopColor="var(--color-nebula-violet)" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="about-poster-blue" cx="82%" cy="80%" r="55%">
          <stop offset="0%" stopColor="var(--color-cyber-blue)" stopOpacity="0.14" />
          <stop offset="100%" stopColor="var(--color-cyber-blue)" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="1600" height="900" fill="var(--color-deep-void)" />
      <rect width="1600" height="900" fill="url(#about-poster-core)" />
      <rect width="1600" height="900" fill="url(#about-poster-violet)" />
      <rect width="1600" height="900" fill="url(#about-poster-blue)" />
    </svg>
  );
}
