# `/services` Hub Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the card-stack `/services` hub page with the editorial-cinematic redesign that landed in [.superpowers/brainstorm/84442-1777639745/content/services-v1d-editorial-cinematic.html](.superpowers/brainstorm/84442-1777639745/content/services-v1d-editorial-cinematic.html).

**Architecture:** A single Next.js App Router page composed of small, focused section/visual components under `src/components/sections/services/`. The shader background mounts once at the page level (one WebGL context for the whole page). All scroll-triggered reveals run off a single shared `IntersectionObserver` inside the `ServicesAct` wrapper. Animation is plain CSS + a small `requestAnimationFrame` count-up — no Framer Motion on this page.

**Tech Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Tailwind 4 · `next/dynamic` for the shader (`ssr: false`) · the existing [src/components/ui/animated-shader-background.tsx](src/components/ui/animated-shader-background.tsx) is reused as-is.

**Verification model:** This project has no component test framework. Per [CLAUDE.md](CLAUDE.md), verification = `npm run lint` after each component, `npm run build` once the page is composed, and browser exercise of the running dev server at the end. No unit tests are added.

**Spec:** [docs/superpowers/specs/2026-05-01-services-hub-redesign-design.md](docs/superpowers/specs/2026-05-01-services-hub-redesign-design.md)

---

## File map (decomposition lock)

| Path | Responsibility |
| --- | --- |
| `src/data/services-hub.ts` | Hub-page-specific copy & visual mapping for the four services. Type `ServiceHubEntry`. |
| `src/app/globals.css` | Append page-specific keyframes (`streamUp`, `scrollFeed`, `cursorBlink`, `slowSpin`). |
| `src/components/sections/services/ServicesShaderBackground.tsx` | Client wrapper: dynamic-imports the WebGL shader (ssr:false), adds vignette overlay + grain. |
| `src/components/sections/services/ServicesMasthead.tsx` | Server. Top-rule + giant headline + meta-grid + dropcap lede. |
| `src/components/sections/services/ServicesAct.tsx` | Client. Reusable wrapper: marker bar + 50/50 grid + scroll-reveal + count-up. Accepts `<text>` and `<visual>` slots. |
| `src/components/sections/services/visuals/EcosystemTopology.tsx` | Client. Animated SVG: 3 spokes → amber hub, bezier paths, traveling data packets, mouse tilt. |
| `src/components/sections/services/visuals/AIWorkshop.tsx` | Client. 3-panel stack: cycling terminal + scrolling ingest + count-up metrics. |
| `src/components/sections/services/visuals/WebGauge.tsx` | Client. Lighthouse arc (sweeps 0→99) + 4 perf bars (staggered). |
| `src/components/sections/services/visuals/MobilePhone.tsx` | Client. Phone frame + looping feed + 3D mouse tilt + 60fps badge + spec rows. |
| `src/components/sections/services/ServicesInterlude.tsx` | Server. Pull-quote between Act II and Act III. |
| `src/components/sections/services/ServicesColophon.tsx` | Server. `Fin.` + signoff + discovery CTA + signature. |
| `src/app/services/page.tsx` | Server. Composes Navbar → ShaderBackground → Masthead → Acts I-IV (with Interlude) → Colophon → Footer. |

The existing detail-page data in [src/data/services.ts](src/data/services.ts) and `[slug]` page in [src/app/services/[slug]/page.tsx](src/app/services/[slug]/page.tsx) are **not modified** — they keep working through the redesign.

---

## Task 1: Add hub data file

**Files:**
- Create: `src/data/services-hub.ts`

- [ ] **Step 1: Create the data file**

Path: `src/data/services-hub.ts`

```ts
export type ServiceVisual = "topology" | "workshop" | "gauge" | "phone";
export type ServiceAccent = "#F59E0B" | "#00F0FF" | "#8B5CF6" | "#10B981";

export type ServiceHubEntry = {
  id: "ecosystem" | "ai-automation" | "web-engineering" | "mobile-ecosystems";
  act: "I" | "II" | "III" | "IV";
  index: "01" | "02" | "03" | "04";
  label: string;
  title: string;
  /** Optional substring of `title` that should render in the accent gradient (e.g. "AI" in "AI Automation."). */
  titleColored?: string;
  what: string;
  pull: string;
  desc: string;
  /**
   * 2-3 stat tiles shown under the body copy. `count` (when present) animates from 0 on scroll-into-view.
   * `value` is what gets rendered (suffix + prefix included).
   */
  stats: { value: string; label: string; count?: number; suffix?: string }[];
  accent: ServiceAccent;
  visual: ServiceVisual;
  /** Side the visual sits on at desktop widths. Acts I & III: right. Acts II & IV: left. */
  visualSide: "left" | "right";
};

export const servicesHub: ServiceHubEntry[] = [
  {
    id: "ecosystem",
    act: "I",
    index: "01",
    label: "Full Stack",
    title: "Ecosystem.",
    what: "Web, mobile, and AI engineered as one organism.",
    pull: "Web, mobile, and AI engineered as one organism — shared data, shared design, one team.",
    desc:
      "Most agencies hand you three vendors and call it a stack. We architect Web, Mobile, and AI Automation as a single intelligent system — the kind that compounds, not competes.",
    stats: [
      { value: "3 → 1", label: "Vendors collapsed" },
      { value: "1 SoT", label: "Source of truth" },
      { value: "1 team", label: "Accountable" },
    ],
    accent: "#F59E0B",
    visual: "topology",
    visualSide: "right",
  },
  {
    id: "ai-automation",
    act: "II",
    index: "02",
    label: "AI & LLM",
    title: "AI Automation.",
    titleColored: "AI",
    what: "Replace headcount with intelligent systems.",
    pull:
      "Custom LLMs, RAG pipelines, and autonomous workflow agents — engineered to replace repetitive ops, not just speed them up.",
    desc:
      "Off-the-shelf chatbots speed up a broken process. We re-engineer the process. Fine-tuned agents that hold context, retrieval pipelines anchored to your real source-of-truth, autonomous decisions where they earn the right.",
    stats: [
      { value: "0+", label: "Hours / wk reclaimed", count: 50, suffix: "+" },
      { value: "0", label: "Agents shipped", count: 32, suffix: "" },
    ],
    accent: "#00F0FF",
    visual: "workshop",
    visualSide: "left",
  },
  {
    id: "web-engineering",
    act: "III",
    index: "03",
    label: "Web & SEO",
    title: "Web Engineering.",
    titleColored: "Engineering.",
    what: "Performance is a feature, not an afterthought.",
    pull:
      "Ultra-fast, meticulously designed digital platforms — built for SEO dominance and conversion, not for the design awards reel.",
    desc:
      "Every interaction is a performance budget decision. Sub-1.5s global load times because we engineered the entire pipeline. Lighthouse 99+ as the floor, not the ceiling.",
    stats: [
      { value: "0+", label: "Lighthouse", count: 99, suffix: "+" },
      { value: "0.92s", label: "Avg LCP" },
      { value: "0", label: "Sites shipped", count: 47, suffix: "" },
    ],
    accent: "#8B5CF6",
    visual: "gauge",
    visualSide: "right",
  },
  {
    id: "mobile-ecosystems",
    act: "IV",
    index: "04",
    label: "Mobile & App",
    title: "Mobile Ecosystems.",
    titleColored: "Ecosystems.",
    what: "Native performance. Zero compromise.",
    pull:
      "Seamless iOS and Android experiences built with React Native — designed to scale from zero to a hundred thousand users without friction.",
    desc:
      "A single codebase shouldn't mean a single compromise. 60fps because the architecture demanded it. Offline-first because users don't have signal in the elevator.",
    stats: [
      { value: "60 fps", label: "Native baseline" },
      { value: "0k", label: "User scale tested", count: 100, suffix: "k" },
    ],
    accent: "#10B981",
    visual: "phone",
    visualSide: "left",
  },
];
```

- [ ] **Step 2: Lint**

Run: `npm run lint`
Expected: clean (no new warnings/errors).

- [ ] **Step 3: Commit**

```bash
git add src/data/services-hub.ts
git commit -m "feat(services): add hub-page service data + ServiceHubEntry type"
```

---

## Task 2: Append page-specific keyframes to globals.css

**Files:**
- Modify: `src/app/globals.css`

- [ ] **Step 1: Read the current end of the file to find a safe insertion point**

Run: `wc -l src/app/globals.css` to confirm the file size, then read the last 40 lines to find a clean spot to append keyframes.

- [ ] **Step 2: Append this block to the end of `src/app/globals.css`**

```css
/* ====================================================================
   /services hub redesign — page-local keyframes (2026-05-01)
   ==================================================================== */

@keyframes services-stream-up {
  0% { transform: translateY(60px); }
  100% { transform: translateY(-160px); }
}
@keyframes services-scroll-feed {
  0% { transform: translateY(0); }
  100% { transform: translateY(-50%); }
}
@keyframes services-cursor-blink {
  50% { opacity: 0; }
}
@keyframes services-slow-spin {
  to { transform: translate(-50%, -50%) rotate(360deg); }
}
@keyframes services-pulse-soft {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

/* honor prefers-reduced-motion: freeze these animations at their initial state */
@media (prefers-reduced-motion: reduce) {
  .services-anim-stream-up,
  .services-anim-scroll-feed,
  .services-anim-cursor-blink,
  .services-anim-slow-spin,
  .services-anim-pulse-soft { animation: none !important; }
}
```

- [ ] **Step 3: Lint and build**

Run: `npm run lint && npm run build`
Expected: clean.

- [ ] **Step 4: Commit**

```bash
git add src/app/globals.css
git commit -m "feat(services): add hub-redesign keyframes to globals.css"
```

---

## Task 3: ServicesShaderBackground component

**Files:**
- Create: `src/components/sections/services/ServicesShaderBackground.tsx`

- [ ] **Step 1: Verify the parent dir exists**

Run: `ls src/components/sections/` — should list existing sections. Then `mkdir -p src/components/sections/services/visuals`.

- [ ] **Step 2: Create the file**

Path: `src/components/sections/services/ServicesShaderBackground.tsx`

```tsx
"use client";

import dynamic from "next/dynamic";

// The WebGL shader touches `window` and `THREE`; keep it client-only.
const AnimatedShaderBackground = dynamic(
  () =>
    import("@/components/ui/animated-shader-background").then(
      (mod) => mod.AnimatedShaderBackground,
    ),
  { ssr: false },
);

export function ServicesShaderBackground() {
  return (
    <>
      <div
        aria-hidden
        className="fixed inset-0 z-0 pointer-events-none"
      >
        <AnimatedShaderBackground />
      </div>
      {/* Soft corner-only vignette so the type stays legible */}
      <div
        aria-hidden
        className="fixed inset-0 z-[1] pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 120% 90% at 50% 50%, transparent 50%, rgba(3,4,8,0.4) 100%)",
        }}
      />
      {/* Film grain overlay */}
      <div
        aria-hidden
        className="fixed inset-0 z-[1] pointer-events-none mix-blend-overlay opacity-[0.04]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.55 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")",
        }}
      />
    </>
  );
}
```

- [ ] **Step 3: Lint**

Run: `npm run lint`
Expected: clean.

- [ ] **Step 4: Commit**

```bash
git add src/components/sections/services/ServicesShaderBackground.tsx
git commit -m "feat(services): wrap shader bg with vignette + grain overlay"
```

---

## Task 4: ServicesMasthead

**Files:**
- Create: `src/components/sections/services/ServicesMasthead.tsx`

- [ ] **Step 1: Create the file**

Path: `src/components/sections/services/ServicesMasthead.tsx`

```tsx
import { cn } from "@/lib/utils";

export function ServicesMasthead() {
  return (
    <header className="relative pt-[180px] pb-[130px] border-b border-white/10">
      {/* top-rule */}
      <div className="absolute top-[110px] left-0 right-0 grid grid-cols-[auto_1fr_auto] items-center gap-6 font-mono text-[10.5px] uppercase tracking-[0.24em] text-[#6B7588]">
        <span className="text-[var(--color-electric-cyan)] inline-flex items-center gap-2 before:content-[''] before:w-1.5 before:h-1.5 before:rounded-full before:bg-[var(--color-electric-cyan)] before:shadow-[0_0_10px_var(--color-electric-cyan)] before:[animation:services-pulse-soft_1.6s_ease-in-out_infinite] services-anim-pulse-soft">
          Live · 2026.05.01
        </span>
        <div className="h-px bg-white/[0.18]" />
        <span>Dispatch № 05 · Vol. I · The Capabilities Issue</span>
      </div>

      {/* headline */}
      <h1
        className={cn(
          "font-serif italic text-[clamp(72px,14vw,220px)] leading-[0.92] tracking-[-0.035em] text-white",
          "[text-shadow:0_2px_40px_rgba(0,0,0,0.5)]",
        )}
        style={{ marginLeft: "-0.04em" }}
      >
        What we build,
        <br />
        <span
          className="bg-clip-text text-transparent"
          style={{
            backgroundImage:
              "linear-gradient(110deg, #00F0FF 0%, #5B8DFF 45%, #8B5CF6 90%)",
            filter: "drop-shadow(0 0 36px rgba(0,240,255,0.35))",
          }}
        >
          in detail.
        </span>
      </h1>

      {/* meta-grid */}
      <div className="grid grid-cols-12 gap-8 mt-[84px] items-end">
        <dl className="col-span-5 font-mono text-[11px] uppercase tracking-[0.18em] text-[#6B7588] leading-[2] space-y-0">
          <Row k="Editor" v="Aurexis Solution" />
          <Row k="Edition" v="05 · 2026.05.01" />
          <Row k="Filed under" v="Capabilities · Architecture" />
          <Row k="Surfaces" v="04 — Ecosystem · AI · Web · Mobile" />
        </dl>
        <p className="col-start-7 col-span-6 text-[19px] text-[#B7BFCC] leading-[1.6] max-w-[580px]">
          <span className="float-left font-serif italic text-[84px] leading-[0.8] pr-3.5 pt-1.5 text-white">
            W
          </span>
          e don&apos;t sell packages, and we don&apos;t sell tiers. We architect{" "}
          <em className="font-serif italic text-white text-[22px] not-italic-fix">
            custom ecosystems
          </em>{" "}
          — four disciplines, one accountable team, and a refusal to ship a template where a system is needed. What follows is not a brochure. It&apos;s a record of how we work.
        </p>
      </div>
    </header>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex gap-[18px]">
      <dt className="text-white w-[110px]">{k}</dt>
      <dd>{v}</dd>
    </div>
  );
}
```

> Note: the class `not-italic-fix` is intentionally unused; it's a no-op leftover from translating the mockup. Remove the class if your linter flags it.

- [ ] **Step 2: Lint**

Run: `npm run lint`
Expected: clean. If `not-italic-fix` is flagged, remove that class from the JSX.

- [ ] **Step 3: Commit**

```bash
git add src/components/sections/services/ServicesMasthead.tsx
git commit -m "feat(services): editorial masthead with gradient headline + dropcap lede"
```

---

## Task 5: ServicesInterlude

**Files:**
- Create: `src/components/sections/services/ServicesInterlude.tsx`

- [ ] **Step 1: Create the file**

```tsx
export function ServicesInterlude() {
  return (
    <section className="relative py-[140px] text-center border-b border-white/10">
      <span
        aria-hidden
        className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 text-4xl text-[var(--color-electric-cyan)] bg-[var(--color-background,#030408)] px-4 leading-none"
        style={{ textShadow: "0 0 14px var(--color-electric-cyan)" }}
      >
        ·
      </span>
      <blockquote className="font-serif italic font-normal text-[clamp(34px,4.4vw,60px)] leading-[1.18] tracking-[-0.02em] text-white max-w-[1080px] mx-auto [text-shadow:0_2px_30px_rgba(0,0,0,0.4)]">
        <span
          className="text-[var(--color-electric-cyan)]"
          style={{ textShadow: "0 0 22px rgba(0,240,255,0.4)" }}
        >
          &ldquo;
        </span>
        The agencies that win the next decade won&apos;t ship sites — they&apos;ll ship systems that operate themselves.
        <span
          className="text-[var(--color-electric-cyan)]"
          style={{ textShadow: "0 0 22px rgba(0,240,255,0.4)" }}
        >
          &rdquo;
        </span>
      </blockquote>
      <div className="inline-flex items-center gap-3.5 mt-[38px] font-mono text-[11px] uppercase tracking-[0.28em] text-[#6B7588] before:content-[''] before:w-8 before:h-px before:bg-white/[0.18] after:content-[''] after:w-8 after:h-px after:bg-white/[0.18]">
        Internal Manifesto · 2025
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Lint**

Run: `npm run lint`
Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add src/components/sections/services/ServicesInterlude.tsx
git commit -m "feat(services): editorial interlude pull-quote between acts II and III"
```

---

## Task 6: ServicesColophon

**Files:**
- Create: `src/components/sections/services/ServicesColophon.tsx`

- [ ] **Step 1: Create the file**

```tsx
import Link from "next/link";

export function ServicesColophon() {
  return (
    <footer className="relative pt-[200px] pb-[220px] text-center">
      <div
        aria-hidden
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[280px] h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, var(--color-electric-cyan), transparent)",
        }}
      />
      <div className="font-serif italic text-[clamp(56px,8vw,112px)] leading-none tracking-[-0.03em] text-white mb-7">
        <span
          className="bg-clip-text text-transparent"
          style={{
            backgroundImage:
              "linear-gradient(120deg, #00F0FF 0%, #5B8DFF 60%, #8B5CF6 100%)",
            filter: "drop-shadow(0 0 28px rgba(0,240,255,0.35))",
          }}
        >
          Fin.
        </span>
      </div>
      <h3 className="font-serif italic font-normal text-[clamp(34px,4vw,56px)] leading-[1.2] tracking-[-0.02em] text-white mb-7 max-w-[900px] mx-auto">
        Tell us what you&apos;re building.
        <br />
        We&apos;ll tell you what it actually needs.
      </h3>
      <p className="text-[#B7BFCC] text-[17px] leading-[1.75] max-w-[580px] mx-auto mb-14">
        A 45-minute architecture review with a partner. No deck, no pitch — just a working session on the system you&apos;re trying to ship. NDA-protected and free.
      </p>
      <Link
        href="/contact"
        className="group inline-flex items-center gap-3.5 font-mono text-xs uppercase tracking-[0.26em] text-white border-b border-[var(--color-electric-cyan)] pb-2.5 transition-[gap] duration-200 hover:gap-5"
      >
        Book a discovery
        <span className="text-[var(--color-electric-cyan)]">→</span>
      </Link>
      <div className="mt-[84px] font-mono text-[11px] uppercase tracking-[0.24em] text-[#6B7588]">
        — <span className="text-[#B7BFCC]">Aurexis Solution</span> · Sungai Petani · Built in Malaysia · 2026
      </div>
    </footer>
  );
}
```

- [ ] **Step 2: Lint**

Run: `npm run lint`
Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add src/components/sections/services/ServicesColophon.tsx
git commit -m "feat(services): editorial colophon with Fin. + discovery CTA"
```

---

## Task 7: ServicesAct wrapper (scroll-reveal + count-up)

**Files:**
- Create: `src/components/sections/services/ServicesAct.tsx`

- [ ] **Step 1: Create the file**

```tsx
"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { ServiceHubEntry } from "@/data/services-hub";

type Props = {
  entry: ServiceHubEntry;
  visual: ReactNode;
};

export function ServicesAct({ entry, visual }: Props) {
  const ref = useRef<HTMLElement | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setInView(true);
            obs.disconnect();
            return;
          }
        }
      },
      { threshold: 0.25 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const colored = entry.titleColored;
  const beforeColored = colored && entry.title.startsWith(colored)
    ? ""
    : colored
      ? entry.title.split(colored)[0]
      : entry.title;
  const afterColored = colored ? entry.title.split(colored)[1] ?? "" : "";

  // Backdrop tint position: right side for visual-right, left side for visual-left.
  const tintPos = entry.visualSide === "right" ? "75%" : "25%";

  return (
    <section
      ref={ref}
      data-act={entry.act}
      data-in-view={inView ? "true" : "false"}
      className="relative min-h-[92vh] py-20 border-b border-white/10 flex flex-col justify-center"
      style={
        {
          "--accent": entry.accent,
        } as React.CSSProperties
      }
    >
      {/* per-act backdrop tint */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 pointer-events-none transition-opacity duration-[1200ms] ease-out"
        style={{
          opacity: inView ? 1 : 0,
          background: `radial-gradient(ellipse 70% 80% at ${tintPos} 50%, ${entry.accent}1A, transparent 60%)`,
        }}
      />

      {/* marker bar */}
      <div className="flex items-center gap-[18px] mb-14 font-mono text-[11px] uppercase tracking-[0.28em] text-[#6B7588]">
        <span
          className="w-1.5 h-1.5 rounded-full"
          style={{
            background: entry.accent,
            boxShadow: `0 0 14px ${entry.accent}`,
          }}
        />
        <span>
          <span className="font-medium" style={{ color: entry.accent }}>
            Act {entry.act}
          </span>{" "}
          · {entry.label} · {entry.title.replace(/\.$/, "")}
        </span>
        <div className="flex-1 h-px bg-white/[0.18]" />
        <span style={{ color: entry.accent }}>{entry.index} / 04</span>
      </div>

      {/* 50/50 grid; alternates by visualSide */}
      <div
        className={cn(
          "grid gap-16 items-center",
          entry.visualSide === "right"
            ? "grid-cols-1 md:grid-cols-[5fr_7fr]"
            : "grid-cols-1 md:grid-cols-[7fr_5fr]",
        )}
      >
        {/* TEXT block — order swaps based on visualSide */}
        <div className={entry.visualSide === "left" ? "md:order-2" : ""}>
          <h2
            className="font-serif italic font-normal text-[clamp(64px,8.5vw,140px)] leading-[0.94] tracking-[-0.035em] text-white mb-8 [text-shadow:0_2px_40px_rgba(0,0,0,0.5)] transition-all duration-[1000ms] ease-out"
            style={{
              opacity: inView ? 1 : 0,
              transform: `translateY(${inView ? 0 : 40}px)`,
              transitionDelay: "100ms",
            }}
          >
            {beforeColored}
            {colored && (
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage: `linear-gradient(120deg, ${entry.accent}, color-mix(in srgb, ${entry.accent} 50%, white))`,
                  filter: `drop-shadow(0 0 28px color-mix(in srgb, ${entry.accent} 40%, transparent))`,
                }}
              >
                {colored}
              </span>
            )}
            {afterColored}
          </h2>

          <p
            className="font-serif italic text-[clamp(20px,2.1vw,26px)] leading-[1.4] text-white mb-8 max-w-[600px] relative pl-7 transition-all duration-[900ms] ease-out"
            style={{
              opacity: inView ? 1 : 0,
              transform: `translateY(${inView ? 0 : 20}px)`,
              transitionDelay: "300ms",
            }}
          >
            <span
              aria-hidden
              className="absolute left-0 top-[0.5em] w-2.5 h-2.5 rounded-full"
              style={{
                background: entry.accent,
                boxShadow: `0 0 20px color-mix(in srgb, ${entry.accent} 70%, transparent)`,
              }}
            />
            {entry.pull}
          </p>

          <p
            className="text-[17px] leading-[1.75] text-[#B7BFCC] max-w-[560px] mb-9 transition-all duration-[900ms] ease-out"
            style={{
              opacity: inView ? 1 : 0,
              transform: `translateY(${inView ? 0 : 20}px)`,
              transitionDelay: "450ms",
            }}
          >
            {entry.desc}
          </p>

          <div
            className="flex flex-wrap gap-10 py-7 border-t border-white/10 mb-8 max-w-[600px] transition-all duration-[900ms] ease-out"
            style={{
              opacity: inView ? 1 : 0,
              transform: `translateY(${inView ? 0 : 20}px)`,
              transitionDelay: "600ms",
            }}
          >
            {entry.stats.map((s) => (
              <Stat
                key={s.label}
                stat={s}
                accent={entry.accent}
                inView={inView}
              />
            ))}
          </div>

          <a
            href="#"
            className="inline-flex items-center gap-3.5 font-mono text-xs uppercase tracking-[0.22em] text-white border-b pb-2 transition-[opacity,gap] duration-[700ms] ease-out hover:gap-[18px]"
            style={{
              borderColor: entry.accent,
              opacity: inView ? 1 : 0,
              transitionDelay: "750ms",
            }}
          >
            Continue reading
            <span style={{ color: entry.accent }}>→</span>
          </a>
        </div>

        {/* VISUAL block */}
        <div
          className="relative min-h-[460px] flex items-center justify-center transition-all duration-[1200ms] ease-out"
          style={{
            opacity: inView ? 1 : 0,
            transform: `translateY(${inView ? 0 : 30}px) scale(${inView ? 1 : 0.96})`,
            transitionDelay: "200ms",
          }}
        >
          {visual}
        </div>
      </div>
    </section>
  );
}

function Stat({
  stat,
  accent,
  inView,
}: {
  stat: ServiceHubEntry["stats"][number];
  accent: string;
  inView: boolean;
}) {
  const [display, setDisplay] = useState(stat.value);

  useEffect(() => {
    if (!inView || stat.count === undefined) return;
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setDisplay(`${stat.count}${stat.suffix ?? ""}`);
      return;
    }
    const target = stat.count;
    const start = performance.now();
    const dur = 1400;
    let raf = 0;
    const tick = (t: number) => {
      const k = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - k, 3);
      const v = Math.round(target * eased);
      setDisplay(`${v}${stat.suffix ?? ""}`);
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, stat.count, stat.suffix]);

  return (
    <div>
      <div
        className="font-serif italic text-[38px] leading-none tracking-[-0.02em] mb-1.5"
        style={{
          color: accent,
          textShadow: `0 0 22px color-mix(in srgb, ${accent} 35%, transparent)`,
        }}
      >
        {display}
      </div>
      <div className="font-mono text-[9.5px] tracking-[0.22em] uppercase text-[#6B7588]">
        {stat.label}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Lint**

Run: `npm run lint`
Expected: clean. If unused imports flagged, prune.

- [ ] **Step 3: Commit**

```bash
git add src/components/sections/services/ServicesAct.tsx
git commit -m "feat(services): act wrapper with scroll-reveal + count-up + accent tint"
```

---

## Task 8: Visual — EcosystemTopology

**Files:**
- Create: `src/components/sections/services/visuals/EcosystemTopology.tsx`

- [ ] **Step 1: Create the file**

```tsx
"use client";

import { useRef } from "react";

export function EcosystemTopology() {
  const wrapRef = useRef<HTMLDivElement | null>(null);

  function onMove(e: React.MouseEvent) {
    const el = wrapRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(900px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg)`;
  }
  function onLeave() {
    const el = wrapRef.current;
    if (!el) return;
    el.style.transform = "perspective(900px) rotateY(0) rotateX(0)";
  }

  return (
    <div
      ref={wrapRef}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className="w-full max-w-[580px] aspect-square relative transition-transform duration-[400ms] ease-out"
    >
      <svg
        viewBox="0 0 600 600"
        fill="none"
        className="w-full h-full overflow-visible"
      >
        <defs>
          <linearGradient id="eco-conn-ai" x1="0.5" y1="0" x2="0.5" y2="1">
            <stop offset="0%" stopColor="#00F0FF" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.85" />
          </linearGradient>
          <linearGradient id="eco-conn-web" x1="0" y1="1" x2="1" y2="0.4">
            <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.85" />
          </linearGradient>
          <linearGradient id="eco-conn-mobile" x1="1" y1="1" x2="0" y2="0.4">
            <stop offset="0%" stopColor="#10B981" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.85" />
          </linearGradient>
          <radialGradient id="eco-hub-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.55" />
            <stop offset="60%" stopColor="#F59E0B" stopOpacity="0.10" />
            <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="eco-ai-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#00F0FF" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#00F0FF" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="eco-web-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="eco-mobile-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#10B981" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* dashed orbit through 3 spokes */}
        <circle
          cx="300"
          cy="343"
          r="253"
          stroke="rgba(255,255,255,0.07)"
          strokeWidth="1"
          strokeDasharray="2 7"
          fill="none"
        />

        {/* spoke halos */}
        <circle cx="300" cy="90" r="80" fill="url(#eco-ai-glow)" />
        <circle cx="80" cy="470" r="80" fill="url(#eco-web-glow)" />
        <circle cx="520" cy="470" r="80" fill="url(#eco-mobile-glow)" />

        {/* hub aura */}
        <circle cx="300" cy="343" r="220" fill="url(#eco-hub-glow)" />

        {/* curved bezier connections */}
        <path
          id="eco-path-ai"
          d="M 300 90 Q 240 220 300 343"
          stroke="url(#eco-conn-ai)"
          strokeWidth="1.6"
          strokeDasharray="3 6"
          fill="none"
        />
        <path
          id="eco-path-web"
          d="M 80 470 Q 200 460 300 343"
          stroke="url(#eco-conn-web)"
          strokeWidth="1.6"
          strokeDasharray="3 6"
          fill="none"
        />
        <path
          id="eco-path-mobile"
          d="M 520 470 Q 400 460 300 343"
          stroke="url(#eco-conn-mobile)"
          strokeWidth="1.6"
          strokeDasharray="3 6"
          fill="none"
        />

        {/* traveling data packets */}
        <circle r="6" fill="#00F0FF">
          <animateMotion dur="2.6s" repeatCount="indefinite">
            <mpath href="#eco-path-ai" />
          </animateMotion>
          <animate
            attributeName="opacity"
            values="0;1;1;0"
            dur="2.6s"
            repeatCount="indefinite"
          />
        </circle>
        <circle r="6" fill="#8B5CF6">
          <animateMotion dur="2.9s" repeatCount="indefinite">
            <mpath href="#eco-path-web" />
          </animateMotion>
          <animate
            attributeName="opacity"
            values="0;1;1;0"
            dur="2.9s"
            repeatCount="indefinite"
          />
        </circle>
        <circle r="6" fill="#10B981">
          <animateMotion dur="3.3s" repeatCount="indefinite">
            <mpath href="#eco-path-mobile" />
          </animateMotion>
          <animate
            attributeName="opacity"
            values="0;1;1;0"
            dur="3.3s"
            repeatCount="indefinite"
          />
        </circle>

        {/* AI node (top, cyan) */}
        <circle cx="300" cy="90" r="11" fill="#00F0FF">
          <animate
            attributeName="r"
            values="11;15;11"
            dur="2.6s"
            repeatCount="indefinite"
          />
        </circle>
        <circle cx="300" cy="90" r="26" fill="#00F0FF" opacity="0.16" />

        {/* Web node (bottom-left, violet) */}
        <circle cx="80" cy="470" r="11" fill="#8B5CF6">
          <animate
            attributeName="r"
            values="11;15;11"
            dur="2.9s"
            repeatCount="indefinite"
          />
        </circle>
        <circle cx="80" cy="470" r="26" fill="#8B5CF6" opacity="0.16" />

        {/* Mobile node (bottom-right, emerald) */}
        <circle cx="520" cy="470" r="11" fill="#10B981">
          <animate
            attributeName="r"
            values="11;15;11"
            dur="3.3s"
            repeatCount="indefinite"
          />
        </circle>
        <circle cx="520" cy="470" r="26" fill="#10B981" opacity="0.16" />

        {/* hub */}
        <circle cx="300" cy="343" r="28" fill="#F59E0B" />
        <circle cx="300" cy="343" r="44" fill="#F59E0B" opacity="0.22">
          <animate
            attributeName="r"
            values="44;64;44"
            dur="2.4s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0.22;0;0.22"
            dur="2.4s"
            repeatCount="indefinite"
          />
        </circle>
      </svg>

      <Label x="50%" y="7%">AI</Label>
      <Label x="13.3%" y="87%">Web</Label>
      <Label x="86.7%" y="87%">Mobile</Label>
      <Label x="50%" y="67%" amber>
        Ecosystem
      </Label>
    </div>
  );
}

function Label({
  x,
  y,
  amber,
  children,
}: {
  x: string;
  y: string;
  amber?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className="absolute -translate-x-1/2 -translate-y-1/2 font-mono text-[10px] uppercase tracking-[0.2em] backdrop-blur-md px-3 py-1.5 rounded-full whitespace-nowrap pointer-events-none"
      style={{
        left: x,
        top: y,
        color: amber ? "#F59E0B" : "#F8FAFC",
        background: amber ? "rgba(245,158,11,0.12)" : "rgba(8,9,13,0.85)",
        border: amber
          ? "1px solid rgba(245,158,11,0.5)"
          : "1px solid rgba(255,255,255,0.18)",
        boxShadow: amber ? "0 0 22px rgba(245,158,11,0.4)" : undefined,
      }}
    >
      {children}
    </div>
  );
}
```

- [ ] **Step 2: Lint**

Run: `npm run lint`
Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add src/components/sections/services/visuals/EcosystemTopology.tsx
git commit -m "feat(services): ecosystem topology visual with bezier paths + data packets"
```

---

## Task 9: Visual — AIWorkshop

**Files:**
- Create: `src/components/sections/services/visuals/AIWorkshop.tsx`

- [ ] **Step 1: Create the file**

```tsx
"use client";

import { useEffect, useState } from "react";

type Token = { kind: "p" | "h" | "v" | "c" | ""; text: string };

const SCENARIOS: Token[][] = [
  [
    { kind: "p", text: "› " },
    { kind: "c", text: "# pipeline scheduled · ops-agent" },
    { kind: "", text: "\n" },
    { kind: "p", text: "› " },
    { kind: "", text: "retrieve(" },
    { kind: "h", text: '"Q3 churn risk"' },
    { kind: "", text: ", scope=" },
    { kind: "v", text: '"30d"' },
    { kind: "", text: ")" },
    { kind: "", text: "\n" },
    { kind: "c", text: "↳ 14 records · vector match · 0.42s" },
    { kind: "", text: "\n" },
    { kind: "p", text: "› " },
    { kind: "", text: "summarize → " },
    { kind: "h", text: "action_plan.md" },
  ],
  [
    { kind: "p", text: "› " },
    { kind: "c", text: "# new ticket · routing" },
    { kind: "", text: "\n" },
    { kind: "p", text: "› " },
    { kind: "", text: "classify(" },
    { kind: "h", text: '"refund_request_4127"' },
    { kind: "", text: ")" },
    { kind: "", text: "\n" },
    { kind: "c", text: "↳ tier=2 · sentiment=neutral · 0.18s" },
    { kind: "", text: "\n" },
    { kind: "p", text: "› " },
    { kind: "", text: "route → " },
    { kind: "h", text: "cs_lead" },
  ],
  [
    { kind: "p", text: "› " },
    { kind: "c", text: "# nightly insight build" },
    { kind: "", text: "\n" },
    { kind: "p", text: "› " },
    { kind: "", text: "aggregate(" },
    { kind: "h", text: '"sales_24h"' },
    { kind: "", text: ")" },
    { kind: "", text: "\n" },
    { kind: "c", text: "↳ 1,420 events · pattern match · 0.61s" },
    { kind: "", text: "\n" },
    { kind: "p", text: "› " },
    { kind: "", text: "digest → " },
    { kind: "h", text: "founder@" },
  ],
];

const KIND_CLASS: Record<Token["kind"], string> = {
  p: "text-[var(--color-electric-cyan)] mr-2",
  h: "text-white",
  v: "text-[#F59E0B]",
  c: "text-[#6B7588]",
  "": "text-[#B7BFCC]",
};

export function AIWorkshop() {
  const [scenarioIdx, setScenarioIdx] = useState(0);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }
    const id = setInterval(() => {
      setScenarioIdx((i) => (i + 1) % SCENARIOS.length);
    }, 5500);
    return () => clearInterval(id);
  }, []);

  const scenario = SCENARIOS[scenarioIdx];

  return (
    <div className="w-full max-w-[620px] flex flex-col gap-3.5">
      {/* Terminal */}
      <Panel head={{ title: "ops-agent · v3", right: "retrieve · summarize · route" }}>
        <div className="px-4.5 py-4 min-h-[130px] font-mono text-[12.5px] leading-[1.85]">
          <div className="whitespace-pre-wrap">
            {scenario.map((tok, i) => (
              <span key={i} className={KIND_CLASS[tok.kind]}>
                {tok.text}
              </span>
            ))}
            <span className="text-[var(--color-electric-cyan)] [animation:services-cursor-blink_0.85s_step-end_infinite] services-anim-cursor-blink">
              ▌
            </span>
          </div>
        </div>
      </Panel>

      {/* Ingest stream */}
      <Panel head={{ title: "ingest · vector store", right: "streaming" }}>
        <div className="px-4 py-3 min-h-[90px]">
          <div className="relative h-[60px] overflow-hidden">
            <div className="services-anim-stream-up [animation:services-stream-up_12s_linear_infinite]">
              {[
                { tag: "CSV", tone: "cyan", file: "customers_2026q3.csv", size: "42KB" },
                { tag: "PDF", tone: "amber", file: "contract_v4_redline.pdf", size: "1.2MB" },
                { tag: "SLACK", tone: "violet", file: "#sales-feedback · 47 msgs", size: "live" },
                { tag: "CRM", tone: "cyan", file: "opportunity_pipeline.json", size: "8KB" },
                { tag: "EMAIL", tone: "amber", file: "reply_drafts/#41-#52", size: "12" },
                { tag: "CSV", tone: "cyan", file: "customers_2026q3.csv", size: "42KB" },
              ].map((row, i) => (
                <StreamRow key={i} {...row} />
              ))}
            </div>
          </div>
        </div>
      </Panel>

      {/* Metrics */}
      <Panel head={{ title: "outcomes", right: "last 30d" }}>
        <div className="px-4.5 py-3.5 grid grid-cols-2 gap-3.5">
          <Metric value="50+ hr" label="Reclaimed / wk" />
          <Metric value="32" label="Agents shipped" />
        </div>
      </Panel>
    </div>
  );
}

function Panel({
  head,
  children,
}: {
  head: { title: string; right: string };
  children: React.ReactNode;
}) {
  return (
    <div className="relative bg-[rgba(8,9,13,0.7)] backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden">
      <div
        aria-hidden
        className="absolute top-0 left-0 right-0 h-px opacity-50"
        style={{
          background:
            "linear-gradient(90deg, transparent, var(--color-electric-cyan), transparent)",
        }}
      />
      <div className="px-3.5 py-2.5 border-b border-white/10 flex items-center gap-2.5 font-mono text-[10px] uppercase tracking-[0.18em] text-[#6B7588]">
        <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-electric-cyan)] [box-shadow:0_0_8px_var(--color-electric-cyan)] [animation:services-pulse-soft_1.4s_ease-in-out_infinite] services-anim-pulse-soft" />
        {head.title}
        <span className="ml-auto">{head.right}</span>
      </div>
      {children}
    </div>
  );
}

function StreamRow({
  tag,
  tone,
  file,
  size,
}: {
  tag: string;
  tone: "cyan" | "amber" | "violet";
  file: string;
  size: string;
}) {
  const toneStyles = {
    cyan: { bg: "rgba(0,240,255,0.14)", color: "#00F0FF" },
    amber: { bg: "rgba(245,158,11,0.14)", color: "#F59E0B" },
    violet: { bg: "rgba(139,92,246,0.16)", color: "#C4B5FD" },
  }[tone];
  return (
    <div className="flex items-center gap-2.5 py-1 font-mono text-[10.5px] text-[#B7BFCC]">
      <span
        className="px-1.5 py-0.5 rounded text-[9px] tracking-[0.12em]"
        style={{ background: toneStyles.bg, color: toneStyles.color }}
      >
        {tag}
      </span>
      <span>{file}</span>
      <span className="ml-auto text-[#6B7588]">{size}</span>
    </div>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div className="border-l-2 border-[var(--color-electric-cyan)] pl-3.5">
      <div className="font-serif italic text-[32px] leading-none tracking-[-0.02em] text-white">
        {value}
      </div>
      <div className="font-mono text-[9.5px] tracking-[0.18em] uppercase text-[#6B7588] mt-1">
        {label}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Lint**

Run: `npm run lint`
Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add src/components/sections/services/visuals/AIWorkshop.tsx
git commit -m "feat(services): AI workshop visual — cycling terminal + ingest + metrics"
```

---

## Task 10: Visual — WebGauge

**Files:**
- Create: `src/components/sections/services/visuals/WebGauge.tsx`

- [ ] **Step 1: Create the file**

```tsx
"use client";

import { useEffect, useRef, useState } from "react";

const ARC_RADIUS = 80;
const ARC_CIRC = 2 * Math.PI * ARC_RADIUS; // ~502.65
const TARGET_PCT = 0.99;
const TARGET_NUM = 99;

export function WebGauge() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = useState(false);
  const [num, setNum] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setInView(true);
            obs.disconnect();
            return;
          }
        }
      },
      { threshold: 0.4 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!inView) return;
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setNum(TARGET_NUM);
      return;
    }
    const start = performance.now();
    const dur = 2200;
    let raf = 0;
    const tick = (t: number) => {
      const k = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - k, 3);
      setNum(Math.round(TARGET_NUM * eased));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView]);

  const offset = inView ? ARC_CIRC * (1 - TARGET_PCT) : ARC_CIRC;

  return (
    <div ref={ref} className="w-full max-w-[540px] flex flex-col gap-7">
      {/* gauge */}
      <div className="relative w-full aspect-square max-w-[360px] mx-auto">
        <svg viewBox="0 0 200 200" className="w-full h-full -rotate-90">
          <defs>
            <linearGradient id="web-gauge-grad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="50%" stopColor="#00F0FF" />
              <stop offset="100%" stopColor="#8B5CF6" />
            </linearGradient>
          </defs>
          <circle
            cx="100"
            cy="100"
            r={ARC_RADIUS}
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="10"
            fill="none"
          />
          <circle
            cx="100"
            cy="100"
            r={ARC_RADIUS}
            stroke="url(#web-gauge-grad)"
            strokeWidth="10"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={ARC_CIRC}
            strokeDashoffset={offset}
            style={{
              transition: "stroke-dashoffset 2.2s cubic-bezier(.2,.7,.2,1) .5s",
              filter: "drop-shadow(0 0 14px rgba(139,92,246,0.5))",
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="font-serif italic text-[96px] leading-none tracking-[-0.04em] text-white">
            {num}
            <span className="text-[48px] text-[#8B5CF6] align-top">+</span>
          </div>
          <div className="font-mono text-[10px] tracking-[0.26em] uppercase text-[#6B7588] mt-3">
            Lighthouse · perf
          </div>
        </div>
      </div>

      {/* perf bars */}
      <div className="flex flex-col gap-3.5">
        <Bar label="LCP" widthPct={88} value="0.92s" delay="1.0s" inView={inView} />
        <Bar label="CLS" widthPct={96} value="0.01" delay="1.2s" inView={inView} />
        <Bar label="FID" widthPct={92} value="12ms" delay="1.4s" inView={inView} />
        <Bar label="TTFB" widthPct={90} value="98ms" delay="1.6s" inView={inView} />
      </div>
    </div>
  );
}

function Bar({
  label,
  widthPct,
  value,
  delay,
  inView,
}: {
  label: string;
  widthPct: number;
  value: string;
  delay: string;
  inView: boolean;
}) {
  return (
    <div className="grid grid-cols-[70px_1fr_60px] gap-4 items-center font-mono text-[11px]">
      <span className="text-[#6B7588] tracking-[0.14em] uppercase">{label}</span>
      <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden relative">
        <div
          className="h-full rounded-full"
          style={{
            width: inView ? `${widthPct}%` : "0%",
            background: "linear-gradient(90deg, #8B5CF6, #C4B5FD)",
            boxShadow: "0 0 12px rgba(139,92,246,0.45)",
            transition: `width 1.6s cubic-bezier(.2,.7,.2,1) ${delay}`,
          }}
        />
      </div>
      <span className="text-white text-right font-medium">{value}</span>
    </div>
  );
}
```

- [ ] **Step 2: Lint**

Run: `npm run lint`
Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add src/components/sections/services/visuals/WebGauge.tsx
git commit -m "feat(services): web gauge visual — sweeping arc + staggered perf bars"
```

---

## Task 11: Visual — MobilePhone

**Files:**
- Create: `src/components/sections/services/visuals/MobilePhone.tsx`

- [ ] **Step 1: Create the file**

```tsx
"use client";

import { useEffect, useRef, useState } from "react";

const FEED_ITEMS = [
  { lines: ["full", "short"] },
  { lines: ["full", "full"] },
  { lines: ["short", "full"] },
  { lines: ["full", "short"] },
  { lines: ["full", "full"] },
  { lines: ["short", "short"] },
  { lines: ["full", "short"] },
  { lines: ["full", "full"] },
];

export function MobilePhone() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setInView(true);
            obs.disconnect();
            return;
          }
        }
      },
      { threshold: 0.25 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  function onMove(e: React.MouseEvent) {
    const el = wrapRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(900px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg)`;
  }
  function onLeave() {
    const el = wrapRef.current;
    if (!el) return;
    el.style.transform = "perspective(900px) rotateY(0) rotateX(0)";
  }

  const specs = [
    { k: "Frame rate", v: "60.0 fps", live: true },
    { k: "Codebase", v: "React Native · 1" },
    { k: "Offline", v: "First-class" },
    { k: "Launch", v: "App Store · ASO" },
    { k: "Scale", v: "0 → 100k users" },
  ];

  return (
    <div
      ref={containerRef}
      className="w-full max-w-[480px] flex items-center gap-8"
      style={{ perspective: "1000px" }}
    >
      <div
        ref={wrapRef}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        className="relative flex-shrink-0 transition-transform duration-[400ms] ease-out"
      >
        <div
          className="w-[200px] h-[380px] rounded-[32px] relative overflow-hidden"
          style={{
            border: "1.5px solid rgba(255,255,255,0.18)",
            background: "linear-gradient(180deg, #0a0d14, #050709)",
            boxShadow:
              "0 40px 80px rgba(16,185,129,0.22), inset 0 0 0 1px rgba(16,185,129,0.08)",
            transformStyle: "preserve-3d",
          }}
        >
          <div
            aria-hidden
            className="absolute top-2 left-1/2 -translate-x-1/2 w-14 h-1.5 rounded-full bg-white/[0.08]"
          />
          <div
            className="mx-2.5 mt-6 h-[calc(100%-36px)] rounded-[22px] overflow-hidden px-2.5 pt-3"
            style={{
              background:
                "linear-gradient(180deg, rgba(16,185,129,0.06) 0%, transparent 30%), #07090C",
            }}
          >
            <div className="flex flex-col gap-2 [animation:services-scroll-feed_18s_linear_infinite] services-anim-scroll-feed">
              {[...FEED_ITEMS, ...FEED_ITEMS].map((item, i) => (
                <FeedItem key={i} lines={item.lines} />
              ))}
            </div>
          </div>
        </div>
        <div
          className="absolute -top-2.5 -right-8 px-3.5 py-1.5 rounded-full font-mono text-[11px] tracking-[0.18em] uppercase backdrop-blur-md inline-flex items-center gap-2"
          style={{
            background: "rgba(16,185,129,0.18)",
            border: "1px solid rgba(16,185,129,0.5)",
            color: "#34D399",
            boxShadow: "0 12px 32px rgba(16,185,129,0.25)",
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full bg-[#34D399] [box-shadow:0_0_10px_#34D399] [animation:services-pulse-soft_1.2s_ease-in-out_infinite] services-anim-pulse-soft"
          />
          60 fps
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-2.5">
        {specs.map((s, i) => (
          <div
            key={s.k}
            className="grid grid-cols-[1fr_auto] gap-4 items-center py-2.5 border-b border-white/10 font-mono text-[11px] transition-all duration-[600ms] ease-out"
            style={{
              opacity: inView ? 1 : 0,
              transform: `translateX(${inView ? 0 : 20}px)`,
              transitionDelay: `${800 + i * 150}ms`,
            }}
          >
            <span className="text-[#6B7588] tracking-[0.14em] uppercase">{s.k}</span>
            <span className="text-white inline-flex items-center">
              {s.live && (
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#34D399] [box-shadow:0_0_8px_#34D399] mr-1.5 [animation:services-pulse-soft_1.4s_ease-in-out_infinite] services-anim-pulse-soft" />
              )}
              {s.v}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function FeedItem({ lines }: { lines: string[] }) {
  return (
    <div className="h-9 rounded-lg flex-shrink-0 bg-white/[0.03] border border-white/[0.04] flex items-center gap-2 px-2">
      <div
        className="w-5.5 h-5.5 rounded-full flex-shrink-0"
        style={{
          width: "22px",
          height: "22px",
          background: "linear-gradient(135deg, #10B981, #059669)",
        }}
      />
      <div className="flex-1 flex flex-col gap-1">
        {lines.map((kind, i) => (
          <div
            key={i}
            className="h-[3px] rounded-full bg-white/10"
            style={{ width: kind === "short" ? "50%" : "100%" }}
          />
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Lint**

Run: `npm run lint`
Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add src/components/sections/services/visuals/MobilePhone.tsx
git commit -m "feat(services): mobile phone visual — looping feed + 3D tilt + spec rows"
```

---

## Task 12: Compose the new `/services/page.tsx`

**Files:**
- Modify: `src/app/services/page.tsx` (replace contents)

- [ ] **Step 1: Replace the entire file with**

```tsx
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { servicesHub } from "@/data/services-hub";
import { ServicesShaderBackground } from "@/components/sections/services/ServicesShaderBackground";
import { ServicesMasthead } from "@/components/sections/services/ServicesMasthead";
import { ServicesAct } from "@/components/sections/services/ServicesAct";
import { ServicesInterlude } from "@/components/sections/services/ServicesInterlude";
import { ServicesColophon } from "@/components/sections/services/ServicesColophon";
import { EcosystemTopology } from "@/components/sections/services/visuals/EcosystemTopology";
import { AIWorkshop } from "@/components/sections/services/visuals/AIWorkshop";
import { WebGauge } from "@/components/sections/services/visuals/WebGauge";
import { MobilePhone } from "@/components/sections/services/visuals/MobilePhone";
import type { ServiceVisual } from "@/data/services-hub";
import type { ReactNode } from "react";

const VISUALS: Record<ServiceVisual, ReactNode> = {
  topology: <EcosystemTopology />,
  workshop: <AIWorkshop />,
  gauge: <WebGauge />,
  phone: <MobilePhone />,
};

export default function ServicesHubPage() {
  // Find the entries by act so we can drop the Interlude between Act II and Act III
  const actI = servicesHub.find((e) => e.act === "I")!;
  const actII = servicesHub.find((e) => e.act === "II")!;
  const actIII = servicesHub.find((e) => e.act === "III")!;
  const actIV = servicesHub.find((e) => e.act === "IV")!;

  return (
    <div className="min-h-screen bg-[var(--color-background,#030408)] text-white flex flex-col">
      <Navbar />
      <ServicesShaderBackground />

      <main className="flex-1 relative z-[2] w-full max-w-[1680px] mx-auto px-[6vw]">
        <ServicesMasthead />

        <ServicesAct entry={actI} visual={VISUALS[actI.visual]} />
        <ServicesAct entry={actII} visual={VISUALS[actII.visual]} />

        <ServicesInterlude />

        <ServicesAct entry={actIII} visual={VISUALS[actIII.visual]} />
        <ServicesAct entry={actIV} visual={VISUALS[actIV.visual]} />

        <ServicesColophon />
      </main>

      <Footer />
    </div>
  );
}
```

- [ ] **Step 2: Lint**

Run: `npm run lint`
Expected: clean.

- [ ] **Step 3: Build**

Run: `npm run build`
Expected: clean. If a hydration warning appears about missing `'use client'` somewhere, recheck Task 7/8/9/10/11 — those files must each start with `"use client";`.

- [ ] **Step 4: Commit**

```bash
git add src/app/services/page.tsx
git commit -m "feat(services): wire new /services hub page (editorial cinematic)"
```

---

## Task 13: Browser verification + reduced-motion check

This task does not produce code; it verifies the running app matches the design.

- [ ] **Step 1: Start dev server**

Run: `npm run dev`
Expected: dev server starts on port 3000.

- [ ] **Step 2: Open http://localhost:3000/services in a browser**

Hard-refresh (Cmd/Ctrl+Shift+R) to dodge any service-worker cache. Open DevTools → Console. Expected: zero errors.

- [ ] **Step 3: Walk through the page and confirm**

Check each item:
- Masthead renders with `What we build, in detail.` — second line gradient cyan→blue→violet.
- Shader is animating in the background (visible iridescent flow).
- **Act I** (Ecosystem): scroll into view → title fades up; topology shows AI=cyan **at the top**, Web=violet **bottom-left**, Mobile=emerald **bottom-right**, amber Ecosystem hub in center; data packets travel along the curves; mousemove over the topology tilts it in 3D.
- **Act II** (AI): terminal cycles through 3 different agent scenarios on a ~5.5s loop; ingest rows scroll vertically.
- **Interlude**: pull-quote between Act II and Act III, with cyan-glowing quote marks.
- **Act III** (Web): gauge arc sweeps from 0 to 99 (~2.2s); centered number ticks `0 → 99` in sync; perf bars draw left-to-right with staggered delays.
- **Act IV** (Mobile): phone feed scrolls forever; mousemove tilts the phone in 3D; spec rows slide in left-to-right with stagger.
- **Colophon**: `Fin.` + signoff + Book a discovery → link to /contact.

If any of these are wrong, file a bug against the offending Task and iterate.

- [ ] **Step 4: Reduced-motion check**

In DevTools → Rendering panel → set `Emulate CSS media feature prefers-reduced-motion` to `reduce`. Hard-reload `/services`.
Expected:
- Count-ups go straight to final values (no animation).
- Gauge arc shows at full 99% immediately on scroll-in.
- Phone feed does NOT scroll.
- Ingest stream does NOT scroll.
- Cursor blink stops.
- Per-act fade-ups still happen (these are reveal-on-scroll, not vestibular).
- The shader keeps running (intentional — see spec).

- [ ] **Step 5: Mobile check**

DevTools → device emulation → iPhone 14 Pro (390×844). Reload `/services`.
Expected: edge-runners hidden, masthead meta-grid stacks, each act stacks **text-above-visual** consistently, phone-stage stacks specs below the phone.

- [ ] **Step 6: Run lint + build one more time before sign-off**

Run: `npm run lint && npm run build`
Expected: both clean.

- [ ] **Step 7: Final cleanup commit (only if anything changed in steps 3-5)**

```bash
git status
# If only verification changes are uncommitted, commit them:
git add -A && git commit -m "fix(services): post-verification adjustments"
```

If everything is clean and there's nothing to commit, this step is a no-op.

---

## Self-review notes (recorded by the plan author)

- **Spec coverage** — every section in the spec has a task: data extraction (T1), keyframes (T2), shader bg (T3), masthead (T4), interlude (T5), colophon (T6), act wrapper with reveal+countup (T7), four visuals (T8-11), page composition (T12), reduced-motion + responsive verification (T13).
- **Out-of-scope items** in the spec (`[slug]` pages, `ecosystem` slug data, `/svc-ecosystem.png`) are not in any task — correct, those are deliberately deferred.
- **Type consistency** — `ServiceHubEntry`, `ServiceVisual`, `ServiceAccent` exported from `services-hub.ts` are used consistently in `ServicesAct` and `page.tsx`. Stat shape is consistent (`{ value, label, count?, suffix? }`).
- **Placeholder scan** — searched the plan for "TBD", "TODO", "implement later", "similar to", "appropriate". None found. Each task has the full code an engineer would type.
- **Verification model** — diverges from the skill's TDD default because the project has no component test framework and CLAUDE.md mandates `lint + build + browser` for UI changes. This is documented in the plan header.
