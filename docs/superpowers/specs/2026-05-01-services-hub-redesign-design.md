# `/services` Hub Redesign — Design Spec

**Status:** Approved by user — direction chosen 2026-05-01
**Mockup (frozen reference):** [.superpowers/brainstorm/84442-1777639745/content/services-v1d-editorial-cinematic.html](.superpowers/brainstorm/84442-1777639745/content/services-v1d-editorial-cinematic.html)
**Replaces:** [src/app/services/page.tsx](src/app/services/page.tsx)

---

## Context

The current `/services` page is a stack of horizontal cards on a dark background — index + icon left, text center, outcomes + CTA right. It's functional but reads as a templated agency services list and doesn't carry the same premium register as the rest of the site (the aurora hero, the editorial postcard for location, the receipt-style stack section).

We brainstormed three directions and prototyped them as full HTML mockups. The user picked **Editorial Cinematic** (v1d): a magazine-style page where each service is its own near-full-viewport "act" with a unique animated visual artifact and scroll-triggered reveal motion.

The redesign keeps the four service entries (Ecosystem, AI Automation, Web Engineering, Mobile Ecosystems) and the enterprise-CTA at the end, but replaces the card-stack treatment with: a full-bleed editorial masthead → four animated acts (each with its own visual world) → a single mid-page interlude pull-quote → an editorial colophon close.

---

## Architecture

A single page assembled from focused section components, all under [src/app/services/](src/app/services/) and [src/components/sections/services/](src/components/sections/services/). The shader background is global to the page (mounted once at the layout level), not per-section.

```
src/app/services/page.tsx                     ← thin composer; imports & arranges sections
src/components/sections/services/
├── ServicesShaderBackground.tsx              ← wraps existing AnimatedShaderBackground full-viewport
├── ServicesMasthead.tsx                      ← editorial header: top-rule + giant title + meta-grid + lede
├── ServicesAct.tsx                           ← reusable wrapper: marker bar + 50/50 grid + scroll-reveal
├── visuals/EcosystemTopology.tsx             ← animated SVG: 3 spokes → amber hub, bezier paths, data packets
├── visuals/AIWorkshop.tsx                    ← 3-panel stack: live terminal + ingest stream + counter metrics
├── visuals/WebGauge.tsx                      ← circular Lighthouse gauge (sweeps 0→99) + 4 perf bars
├── visuals/MobilePhone.tsx                   ← phone frame with looping feed scroll + 3D tilt + 60fps badge
├── ServicesInterlude.tsx                     ← single editorial pull-quote between Act II and Act III
└── ServicesColophon.tsx                      ← editorial close: Fin. + signoff + discovery CTA + signature
```

### Why this shape

- **Each act has its own component** because each visual artifact is a distinct, complex thing with its own state (typing cycle, count-up, scroll loop, mouse tilt). Inlining them in `page.tsx` would make it ~1500 lines and untestable. Pulling them out also makes them reusable on a future per-service detail page.
- **`ServicesAct.tsx` as a wrapper** because the four acts share the same scaffolding: marker bar, 50/50 grid, alternating left/right placement, scroll-triggered reveal, accent color tint backdrop. Only the visual and the copy change.
- **Shader at the layout level** because mounting it inside each act would create four WebGL contexts (waste). Single fixed-position canvas behind everything.

### Data

Service copy stays where the existing page already keeps it: in [src/app/services/page.tsx](src/app/services/page.tsx) as the `SERVICES` array. We extract it to [src/data/services-hub.ts](src/data/services-hub.ts) so each visual component can import its slice cleanly without prop-drilling. Shape:

```ts
export type ServiceHubEntry = {
  id: ServiceSlug;          // 'ecosystem' | 'ai-automation' | 'web-engineering' | 'mobile-ecosystems'
  act: 'I' | 'II' | 'III' | 'IV';
  index: '01' | '02' | '03' | '04';
  title: string;            // "Ecosystem."
  titleColored?: string;    // optional word(s) to render in accent gradient
  label: string;            // "Full Stack"
  what: string;             // "Web, mobile, and AI engineered as one organism."
  pull: string;             // pull-quote copy
  desc: string;             // descriptive paragraph
  stats: { v: string; l: string }[];  // 2-3 entries; the `v` may be a plain string ("60 fps") or a number with `data-count` semantics
  accent: '#F59E0B' | '#00F0FF' | '#8B5CF6' | '#10B981';
  visual: 'topology' | 'workshop' | 'gauge' | 'phone';
};
```

The existing `ServiceSlug` type and `servicesData` map in [src/data/services.ts](src/data/services.ts) stay untouched — they power the detail pages. The new `services-hub.ts` is hub-page-specific, named by act order, and only contains the copy the hub renders. (We avoid adding `act/index/visual/pull` fields to the shared `services.ts` because they aren't relevant on detail pages.)

---

## Sections in detail

### Masthead

[src/components/sections/services/ServicesMasthead.tsx](src/components/sections/services/ServicesMasthead.tsx)

Server component (static). Three rows:
1. **Top-rule** — `[Live · 2026.05.01]` (with pulsing cyan dot) — `<hr>` — `Dispatch № 05 · Vol. I · The Capabilities Issue`. Dispatch number and date are constants for now (no need for live edition logic).
2. **Headline** — Instrument Serif italic, `clamp(72px, 14vw, 220px)`. Two lines: `What we build,` / `in detail.` (second line in cyan→blue→violet gradient).
3. **Meta-grid** (12-col) — Left: monospace metadata table (`Editor`, `Edition`, `Filed under`, `Surfaces`). Right: dropcap-led lede paragraph with a serif italic `<em>` accent on `custom ecosystems`.

No interactivity. Pure type composition.

### Act wrapper

[src/components/sections/services/ServicesAct.tsx](src/components/sections/services/ServicesAct.tsx)

Client component (uses `IntersectionObserver`). Props:
- `act: 'I' | 'II' | 'III' | 'IV'`
- `index: '01' | '02' | '03' | '04'`
- `accent: string`
- `visualSide: 'left' | 'right'` (alternates)
- `entry: ServiceHubEntry` (for header bar copy)
- `children: ReactNode` (the visual artifact)
- `text: ReactNode` (h2 + pull + desc + stats + read-more link)

Renders:
- Header marker row: pulsing dot · `Act I · Full Stack · Ecosystem` ─── `01 / 04`
- 12-col CSS grid: visual occupies one half, text the other half (swap via `order`)
- Adds `.in-view` class when intersection ≥ 25%, which triggers all CSS reveal transitions inside it (title, pull, desc, stats, visual scale-in) plus the per-act backdrop accent tint fade-in

The `data-count` count-up animation lives in `ServicesAct` too, since it triggers off the same `in-view` event for any descendant `[data-count]` element. Single `useEffect` watching the observer entry.

### Visuals (one per service)

#### Act I · `EcosystemTopology.tsx`

Animated SVG (`viewBox="0 0 600 600"`):
- 3 spokes at equilateral-triangle vertices: AI top `(300, 90)` cyan, Web bottom-left `(80, 470)` violet, Mobile bottom-right `(520, 470)` emerald.
- Amber Ecosystem hub at centroid `(300, 343)` with `r=28` core + animated `r=44→64` pulsing aura + radial-gradient halo.
- Three quadratic bezier paths from each spoke to hub, dashed `3 6`, with linear-gradient strokes from spoke color → amber.
- Three SVG `<animateMotion>` data packets traveling each path on independent loops (2.6s / 2.9s / 3.3s).
- Background: dashed orbit circle through the three spokes; soft radial glows behind each spoke for depth.
- Interaction: parent `topology-stage` div has `data-tilt`; the wrapper component listens for mousemove and applies `perspective(900px) rotateY/rotateX` up to ±8°.
- Floating labels: 4 absolutely-positioned glass pills (`AI`, `Web`, `Mobile`, `Ecosystem` — the last one in amber).

Pure React + SVG, no canvas. SSR-safe; effects only set tilt transform.

#### Act II · `AIWorkshop.tsx`

Three stacked glass panels:
1. **Terminal panel** — auto-types through three different agent scenarios on a 5.5s loop (Q3 churn retrieval → ticket routing → nightly digest). Implementation: state-driven render of token arrays per scenario, with a `setInterval` cycler. Blinking cursor at end of last line.
2. **Ingest stream panel** — 6 fake rows (CSV / PDF / Slack / CRM / Email tags) auto-scroll vertically inside an `overflow:hidden` container via CSS keyframes (`@keyframes streamUp`). Pure CSS, no JS.
3. **Metric panel** — two `data-count` numbers (`50+ hr` reclaimed/wk, `32 agents shipped`) that count up from 0 when the parent act enters view.

Client component (terminal cycler needs JS). Hydration-safe: render the first scenario as initial state.

#### Act III · `WebGauge.tsx`

Two-part composition:
- **Gauge circle**: SVG with two concentric circles. Background track (`stroke-opacity` faint). Foreground arc starts at `stroke-dashoffset: 502` (full circumference for `r=80`) and animates to `502 - 502 * 0.99 = ~5` over 2.2s when act enters view. Centered number animates `0 → 99` over the same duration via `requestAnimationFrame` count-up. Rotated `-90deg` so arc starts at 12 o'clock.
- **Perf bars**: 4 horizontal bars (LCP / CLS / FID / TTFB), each `width: 0` initially, transitions to `88% / 96% / 92% / 90%` with staggered transition-delays (1.0s / 1.2s / 1.4s / 1.6s) — kicks in after the gauge sweep so the eye follows top-to-bottom.

Client component (count-up). The gauge uses CSS `transition` on `stroke-dashoffset`, no animation library.

#### Act IV · `MobilePhone.tsx`

Two-part composition:
- **Phone frame** (`200×380`, `border-radius: 32px`): inner screen contains a duplicated feed of 12 row-mocks (`item` divs with avatar circle + 2 line bars). The feed uses `@keyframes scrollFeed { 0%→100% { translateY(0→-50%) } }` over 18s for a seamless loop (the duplicate makes the wrap invisible). 60fps badge floats off the upper-right corner.
- **Spec table** (5 rows: Frame rate · Codebase · Offline · Launch · Scale): each row slides in from `translateX(20px) opacity:0` with staggered delays (`0.8s` → `1.4s`) when the act enters view.
- Interaction: parent `phone-wrap` has `data-tilt`. Same mousemove handler as `EcosystemTopology` — `perspective(900px) rotateY/rotateX` up to ±8°.

Client component.

### Interlude

[src/components/sections/services/ServicesInterlude.tsx](src/components/sections/services/ServicesInterlude.tsx)

Sits between Act II and Act III. Single big serif italic blockquote with cyan-glowing typographic quote marks; small monospace attribution line below (`— Internal Manifesto · 2025`). Decorative center-cut dot at the top border. Static, no JS.

### Colophon

[src/components/sections/services/ServicesColophon.tsx](src/components/sections/services/ServicesColophon.tsx)

Page close. Order: `Fin.` (huge serif italic, gradient glow) → "Tell us what you're building. We'll tell you what it actually needs." → 45-min discovery copy → `Book a discovery →` text-link CTA (cyan underline) → small monospace signature line. Uses the same `Link` to `/contact` we use elsewhere.

### Background

[src/components/sections/services/ServicesShaderBackground.tsx](src/components/sections/services/ServicesShaderBackground.tsx)

Thin client wrapper that:
1. Renders the existing [src/components/ui/animated-shader-background.tsx](src/components/ui/animated-shader-background.tsx) (default cyan accent) at `position: fixed; inset: 0; z-index: 0; pointer-events: none`.
2. Overlays a soft corner-only vignette (`radial-gradient(ellipse 120% 90% at 50% 50%, transparent 50%, var(--bg)/0.4 100%)`) at `z-index: 1`.
3. Overlays the existing site grain SVG at `z-index: 1; opacity: 0.04; mix-blend-mode: overlay`.

Mounted in the page once. All `<main>` content sits at `z-index: 2`.

The existing component is dynamically imported with `ssr: false` so the WebGL-touching code never runs on the server.

---

## Reusable primitives

Existing primitives that are imported as-is:

- [src/components/ui/animated-shader-background.tsx](src/components/ui/animated-shader-background.tsx) — the WebGL shader, used full-viewport for the page background. No changes needed.
- [src/components/layout/Navbar.tsx](src/components/layout/Navbar.tsx) and [src/components/layout/Footer.tsx](src/components/layout/Footer.tsx) — composed in `page.tsx` as today.
- [src/lib/utils.ts](src/lib/utils.ts) `cn()` — for composing Tailwind classes.
- Design tokens from [src/app/globals.css](src/app/globals.css): `--color-electric-cyan`, `--color-nebula-violet`, `--color-emerald-glow`, `--bg-primary`, `--border-subtle`, `.glass`, fonts (`--font-plus-jakarta`, `--font-instrument-serif`, `--font-geist-mono`).
- `ChevronRight`, `ArrowUpRight` from lucide-react where icons are needed in CTAs.

Things we deliberately do **not** reuse:
- The `lucide-react` service icons (`Bot`, `Code2`, `Smartphone`, `Layers`) — replaced by the per-service custom visuals. The icons read as generic; the new visuals are the proof.
- The existing card/grid scaffolding in `services/page.tsx` — fully replaced.

---

## Animation discipline

All animations are CSS transitions/keyframes triggered by a single `IntersectionObserver` adding `.in-view` to each `<section.act>`, plus a small `requestAnimationFrame` count-up helper for `data-count` numbers. No Framer Motion on this page (already used elsewhere on the site, but unnecessary here — adds bundle weight for what is mostly enter-once reveals).

`prefers-reduced-motion`: gate the count-ups, the gauge sweep, the data-packet `animateMotion`, the streamed ingest, and the phone feed scroll behind a `prefers-reduced-motion: no-preference` media query. Static fallback shows the final state immediately (final number, full bars, packets at hub, feed at top). The shader keeps running at its normal rate — it's ambient and not vestibular-triggering, so it doesn't need to be gated.

---

## Verification

After the implementation plan executes:

1. **Static checks**
   - `npm run lint` — clean
   - `npm run build` — clean (no SSR warnings about `window`/`canvas` access)
   - TypeScript strict — clean

2. **Page-level**
   - Open `http://localhost:3000/services` in a browser. The page should match the mockup at `.superpowers/brainstorm/84442-1777639745/content/services-v1d-editorial-cinematic.html` to a close approximation.
   - Hard refresh with DevTools network tab — confirm no 404s, fonts load (Plus Jakarta + Instrument Serif).
   - DevTools console — no errors. Specifically no shader compile errors, no hydration mismatches.

3. **Per-section behavior**
   - Masthead: gradient on "in detail." renders in cyan→blue→violet.
   - Act I: scroll into view → title fades up, packets start traveling, hub pulses. Mousemove over the topology → tilts in 3D. Colors: AI=cyan top, Web=violet bottom-left, Mobile=emerald bottom-right, Ecosystem=amber center.
   - Act II: terminal cycles through three scenarios on a loop; ingest rows scroll vertically; `50+` and `32` count up from `0+` and `0` when scrolled into view.
   - Act III: gauge arc sweeps from 0 to 99 (~2.2s), centered number ticks `0 → 99` in sync; perf bars draw left-to-right with staggered delays.
   - Act IV: phone feed scrolls seamlessly forever; mousemove tilts the phone in 3D; spec rows slide in one-by-one.

4. **Reduced motion**
   - DevTools → Rendering → emulate `prefers-reduced-motion: reduce`. Reload. Acts should show their final state immediately, no count-ups, no scrolling feed, no packet motion. Page is still readable and laid out.

5. **Responsive**
   - At ≤980px: edge-runners hidden, masthead meta-grid stacks, each act stacks **text-above-visual** (consistent across all four acts — read before you see the demo), phone-stage stacks specs below the phone.

---

## Out of scope for this redesign

- The `[slug]` detail pages at [src/app/services/[slug]/page.tsx](src/app/services/[slug]/page.tsx) — untouched. Their data lives in [src/data/services.ts](src/data/services.ts).
- Adding the `ecosystem` slug to that detail-page data + `generateStaticParams()` — separate follow-up flagged earlier; not required to ship the new hub.
- The `/svc-ecosystem.png` image asset — not used in the new hub design (the topology visual replaces the need for a hero image).
- Any home-page or about-page changes.
- A11y deep audit beyond `prefers-reduced-motion` and semantic landmarks; lift to a follow-up if needed.
