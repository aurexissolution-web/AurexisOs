# FinalCTA v2 — Live Chat Reveal Redesign

## Context

The current [FinalCTA.tsx](../../../src/components/sections/FinalCTA.tsx) packs **three CTAs into one section**: a hero block (Get a Quote / View all services), a "What we deliver" services list, and a "Not sure where to start?" consultation card with its own primary button. Three distinct calls-to-action means a visitor doesn't know what's primary. The "What we deliver" list is also redundant — it duplicates content already covered by [WhatWeBuild](../../../src/components/sections/WhatWeBuild.tsx) earlier on the page.

User-confirmed direction: **collapse to a single CTA section with a left/right two-column layout.** Left side has the locked CTA copy (eyebrow + headline + subhead + primary WhatsApp button + secondary text link). Right side is a **live animated chat reveal** that types out a real-feeling client conversation in cyan/dark editorial styling — making the section about WhatsApp responsiveness *demonstrate* responsiveness instead of just claiming it.

This sits between FAQ and Footer as the page's terminal action. Goal: visitors arrive at this section knowing exactly one thing to do (WhatsApp), with a secondary fallback (book a call), and a visible proof of the responsiveness promise.

---

## Layout

```
                ────────────────────  (cyan cap line)

┌──────────────────────────────┬───────────────────────────────────┐
│                              │                                   │
│  LET'S START                 │  ● AUREXIS  ·  ONLINE NOW         │
│                              │                                   │
│  Stop paying humans          │  ┌───────────────────────────┐    │
│  to do *machine-level*       │  │ Hey — looking at AI       │    │
│  work.                       │  │ agents for our invoices   │    │
│                              │  └───────────────────────────┘    │
│  Message us on WhatsApp.     │                                   │
│  We reply within 24 hours.   │           ┌──────────────────────┐│
│                              │           │ Got it. Volume per   ││
│  ┌──────────────────────────┐│           │ week?                ││
│  │ Message us on WhatsApp → ││           └──────────────────────┘│
│  └──────────────────────────┘│                                   │
│                              │  ┌──────────────────────┐         │
│  Or book a 30-min discovery  │  │ ~400 invoices,       │         │
│  call →                      │  │ 3 systems            │         │
│                              │  └──────────────────────┘         │
│                              │                                   │
│  ● ONLINE  ·  Avg reply 2.4h │           ● ● ●  (typing dots)    │
│                              │                                   │
└──────────────────────────────┴───────────────────────────────────┘

                ────────────────────  (cyan cap line)
```

Section structure: centered cap line at top, two-column body inside `max-w-6xl`, centered cap line at bottom (matches the FAQ section's editorial frame, keeps the page rhythmic).

Replaces the entire current FinalCTA section. No new sections introduced.

---

## Left side — locked content

### Eyebrow
- Mono caps: `LET'S START`
- Style: `text-[11px] font-semibold uppercase tracking-[0.28em] text-white/40` (matches the eyebrow pattern used in TheArchitecture, FAQ, etc.)

### Headline
- Copy: `Stop paying humans to do *machine-level* work.`
- Italic cyan accent on `machine-level` with the existing serif italic + drop-shadow treatment.
- Style: `text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-[-0.02em] leading-[1.05] text-white text-balance`.

### Subhead
- Copy: `Message us on WhatsApp. We reply within 24 hours.`
- Style: `text-[14px] md:text-[15px] leading-[1.55] text-white/55`.

### Primary CTA — Message us on WhatsApp
- Button label: `Message us on WhatsApp` + arrow.
- Link target: `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}` where:
  - `WHATSAPP_NUMBER` = `process.env.NEXT_PUBLIC_AUREXIS_WHATSAPP || "60123456789"` (reuses the existing pattern from [Calculator.tsx:14–15](../../../src/components/sections/Calculator.tsx)).
  - `msg` = `"Hi Aurexis — I'd like to scope a project. Found you via the homepage."` (concise, contextual, edits-friendly when they receive it).
- `target="_blank" rel="noopener noreferrer"` so it opens WhatsApp Web / mobile WhatsApp without leaving the site tab.
- Visual: cyan-filled rounded pill, with neon-glow shadow. Reuse the existing styling pattern from the current FinalCTA's primary button (lines 58–68 of the current FinalCTA).
- Hover: scale 1.04, glow intensifies. Active: scale 0.97. (Match current pattern.)

### Secondary text link — book a discovery call
- Copy: `Or book a 30-min discovery call →`
- Position: directly below the primary button, smaller text, no button chrome.
- Style: `text-[13px] text-white/55 hover:text-white transition-colors`. Cyan arrow at end with translate-x on hover.
- Link target: `/contact` (the existing contact page already has the discovery call routing). If a Cal.com URL becomes available later, swap the href — no other changes needed.

### Trust strip (left side, below the secondary link)
- Mono caps: `● ONLINE  ·  AVG REPLY 2.4h  ·  NDA + SLA INCLUDED`
- Pulsing cyan dot (`animate-pulse`) for the `●`.
- Style: `text-[10px] font-mono uppercase tracking-[0.22em] text-white/40 flex items-center gap-3`.
- Static-but-confident proof line. Matches the trust-badge pattern in current FinalCTA but condensed to one line.

---

## Right side — live animated chat reveal

A self-contained chat panel that plays a sequential conversation reveal, loops on viewport entry, and pauses on hover. Designed in the site's cyan/dark editorial language — **not** WhatsApp green.

### Panel container
- Outer: `relative flex flex-col gap-3 p-5 lg:p-6 rounded-2xl bg-white/[0.025] border border-white/[0.06] overflow-hidden lg:min-h-[420px]`.
- Subtle ambient cyan radial halo behind the panel (top-right): `absolute -top-8 -right-8 w-72 h-72 rounded-full bg-[var(--color-electric-cyan)]/10 blur-3xl pointer-events-none -z-10`.
- Above the bubbles, a status line: `● AUREXIS · ONLINE NOW` with pulsing cyan dot, mono caps, `mb-2` from first bubble.

### Status header
- `flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.22em] text-white/55`
- Pulsing cyan dot: `w-1.5 h-1.5 rounded-full bg-[var(--color-electric-cyan)] animate-pulse shadow-[0_0_8px_rgba(0,240,255,0.7)]`
- Text: `AUREXIS · ONLINE NOW` (a "Reply within 24h" trust signal sits in left-side trust strip; we don't repeat it here).

### Bubble component
A single inline `Bubble` subcomponent:
- Props: `{ side: "left" | "right"; children: ReactNode; visible: boolean }`.
- **Left bubble** (incoming, customer): `self-start max-w-[80%] px-4 py-3 rounded-2xl rounded-bl-md bg-white/[0.04] border border-white/[0.06] text-[13px] md:text-[14px] text-white/85 leading-[1.5]`.
- **Right bubble** (outgoing, Aurexis): `self-end max-w-[80%] px-4 py-3 rounded-2xl rounded-br-md bg-[var(--color-electric-cyan)]/12 border border-[var(--color-electric-cyan)]/25 text-[13px] md:text-[14px] text-white leading-[1.5]`.
- Enter animation: framer-motion `initial={{ opacity: 0, y: 8, scale: 0.96 }}`, `animate={{ opacity: 1, y: 0, scale: 1 }}`, `transition={{ duration: 0.3, ease: "easeOut" }}`.
- Bubbles render only when `visible === true` (reveal sequencing handled by the parent).

### TypingDots component
A second small subcomponent:
- `<TypingDots side="left" | "right" />`
- Renders three `motion.span` dots that bounce vertically (sequential delays `0`, `0.15s`, `0.3s`, repeat infinitely) — like the 21st chat-interface MessageLoader pattern.
- Same bubble container as a regular bubble (`self-start`/`self-end`, same border + bg) but tighter padding (`px-4 py-2.5`) so it reads as "they're typing."
- Renders only during typing-step phases.

### Conversation script (hard-coded)

```ts
type ChatStep =
  | { kind: "bubble"; side: "left" | "right"; text: string; dwell: number }
  | { kind: "typing"; side: "left" | "right"; duration: number };

const SCRIPT: ChatStep[] = [
  { kind: "bubble", side: "left", text: "Hey — looking at AI agents for our invoice processing", dwell: 1800 },
  { kind: "typing", side: "right", duration: 1200 },
  { kind: "bubble", side: "right", text: "Got it. Volume per week?", dwell: 1500 },
  { kind: "bubble", side: "left", text: "~400 invoices, 3 systems (QuickBooks, Sheets, email)", dwell: 2200 },
  { kind: "typing", side: "right", duration: 1500 },
  { kind: "bubble", side: "right", text: "Doable. 6-week build, RM 35–50k. Want to scope it on a 30-min call?", dwell: 3000 },
];
```

`dwell` = how long this bubble stays visible before the next step begins. `duration` = how long typing dots show.

### Reveal sequencer (parent state machine)

State driven by `stepIndex: number` and the `isInView`/`isHovered` flags. The advance-step `useEffect` runs whenever `stepIndex`, `isInView`, or `isHovered` change.

1. **Trigger**: an `IntersectionObserver` (threshold 0.25) sets `isInView = true` when the panel enters view, `false` when it leaves. While `!isInView` or `isHovered`, no new timers are scheduled — animation effectively pauses while off-screen and while hovered.
2. **First entry**: when `isInView` flips to true and `stepIndex === 0` with empty visible list, the sequencer kicks off step 0.
3. **Per-step behavior**, while `isInView && !isHovered`:
   - If `SCRIPT[i].kind === "bubble"`: add `i` to the visible list. Schedule a timer `setStepIndex(i + 1)` after `dwell` ms.
   - If `SCRIPT[i].kind === "typing"`: render typing dots for the indicated side (no entry in the visible list). Schedule `setStepIndex(i + 1)` after `duration` ms.
4. **Loop**: when `stepIndex >= SCRIPT.length`, hold for `2500ms`, then reset the visible list to `[]` and set `stepIndex = 0`. Continues as long as the section is in view and not hovered.
5. **Hover-pause**: while `isHovered === true`, the scheduled timer is cleared via `clearTimeout` in the effect's cleanup function. When `isHovered` becomes false, the effect re-runs and re-arms the current step's timer from the beginning (simplified resume — "exact resume from the remaining time" is out of scope for v1).
6. **Off-screen pause**: same mechanism as hover-pause, driven by `!isInView`. Coming back into view re-arms the current step.
7. **Reduced motion**: if `useReducedMotion()` returns true, the sequencer is bypassed entirely. The component renders all 4 final-state bubbles statically, no typing dots, no motion. Avoids motion sickness for affected users.

### Bubble overflow / scroll behavior
- Parent panel has `overflow-hidden` and a fixed `lg:min-h-[420px]`. The bubbles flex column with `gap-3`. With 4 bubbles total, content fits within ~400px height comfortably. No internal scroll needed.

### Right side trust footer (below the chat panel, optional)
- Skip for v1 — left side already carries the trust strip. Keeps the right side focused on the chat moment.

---

## Section wrapper + framing

### Section element
- `relative pt-16 pb-20 px-6 bg-[var(--color-background)] overflow-hidden`.
- Removes the current `bg-[#000000]` mismatch (matches the rest of the site).
- Replaces `pt-24 pb-0` with `pt-16 pb-20` for symmetric breathing room (the previous `pb-0` only made sense because three CTAs collapsed to nothing visible at bottom; not the case anymore).

### Container
- `mx-auto max-w-6xl` (matches FAQ + TheArchitecture).

### Cap lines (top + bottom)
- Animated cyan `h-px w-20 mx-auto bg-cyan/60` on `scaleX 0→1` for both top and bottom of the body grid (mirrors FAQ).
- Top cap: delay 0.4s. Bottom cap: delay 0.9s.

### Body grid
- `grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-10 lg:gap-12 items-start mt-10`.
- 50/50 split (not 1.5fr like FAQ — here both sides have similar content density: copy on the left, panel on the right).

### No services list, no second card
- Drop the entire `services` array and the "What we deliver" + "Not sure where to start?" two-column grid (current lines 87–160).
- Drop the imports for icons that won't be used: `Cpu, Globe, Smartphone, TrendingUp, FileText, ShieldCheck, CalendarDays`.
- Keep `ArrowUpRight` (still used in the primary button).

### AnimatedBadge
- Drop the `AnimatedBadge` import + usage entirely. The new layout uses a plain mono eyebrow `LET'S START`, matching FAQ / TheArchitecture, for visual consistency.

---

## State, hooks, accessibility

- `useEffect` for the chat sequencer.
- `useState` for `stepIndex: number`, `visibleSteps: number[]` (set of step indices currently rendered as bubbles), `isHovered: boolean`, `isInView: boolean`.
- `useRef` for the panel element + `IntersectionObserver` setup (single observer, threshold 0.25).
- `useReducedMotion` from framer-motion to drive the static-final-frame fallback.
- Chat panel marked `role="log"` `aria-live="polite"` so screen readers announce new bubbles. The decorative typing dots have `aria-hidden`.
- The conversation is decorative content (not real). Flag the panel with `aria-label="Example client conversation"` so screen-reader users understand it's illustrative.

---

## Implementation file

| File | Action |
|---|---|
| `src/components/sections/FinalCTA.tsx` | Full rewrite: replace entire component body with the new left/right layout + chat reveal subcomponents inlined |

Single-file scope. No new files, no callers touched (still consumed by [src/app/page.tsx:32](../../../src/app/page.tsx) as `<FinalCTA />`).

---

## What's NOT changing

- `<FinalCTA />` import + usage on the home page.
- The site's color tokens, fonts, animation conventions.
- Footer placement (this section sits directly above the existing Footer).
- The Calculator's WhatsApp pattern (we reuse the env var; we don't refactor it).

---

## Mobile behavior

- `< lg`: grid collapses to single column. Left content first (CTA), right content (chat panel) below.
- Chat panel keeps `min-h-[360px]` on mobile (slightly smaller than desktop's 420px) so it doesn't take 80% of viewport height.
- Trust strip on left wraps to two lines if needed (`flex-wrap`).
- Headline scales down naturally with the `text-3xl md:text-4xl lg:text-5xl` tokens.
- Hover-pause is desktop-only (touch devices auto-play continuously, no pause behavior).

---

## Acceptance criteria

1. Section uses the AurexisOS background (`var(--color-background)`), not pure black — no color seam vs. surrounding sections.
2. Single visible CTA per section: the WhatsApp button is the only filled/primary action; the discovery-call link is plainly secondary.
3. Headline italicizes "machine-level" in cyan with drop-shadow.
4. Primary button opens `https://wa.me/${WHATSAPP_NUMBER}?text=...` in a new tab with the prefilled message.
5. Right-side chat panel auto-plays the 6-step script (4 bubbles + 2 typing-dot phases) starting on viewport entry.
6. Chat loops every ~13–14 seconds (sum of dwells + typing durations + 2.5s hold ≈ 13.7s).
7. Hovering the chat panel pauses progression; un-hover resumes.
8. `prefers-reduced-motion: reduce` users see the final static frame (all bubbles, no animation).
9. `AUREXIS · ONLINE NOW` status line shows pulsing cyan dot above the bubbles.
10. Trust strip on left reads `● ONLINE · AVG REPLY 2.4h · NDA + SLA INCLUDED` with pulsing dot.
11. Mobile: layout collapses cleanly to single column with chat panel below the CTA copy. No horizontal overflow at 375px.
12. Top + bottom cyan cap lines animate `scaleX 0→1` on viewport entry.
13. `npm run lint` clean (apart from the pre-existing unrelated `health/route.ts` error). `npm run build` TypeScript phase clean.

---

## Out of scope (do NOT build now)

- Real-time API integration (the chat is hard-coded illustration only).
- A working "agent online/offline" indicator driven by actual availability.
- Time-of-day-aware "ONLINE NOW" gating (e.g., show OFFLINE outside business hours). Current scope: always show ONLINE.
- Multiple alternative scripts that randomize per visit.
- Sound effects for typing/message-delivery.
- Persistent paused-position resume after hover-end (v1 just resumes from current step).
- Replacing the env-var WhatsApp pattern with a config object.
- A real Cal.com booking embed (link to `/contact` for v1; swap href when Cal.com URL exists).

---

## Verification

1. **Lint**: `npm run lint` — clean for `FinalCTA.tsx`.
2. **TypeScript**: `npm run build` — TS phase passes (build may still error at `/api/setup-buckets` due to missing supabase env, unchanged from prior runs).
3. **Browser smoke** (`npm run dev`):
   - Section renders with the section bg matching neighbors (no color step).
   - Headline shows italic cyan "machine-level" with drop-shadow.
   - Top + bottom cyan cap lines animate on scroll into view.
   - Right panel: status line with pulsing dot visible above bubbles.
   - On scroll into view, conversation auto-plays sequentially: bubble 1 → typing dots → bubble 2 → bubble 3 → typing dots → bubble 4 → 2.5s hold → reset and loop.
   - Hover the chat panel mid-conversation: progression pauses. Unhover: resumes.
   - Click "Message us on WhatsApp" → new tab opens to `wa.me/...` with prefilled text.
   - Click "Or book a 30-min discovery call →" → goes to `/contact`.
   - Trust strip on left reads `● ONLINE · AVG REPLY 2.4h · NDA + SLA INCLUDED` with pulsing cyan dot.
   - Resize to mobile (375px): collapses cleanly to single column, chat panel below CTA copy.
4. **Reduced-motion smoke**: in DevTools enable `prefers-reduced-motion: reduce`. Reload. Chat panel should show all 4 final-state bubbles with no animation, no typing dots.
5. **Accessibility check**: tab through the section. Primary button + secondary link both reachable in order. Screen reader announces conversation bubbles as they appear (verify with VoiceOver if available; otherwise visual `role="log"` confirmation is sufficient).

---

## Files to reference while implementing

- **Section structure / cap lines / serif italic accent**: [src/components/sections/FAQSection.tsx](../../../src/components/sections/FAQSection.tsx) — same vocabulary the new CTA will adopt.
- **WhatsApp env-var pattern**: [src/components/sections/Calculator.tsx:14–15, 110–113](../../../src/components/sections/Calculator.tsx).
- **Current button styling reference** (cyan filled pill with neon glow): [src/components/sections/FinalCTA.tsx:58–68](../../../src/components/sections/FinalCTA.tsx).
- **Pulsing dot pattern**: [src/components/sections/FinalCTA.tsx:80](../../../src/components/sections/FinalCTA.tsx) — `<span className="w-2 h-2 rounded-full bg-[#00F0FF] animate-pulse" />`.
- **TypingDots / sequenced reveal pattern reference**: 21st.dev `Chat Interface` (consulted during brainstorming; not a code dependency, only structural inspiration — sequential `setStepIndex` + `setTimeout` approach).

No new dependencies. Uses framer-motion (already imported), lucide-react (already imported), and the site's existing color tokens.
