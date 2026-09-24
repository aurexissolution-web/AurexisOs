# Cinematic Founder Card Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild `/sanjay` to pixel-match the supplied premium cinematic founder-card reference while preserving real contact data and working actions.

**Architecture:** Keep the App Router page and centralized founder data, but replace the presentation with focused founder-card components: an integrated hero, action group, responsive capabilities, ownership panel, connect section, and footer. Use Tailwind utilities for layout and a scoped `.fc-*` CSS layer for the reference-specific atmosphere, portrait masking, typography, and responsive art direction.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4, `next/image`, Lucide icons, Node test runner.

---

### Task 1: Lock the composition contract

**Files:**
- Create: `tests/founder-card-composition.test.mjs`
- Modify: `src/app/sanjay/page.tsx`

- [ ] Write a test that reads the page source and requires `FounderHero`, `OwnershipPanel`, and `ConnectSection`, while rejecting the former centred `Hero`, `FounderProfile`, `AboutAurexis`, and `TrustPoints` composition.
- [ ] Run `node --test tests/founder-card-composition.test.mjs` and confirm it fails because the new composition is absent.
- [ ] Replace the page component tree with the approved hero → capabilities → ownership → connect → footer order while retaining metadata and JSON-LD.
- [ ] Re-run the test and confirm it passes.

### Task 2: Build the cinematic hero and actions

**Files:**
- Create: `src/components/founder-card/FounderHero.tsx`
- Modify: `src/components/founder-card/PrimaryActions.tsx`
- Modify: `src/components/founder-card/FounderCardBackground.tsx`

- [ ] Implement the desktop split hero and mobile portrait-first order using the existing logo, portrait, founder data, and exact reference copy.
- [ ] Restyle the primary CTA as the single controlled cyan gradient and secondary actions as equal dark bordered controls.
- [ ] Add the quiet background light, vignette, grain, and two restrained angular motif uses.
- [ ] Run the composition and existing route tests.

### Task 3: Build the lower editorial sections

**Files:**
- Modify: `src/components/founder-card/Capabilities.tsx`
- Create: `src/components/founder-card/OwnershipPanel.tsx`
- Create: `src/components/founder-card/ConnectSection.tsx`
- Modify: `src/components/founder-card/SectionLabel.tsx`
- Modify: `src/components/founder-card/FounderFooter.tsx`

- [ ] Render exactly three capabilities as unboxed columns above 768px and a divided icon list below 768px.
- [ ] Render one premium ownership panel with the exact ownership and support copy.
- [ ] Render four compact linked contact items plus location and service area using the existing URLs.
- [ ] Match the compact logo/website/privacy/copyright footer from the reference.
- [ ] Run focused ESLint and the test suite.

### Task 4: Match the reference styling

**Files:**
- Modify: `src/app/globals.css`
- Modify: `src/app/layout.tsx`

- [ ] Replace the previous `.fc-*` rules with the approved palette, 1260px desktop composition, serif display typography, portrait masks, separators, focus states, and reduced-motion rules.
- [ ] Add a normal Instrument Serif variable through the existing Next.js font-loading method without changing unrelated page markup.
- [ ] Check 320, 375, 390, 430, 768, 1024, and 1440px for overflow, wrapping, tap-target size, and portrait crop.

### Task 5: Visual refinement and production verification

**Files:**
- Create: `artifacts/sanjay-cinematic-mobile-390.png`
- Create: `artifacts/sanjay-cinematic-desktop-1440.png`

- [ ] Capture 390px and 1440px screenshots, list the five largest mismatches against the supplied mockup, and correct them.
- [ ] Repeat the comparison once more and correct any remaining obvious differences in layout, scale, spacing, hierarchy, portrait treatment, and cyan usage.
- [ ] Verify the booking, WhatsApp, VCF, email, website, LinkedIn, and privacy actions plus keyboard focus and console output.
- [ ] Run `npm run lint`, `npx tsc --noEmit`, and `npm run build`; distinguish any unrelated repository-wide lint failures from focused results.
- [ ] Capture final screenshots from the production build and retain the production preview URL or exact command.
