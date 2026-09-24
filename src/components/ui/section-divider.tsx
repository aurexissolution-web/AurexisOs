// Shared section-boundary hairline — cyan-tinted, brighter at center, fading
// at the edges. Used at the top of every homepage section (except the hero).
// The parent section must be `relative` (or otherwise positioned) for this
// absolutely-positioned line to anchor correctly.
export function SectionDivider() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 top-0 h-px"
      style={{
        background: "linear-gradient(to right, transparent 6%, rgba(0,240,255,0.55) 50%, transparent 94%)",
      }}
    />
  );
}
