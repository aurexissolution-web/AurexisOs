# The Stack — Editorial Reveal cards

**Date:** 2026-04-30
**Status:** Approved by user (Option C)
**Scope:** [src/components/sections/TheStack.tsx](../../../src/components/sections/TheStack.tsx)
**Surfaces:** [/about](../../../src/app/about/page.tsx) → `<TheStack />`

## Problem

The current cards on `TheStack` are tall (`aspect-[5/6]`), which forces a 2-row grid that overflows the viewport on a 900px-tall desktop. The user has approved the section's structure and copy but wants:

1. Cards re-shaped so the whole section fits in one viewport on desktop.
2. A new card design — neither the current minimal-static look nor a generic AI-card. Editorial, on-brand, with a hover-driven reveal.
3. The `SignatureCard`'s centred `◆` glyph replaced with the Aurexis "AR" logo mark.

## Goals

- Cards become compact landscape (`aspect-[4/3]` at xl, `aspect-[5/4]` at md, auto on mobile) and a horizontal internal layout (icon-chip left, content right).
- Idle state stays quiet and editorial; hover triggers a coordinated reveal — scan beam, corner registration marks, border glow.
- `SignatureCard`'s centre mark is the Aurexis AR insignia, recolourable via `currentColor`, with the same hover treatment as the tool cards.
- The whole section (eyebrow + heading + paragraph + 8-card grid) fits in a 1440 × 900 viewport without scroll.

## Non-goals

- No copy changes (eyebrow, heading, paragraph, tool list, descriptions stay).
- No changes to the tools array or icon set.
- No changes to the surrounding About page sections.
- No motion-heavy idle animation (rejected Option A "Border Beam" and Option B "Aurora Mesh" in brainstorming).

## Design

### Layout

- Grid columns unchanged: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`. 8 cards → 4×2 at xl.
- Card aspect: `aspect-[5/4] md:aspect-[4/3]` — landscape, gives ~210–280px card height in the xl viewport.
- Internal layout: horizontal flex row.
  - **Left column** (`shrink-0`, ~64–72px wide): icon chip stacked above the `N°` label.
  - **Right column** (`flex-1`): role label (top-right), then name (serif italic, ~22–24px), then description (mono, two-line max).
- Padding tightened to `p-5 md:p-6` (was `p-6 md:p-7`).
- Section vertical padding tightened to `py-16 md:py-20 lg:py-14` so 1440×900 fits without scroll.

### Card surface — frosted glass

Switch the card body from the current opaque dark surface to a frosted-glass treatment:

- Background: `bg-white/[0.04]` over the section's dark background.
- `backdrop-blur-xl backdrop-saturate-[160%]` so anything behind the card (the section's blurred ambient blobs) reads softly through.
- Border: `border border-white/[0.10]` at idle; the existing gradient corner washes (cyan top-right at 30% 0%, blue bottom-left at 80% 100%) stay because they give the glass colour and depth.
- **Drop the dotted noise overlay** (the radial-gradient `1px circle` pattern that ran on top of the gradient washes). The user reads it as cheap; it goes away entirely.
- A single inner highlight stroke `ring-1 ring-inset ring-white/[0.06]` along the top edge gives the glass a faint specular line.

### Idle state

- Frosted glass surface as above. No noise pattern.
- Icon chip: existing border + bg, **plus** a very slow ambient pulse on the chip's glow ring (8s, `opacity 0.6 ↔ 1`, `prefers-reduced-motion` disables it). This is the only idle motion.
- 3D tilt and mouse-follow spotlight stay (see "Hover state" — they're hover-driven, not idle).

### Hover state — the "reveal" + tilt + spotlight

Five coordinated effects:

1. **3D tilt** — kept from current implementation. `rotateX/rotateY` driven by `useMotionValue` on mousemove, max ±6°, `transformPerspective: 1200`. Glass surface plus subtle tilt is the core feel the user is asking for.
2. **Spotlight follow** — kept from current implementation. A 240px-circle radial-gradient at the cursor position, `rgba(0,240,255,0.16)` core fading to transparent, opacity `0 → 1` on hover. Reads as the cursor "lighting" the glass.
3. **Border + ring** tinting to `var(--color-electric-cyan)/35` plus the existing soft cyan box-shadow lift.
4. **Scan beam** — a horizontal gradient bar (~2px tall, fade-out edges, cyan with 0.6 alpha at peak), translated from `-100%` → `100%` across the card in ~700ms with `cubic-bezier(0.16, 1, 0.3, 1)`. Implemented as an absolutely-positioned `<span>` with `transform: translateX(-100%)` baseline and `group-hover:translateX(100%)`. One-shot per hover-enter, and stays past the right edge until the user leaves.
5. **Corner registration marks** — four small L-shaped SVG ticks at the four corners, sitting at `inset: -4px` so they read as crop marks just outside the card. They scale `0.8 → 1` and fade `0 → 1` on hover, ~300ms staggered (`delay-[0ms,40ms,80ms,120ms]`). Cyan stroke, ~12px L-arms, 1.25px stroke width.

Icon: transitions to cyan + drop-shadow glow (already in current code, kept).

The spotlight + scan beam read as different things — spotlight is ambient cursor-tracking, beam is a one-shot reveal. Spotlight stays at slightly reduced peak opacity (`0.12` instead of `0.16`) so the beam pop still registers.

### Reduced motion

`useReducedMotion()` short-circuits:
- The icon-chip ambient pulse.
- The scan-beam translate animation (the beam is hidden entirely).
- The 3D `rotateX/rotateY` tilt-on-mousemove.
- The mouse-follow spotlight.
- Corner ticks still appear on hover, but with opacity-only transition, no scale.

### SignatureCard

- Same outer treatment as `ToolCard`: same aspect ratio, same idle/hover behaviour, same scan beam, same corner ticks.
- Centre mark: replace the `◆` glyph with an inline SVG of the **Aurexis AR insignia** extracted from [public/logo.svg](../../../public/logo.svg).
  - Two paths: the angular "A" (clip-path `3db691f060`) and the open "R" (clip-path `82ef4bd447`).
  - Repackaged into a fresh `<svg viewBox="110 126 151 102">` with `fill="currentColor"`, dropping the original cream rectangle backgrounds and the footer wordmarks.
  - Sized ~72px mobile, ~88–96px md+.
  - Colour: `text-white/95` at idle, `text-[var(--color-electric-cyan)]` on hover, with the existing cyan drop-shadow text-shadow analogue (CSS `filter: drop-shadow(...)`).
- The "Signed / All in-house. / 0 resellers." typography and the "Aurexis · MY · 2026" footline stay unchanged.
- The mark sits inline in `TheStack.tsx` as a small `<AurexisMark />` function component — not a shared icon, since this is the only consumer.

### Files touched

- [src/components/sections/TheStack.tsx](../../../src/components/sections/TheStack.tsx) — reshape cards to landscape, switch to glass surface + drop dotted noise, keep tilt + spotlight, add scan-beam and corner-tick markup, refactor `ToolCard` and `SignatureCard` internals, inline `AurexisMark` SVG.

No new files. No new dependencies.

## Verification

- Manual: load `/about` at 1440×900; whole `TheStack` section (eyebrow → grid bottom) visible without scrolling.
- Manual: hover each card; scan beam sweeps once, corner ticks materialise, border lights cyan, icon glows cyan.
- Manual: signature card shows the AR mark cleanly centred at the same position the diamond used to occupy; hover treatment matches tool cards.
- Manual: with system reduce-motion enabled, no beam, no pulse, no tilt, no spotlight, no scale on corner ticks; hover colour transitions still work.
- Manual: mobile (375×812) — cards stack to single column, internal horizontal layout still readable, no overflow.
- Build gate: `npm run lint && npm run build` clean.
