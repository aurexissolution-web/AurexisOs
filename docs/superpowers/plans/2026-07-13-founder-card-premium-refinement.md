# Founder Card Premium Refinement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refine `/sanjay` into a concise, premium founder identity page and eliminate the route’s full-page background/smooth-scroll capture defects.

**Architecture:** Keep the current data-driven founder-card components and real contact wiring. Add one shared route predicate so the chatbot and smooth-scroll provider agree on the `/sanjay` namespace, then refine the existing page, components, and scoped CSS without adding dependencies.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4, Node.js test runner, in-app browser

---

### Task 1: Test and centralize the founder-card route namespace

**Files:**
- Create: `src/lib/founder-card/routes.ts`
- Create: `tests/founder-card-routes.test.mjs`
- Modify: `src/components/ui/chatbot-visibility.ts`
- Modify: `src/components/providers/SmoothScrollProvider.tsx`

- [ ] Write a Node test that imports `isFounderCardRoute` and asserts `true` for `/sanjay` and `/sanjay/example`, and `false` for `/`, `/services`, and `/sanjay-profile`.
- [ ] Run `node --no-warnings --test tests/founder-card-routes.test.mjs` and confirm it fails before the helper exists.
- [ ] Implement:

```ts
export function isFounderCardRoute(pathname: string | null): boolean {
  return pathname === "/sanjay" || pathname?.startsWith("/sanjay/") === true;
}
```

- [ ] Reuse `isFounderCardRoute` inside `shouldHideChatbot`.
- [ ] In `SmoothScrollProvider`, read `usePathname()` and return `children` without `ReactLenis` whenever `isFounderCardRoute(pathname)` is true.
- [ ] Re-run both founder-card route test files and expect all assertions to pass.

### Task 2: Refine the page shell, hero, identity, and actions

**Files:**
- Modify: `src/app/sanjay/page.tsx`
- Modify: `src/components/founder-card/FounderCardBackground.tsx`
- Modify: `src/components/founder-card/BrandHeader.tsx`
- Modify: `src/components/founder-card/Hero.tsx`
- Modify: `src/components/founder-card/FounderProfile.tsx`
- Modify: `src/components/founder-card/PrimaryActions.tsx`
- Modify: `src/app/globals.css`

- [ ] Wrap the route in `.fc-page`, change the main measure to `max-w-[580px]`, use `px-5 sm:px-6`, and tighten the approved section rhythm.
- [ ] Make the background absolute within the full-height page shell with one continuous `#030507` canvas and a static top spotlight.
- [ ] Increase the official header logo to 176–196px depending on viewport.
- [ ] Render the headline as three controlled desktop lines at 56px while retaining natural 38–42px mobile wrapping.
- [ ] Increase the portrait from 96×118px to 110×134px across the mobile/desktop breakpoints, keep the rectangular crop, and add one restrained angular corner signature to the matte founder surface.
- [ ] Replace the cyan-filled booking CTA with a charcoal/off-white treatment, restrained cyan edge, and contained directional icon. Keep WhatsApp and Save Contact as equal 52px secondary actions.

### Task 3: Refine editorial content, trust, contact, and footer

**Files:**
- Modify: `src/components/founder-card/AboutAurexis.tsx`
- Modify: `src/components/founder-card/Capabilities.tsx`
- Modify: `src/components/founder-card/SectionLabel.tsx`
- Modify: `src/components/founder-card/TrustPoints.tsx`
- Modify: `src/components/founder-card/ContactInfo.tsx`
- Modify: `src/components/founder-card/FounderFooter.tsx`

- [ ] Group About Aurexis and Capabilities into one editorial flow with no separate large capability cards.
- [ ] Increase capability title/body readability while retaining numbered rows and hairline dividers.
- [ ] Keep the ownership statement as the only highlighted trust surface and reduce icon stroke weight.
- [ ] Render contact values off-white by default, switch to cyan only on hover/focus, stack on narrow widths, and use two columns from the `sm` breakpoint.
- [ ] Increase footer logo/link/copyright legibility and use a deliberate top divider with the final restrained Aurexis line motif.

### Task 4: Verify, inspect, refine, and capture deliverables

**Files:**
- Create: `artifacts/sanjay-founder-card-mobile-390.png`
- Create: `artifacts/sanjay-founder-card-desktop-1440.png`

- [ ] Run `node --no-warnings --test tests/chatbot-visibility.test.mjs tests/founder-card-routes.test.mjs`.
- [ ] Run `npx eslint src middleware.ts next.config.ts tests/*.mjs`.
- [ ] Run `npm run build` and confirm TypeScript and production compilation exit successfully.
- [ ] Start `npm run dev`, inspect 320, 375, 390, 430, 768, and 1440px widths, and confirm no overflow or background seam.
- [ ] Verify the booking, WhatsApp, vCard, email, website, LinkedIn, and privacy hrefs against `founderCard`.
- [ ] Check browser console errors and keyboard focus order.
- [ ] Save full-page screenshots at 390px and 1440px, review them, and refine once if the portrait, CTA, headline wrap, desktop measure, contact legibility, or cyan balance misses the brief.

