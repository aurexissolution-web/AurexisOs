import type { CSSProperties } from "react";

export const CYAN = "#00F0FF";

/** The house glass recipe, previously inlined twice inside Navbar.tsx. */
export function glassSurface(options: { heavy?: boolean } = {}): CSSProperties {
  const { heavy = false } = options;
  const blur = heavy ? 32 : 28;
  return {
    background: `linear-gradient(180deg, rgba(255,255,255,${
      heavy ? 0.05 : 0.04
    }) 0%, rgba(255,255,255,0) 60%), rgba(12, 14, 22, ${heavy ? 0.55 : 0.42})`,
    border: "1px solid rgba(255,255,255,0.12)",
    backdropFilter: `blur(${blur}px) saturate(180%)`,
    WebkitBackdropFilter: `blur(${blur}px) saturate(180%)`,
    boxShadow: heavy
      ? "inset 0 1px 0 rgba(255,255,255,0.12), inset 0 -1px 0 rgba(0,0,0,0.25), 0 1px 0 rgba(255,255,255,0.04), 0 16px 48px rgba(0,0,0,0.50)"
      : "inset 0 1px 0 rgba(255,255,255,0.10), inset 0 -1px 0 rgba(0,0,0,0.20), 0 1px 0 rgba(255,255,255,0.04), 0 12px 36px rgba(0,0,0,0.45)",
  };
}
