# TheStack section — The Receipt

**Date:** 2026-04-30
**File:** `src/components/sections/TheStack.tsx` (new)
**Insertion:** [src/app/about/page.tsx](../../../src/app/about/page.tsx) — between `<OurApproach />` and the Mission/Vision/Goals card stack.

---

## Why a "receipt"

The user's content makes an unusual *anti-marketing* claim: "We don't get kickbacks. We're not a reseller." Most agencies bury this kind of statement. We're going to make it the *visual hero* — by rendering the section as a printed thermal receipt with itemized tools and a literal `0 KICKBACKS` line in the totals.

Receipts are intrinsically credible. They're itemized, accountable, anti-marketing. That's the exact tone the copy is striking. The visual treatment reinforces the message.

Three shipped sections above already use the `◆` glyph as a signature (LocationSection postcard stamp, OurApproach pledge). The receipt closes with `◆ SEALED` — making the About page now feel *signed across three sections*.

---

## Layout

Section follows the same frame as LocationSection / OurApproach (ambient orbs, max-w-7xl container, natural padding). Two-part composition:

**Top half** — left-aligned, standard page rhythm:
- Eyebrow chip: `── THE STACK`
- Meta line: `N° 06 · TRUSTED INSTRUMENTS · MY`
- Headline: `Tools we use, not tools we resell.` (serif upright, lg:text-[52px] xl:text-[64px], same scale as Built in Malaysia / In-house. No offshoring.)
- Intro: the user's paragraph in white/65 sans, max-w-prose

**Bottom half** — the Receipt, centered, narrow:
- Container: `mx-auto max-w-2xl` (~672px) — narrow like a real thermal receipt
- Surface: hairline cyan/40 border, subtle glass `bg-white/[0.012]`, backdrop blur, generous internal padding (`p-8 md:p-10 lg:p-12`)
- Mono font (Geist Mono) throughout the receipt body

```
─── THE STACK
N° 06 · TRUSTED INSTRUMENTS · MY

Tools we use, not tools we resell.

We're not a reseller. We don't get kickbacks. These are the tools 
we use because they work — and because they're the right fit for 
Malaysian SMEs at our project sizes.


              ╔═════════════════════════════════╗
              ║      AUREXIS · TECH STACK       ║
              ║   TRUSTED INSTRUMENTS · 2026    ║
              ║ ─────────────────────────────── ║
              ║                                 ║
              ║ 01  ◆ Anthropic Claude          ║
              ║      INTELLIGENCE               ║
              ║      The LLM that powers our    ║
              ║      AI agents.                 ║
              ║ ─────────────────────────────── ║
              ║ 02  ◆ Astro · Next.js           ║
              ║      FRONTEND                   ║
              ║      Websites that score        ║
              ║      Lighthouse 90+.            ║
              ║ ─────────────────────────────── ║
              ║ … 5 more rows …                 ║
              ║ ─────────────────────────────── ║
              ║                                 ║
              ║ TOTAL              7 TOOLS      ║
              ║ RESELLERS                0      ║
              ║ IN-HOUSE              100%      ║
              ║                                 ║
              ║ ─────────────────────────────── ║
              ║                                 ║
              ║      0 KICKBACKS                ║  ← HERO line
              ║                                 ║
              ║ ─────────────────────────────── ║
              ║                                 ║
              ║      ◆ SEALED · MY · 2026       ║
              ╚═════════════════════════════════╝
```

---

## Receipt anatomy in detail

**Header (centered):**
- `AUREXIS · TECH STACK` — mono uppercase, white, `tracking-[0.32em]`
- `TRUSTED INSTRUMENTS · 2026` — mono uppercase, white/40, smaller
- Hairline rule below

**Item row** (7 of these):
- Two columns: number + body
- Number: `01` in mono uppercase white/45, fixed-width column (~3rem)
- Body:
  - Line 1: `◆` (cyan italic serif glyph) + tool name in mono white tracking-[0.04em] (e.g. `Anthropic Claude`)
  - Line 2: role label in mono uppercase cyan/65 tracking-[0.32em] text-[10px] (e.g. `INTELLIGENCE`)
  - Line 3: description in mono white/70, normal case, ~13px, leading-relaxed
- Hairline divider below each item

**Subtotals block** (after items):
- Three rows, label-left + value-right (justify-between, like the existing rituals dl)
- `TOTAL` → `7 TOOLS`
- `RESELLERS` → `0`
- `IN-HOUSE` → `100%`
- All in mono uppercase white/55 (labels) and white/85 (values)

**Hero line `0 KICKBACKS`:**
- Centered horizontally
- Massive: `text-[40px] md:text-[52px] lg:text-[64px]`, mono tabular-nums, white
- The `0` digit is in cyan with a glow (`0 0 12px rgba(0,240,255,0.5)`)
- The word `KICKBACKS` is in white, letter-spaced
- Has 24–32px vertical padding above and below (most prominent line)
- Hairline rule above and below

**Footer signature:**
- Centered: `◆ SEALED · MY · 2026`
- Mono uppercase white/40
- The `◆` in cyan italic serif (same glyph as everywhere else)

---

## Component shape

```tsx
"use client";

import { motion, useReducedMotion } from "framer-motion";

const easeOut = [0.16, 1, 0.3, 1] as const;

interface Tool {
  number: string;
  name: string;
  role: string;
  description: string;
}

const TOOLS: Tool[] = [
  { number: "01", name: "Anthropic Claude",      role: "Intelligence", description: "The LLM that powers our AI agents." },
  { number: "02", name: "Astro · Next.js",       role: "Frontend",     description: "Websites that score Lighthouse 90+." },
  { number: "03", name: "React Native",          role: "Mobile",       description: "Mobile apps for iOS and Android." },
  { number: "04", name: "Cloudflare",            role: "Edge",         description: "Edge hosting, security, CDN." },
  { number: "05", name: "Supabase · PostgreSQL", role: "Data",         description: "Databases that scale." },
  { number: "06", name: "Vercel",                role: "Deploy",       description: "Deployments." },
  { number: "07", name: "WhatsApp Business API", role: "Channel",      description: "Where Malaysian business actually happens." },
];

function ReceiptItem({ tool, index }: { tool: Tool; index: number }) { /* ... */ }
function ReceiptHero() { /* the giant "0 KICKBACKS" line */ }

export function TheStack() {
  const reduceMotion = useReducedMotion();
  const fadeUp = (delay = 0) => /* same util as siblings */;
  return (
    <section className="…py-20 md:py-24 lg:py-16">
      {/* ambient orbs */}
      <div className="container max-w-7xl …">
        {/* eyebrow + meta + headline + intro paragraph */}
        <Receipt /> {/* centered, max-w-2xl */}
      </div>
    </section>
  );
}
```

---

## Reused patterns

- **Eyebrow chip + meta + serif headline** — same classes as [OurApproach.tsx](../../../src/components/sections/OurApproach.tsx).
- **Ambient blur orbs** — same two-orb pattern as LocationSection / OurApproach. Position adjusted to opposite corners again so consecutive sections feel like a continuous atmosphere.
- **`fadeUp` motion variant** — inlined per-file, same shape.
- **`◆` glyph styling** — cyan italic serif, same as every other section that uses it.
- **Section padding** — `py-20 md:py-24 lg:py-16` (matches the new natural-sized cadence we just shifted to).

---

## Vertical budget (one viewport on lg)

- Eyebrow + meta + headline + intro: ~280px
- Receipt: max-h ≈ 720px (varies with content)
  - Header: 60
  - 7 items × ~70px each = 490
  - Subtotals: 80
  - Hero KICKBACKS line: 130
  - Footer signature: 40
- Section padding: 128px (lg:py-16 × 2)

Total: ~1130px.

This **does not fit one viewport** on a 900px laptop. That's OK and intentional — the receipt is a *featured artifact* and reads better when it's slightly tall. The user already accepted dropping the `lg:h-screen` constraint when we reduced the gap. Some scrolling within this section is acceptable for the receipt's impact.

---

## Animation choreography

- Section eyebrow → meta → headline → intro fade up in sequence (60–80ms stagger).
- Receipt fades up as a single block (delay 0.35).
- Each item row staggers in within the receipt (60ms each, delay starts at 0.45).
- Hero `0 KICKBACKS` line: the `0` digit fades in last with a gentle scale-up from 0.9 → 1.0 (700ms).
- `prefers-reduced-motion`: all motion disabled; receipt renders in final state immediately.

---

## Verification

1. `npm run lint` — clean.
2. `npx tsc --noEmit` — clean.
3. `npm run dev` → load `/about`:
   - Scroll past OurApproach. New section appears with same atmospheric language.
   - Headline reads cleanly: "Tools we use, not tools we resell."
   - Intro paragraph wraps nicely at max-w-prose.
   - Receipt is centered, narrow (~672px), feels like a printed document.
   - 7 tools render in order with number, ◆, name, role label, description.
   - Subtotals block reads: TOTAL 7 TOOLS / RESELLERS 0 / IN-HOUSE 100%.
   - `0 KICKBACKS` line is the visual punchline — large, centered, the `0` glows cyan.
   - Footer signature `◆ SEALED · MY · 2026` closes the receipt.
4. Mobile (<lg): receipt collapses to full-width, content stacks; no horizontal overflow.
5. `prefers-reduced-motion`: all fade animations suppressed.
6. Cross-section visual check: ambient orbs match the previous two sections; the `◆` glyph is consistent across LocationSection / OurApproach / TheStack — three signatures, one signature glyph.

---

## Out of scope

- Interactive tool details (no hover-expand, no modal). Each tool's full description is visible on first read.
- Real brand logos (typography only by user direction).
- Animated count-up on the totals (kept static — `0` is `0`, no theatrical reveal beyond a gentle fade).
- Translation / i18n.
- Server-side data — all tool entries are static constants in the file.
