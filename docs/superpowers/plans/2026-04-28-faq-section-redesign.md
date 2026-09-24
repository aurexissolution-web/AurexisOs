# FAQ Section Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restructure the homepage FAQ section into a top-band header + 2-column card grid + centered bottom CTA, replacing the empty-feeling sticky-left layout.

**Architecture:** Single-file refactor of [src/components/sections/FAQSection.tsx](../../../src/components/sections/FAQSection.tsx). Replace the `[1fr_1.5fr]` left/right CSS grid with a vertical flow. Preserve all state logic, framer-motion `AnimatePresence` reflow, and category filter behavior — only the JSX shape and Tailwind classes change. Each FAQ becomes an `align-items: start` grid card; an opened card expands in place without stretching its row sibling.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind 4, framer-motion (already in use), lucide-react icons (already in use).

**Verification approach:** Pure visual/structural refactor with unchanged behavior. TDD via component tests skipped — no testing infrastructure in this project, and behavior contracts (filter, open/close, reset on category switch) are unchanged. Verification per task = ESLint clean + production build clean + manual browser smoke per the spec's acceptance criteria.

**Commit policy:** Per CLAUDE.md, do NOT commit unless the user explicitly asks. Plan steps describe staging-ready work; treat each task's "checkpoint" as a stopping point where the user can review + decide whether to commit.

**Spec reference:** [docs/superpowers/specs/2026-04-28-faq-section-redesign-design.md](../specs/2026-04-28-faq-section-redesign-design.md)

---

## File Map

| File | Action | Why |
|---|---|---|
| `src/components/sections/FAQSection.tsx` | Modify (full re-render of return JSX + helper additions) | The component being redesigned |

No new files. No changes to imports, exports, or the FAQ data array. No callers touched (homepage assembly is unaffected because the component's name and props stay identical — it's a no-arg component).

---

## Task 1: Restructure layout to vertical flow with collapsed-state cards

**Files:**
- Modify: `src/components/sections/FAQSection.tsx` — replace the `return (...)` JSX (currently lines 123–237) and add a small category-label helper.

**Outcome:** Header band sits above a 2-column grid of compact cards. Cards visually look right in their default (collapsed) state — Q.0X label, category chip, question text, cyan plus icon. No interactive states yet (no hover lift, no open-state styling). Existing open/close + filter logic still wired so clicking a card still toggles the answer (using the current expanded panel rendering — we'll move it into the card in Task 2).

- [ ] **Step 1: Add the category-label helper above the component**

Insert this constant immediately after the `categories` array (after line 98 in the current file):

```tsx
const categoryLabels: Record<Exclude<Category, "all">, string> = {
  ai: "AI",
  web: "WEB",
  app: "APP",
  ecosystem: "ECOSYSTEM",
};
```

This drives the per-card category chip text. `Exclude<Category, "all">` is reused from the existing `FAQ` type, so TypeScript ensures every concrete category gets a label.

- [ ] **Step 2: Replace the entire `return (...)` block**

Replace the JSX inside `FAQSection` (currently lines 123–237) with the following. Keep all hooks (`useState`, `visibleFaqs`, `toggle`, `selectCategory`) and the `motion`/`AnimatePresence` imports unchanged.

```tsx
return (
  <section className="bg-[var(--color-background)] pt-8 pb-16 px-6">
    <div className="mx-auto max-w-7xl">
      {/* Header band */}
      <motion.div
        className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-10 lg:mb-14"
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-2xl">
          <span className="inline-block text-[11px] font-semibold uppercase tracking-[0.28em] text-white/40 mb-4">
            Frequently Asked
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-[-0.02em] leading-[1.05] text-white text-balance mb-4">
            <em
              className="font-serif italic text-[var(--color-electric-cyan)] font-normal"
              style={{ filter: "drop-shadow(0 0 18px rgba(0,240,255,0.32))" }}
            >
              Honest
            </em>{" "}
            answers. No marketing fluff.
          </h2>
          <p className="text-[15px] leading-[1.6] text-white/55 mb-6">
            Filter by what you&apos;re here to solve.
          </p>

          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => selectCategory(cat.id)}
                  aria-pressed={isActive}
                  className={`px-4 py-2 rounded-full text-[11px] font-mono uppercase tracking-[0.22em] border transition-colors ${
                    isActive
                      ? "bg-[var(--color-electric-cyan)]/15 border-[var(--color-electric-cyan)]/45 text-white"
                      : "bg-white/[0.03] border-white/[0.08] text-white/55 hover:text-white/85 hover:border-white/[0.15]"
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Meta counter — desktop only, top-right of band */}
        <div className="hidden lg:block pt-1">
          <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-white/40">
            {faqs.length} Questions · {categories.length - 1} Categories
          </span>
        </div>
      </motion.div>

      {/* Card grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
        <AnimatePresence mode="popLayout" initial={false}>
          {visibleFaqs.map((faq, i) => {
            const isOpen = openIds.has(faq.id);
            return (
              <motion.div
                key={faq.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                className="relative rounded-xl border border-white/[0.06] bg-white/[0.025]"
              >
                <button
                  type="button"
                  onClick={() => toggle(faq.id)}
                  aria-expanded={isOpen}
                  className="group w-full text-left p-5 flex flex-col gap-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-white/45">
                      Q.{String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/55 border border-white/[0.08] bg-white/[0.02] px-2 py-0.5 rounded-full">
                      {categoryLabels[faq.category]}
                    </span>
                  </div>
                  <p className="text-[15px] md:text-base font-medium text-white/85 leading-snug pr-8">
                    {faq.q}
                  </p>
                  <Plus
                    className="absolute bottom-4 right-4 w-4 h-4 text-[var(--color-electric-cyan)] transition-transform duration-200"
                    style={{ transform: isOpen ? "rotate(45deg)" : "rotate(0)" }}
                  />
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22, ease: "easeOut" }}
                      style={{ overflow: "hidden" }}
                    >
                      <div className="px-5 pb-5">
                        <div className="border-l-2 border-[var(--color-electric-cyan)]/40 pl-4 py-3 bg-white/[0.02] rounded-r-md">
                          <p className="text-[14px] md:text-[15px] leading-[1.65] text-white/65">
                            {faq.a}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Bottom CTA */}
      <div className="mt-12 flex justify-center">
        <Link
          href="/contact"
          className="group inline-flex items-center gap-2 text-[15px] text-white/55 hover:text-white transition-colors"
        >
          Still have questions? Talk to us
          <ArrowRight className="w-4 h-4 text-[var(--color-electric-cyan)] transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  </section>
);
```

Key things to verify in the diff:
- The outer `<section>` `bg`, `pt`, `pb`, `px` classes are unchanged.
- `mx-auto max-w-7xl` container preserved — just dropped the inner CSS grid, replaced with vertical flow.
- All hooks and helper functions (`toggle`, `selectCategory`, `visibleFaqs`) are untouched.
- `AnimatePresence mode="popLayout"` still wraps the card list, so category-switch reflow still animates.
- `categoryLabels[faq.category]` is the new chip text. `categories.length - 1` excludes "all" from the meta counter.
- The card uses `<motion.div className="relative ..."><button>...<Plus className="absolute bottom-4 right-4">...</button>...</motion.div>` — the Plus is absolute-positioned inside the card so it sits in the bottom-right corner regardless of question length.

- [ ] **Step 3: Run lint to confirm no syntax errors**

Run: `npm run lint`
Expected: clean exit (0 errors related to FAQSection.tsx). Existing warnings elsewhere in the repo are not introduced by this change.

- [ ] **Step 4: Run a build to confirm types compile**

Run: `npm run build`
Expected: build succeeds. `Record<Exclude<Category, "all">, string>` will fail typecheck if any new category is added without a matching label — that's the desired guardrail.

- [ ] **Step 5: Manual browser smoke (collapsed state)**

Run `npm run dev` if not already running, open the homepage, scroll to the FAQ section. Verify visually:
- Header band is full-width with eyebrow → headline → sub → category pills stacked left-aligned, and `12 Questions · 4 Categories` mono text floating top-right on `lg+` viewports.
- Cards render in 2 columns on `md+`, single column on mobile.
- Each card shows: `Q.0X` top-left, category chip top-right, question text in the middle, cyan `+` icon bottom-right.
- Clicking a category pill still filters and resets open cards (existing behavior — sanity-check).
- Clicking a card still toggles the answer below it (the answer renders in its existing styling — we polish the open state in Task 2).
- The section roughly fits one viewport on a 1280×800 window.

- [ ] **Step 6: Checkpoint — pause for user review**

Show the user the homepage at this point if possible. Do not commit (per CLAUDE.md). Wait for confirmation before moving to Task 2.

---

## Task 2: Add hover and open-state visual differentiation

**Files:**
- Modify: `src/components/sections/FAQSection.tsx` — extend the card's outer `className` (conditional on `isOpen`) and add a `group-hover:scale-110` to the Plus icon.

**Outcome:** Hover lifts the card slightly and brightens the border; opening a card paints a soft cyan border + outer glow, making it visually distinct from its neighbors. The button's existing `group` class is what wires the plus-icon hover scale — no other button changes needed. No new behavior — only Tailwind class changes on conditional render.

- [ ] **Step 1: Update the card's outer `motion.div` className to include hover + open states**

Locate the card `motion.div` from Task 1, currently:

```tsx
className="relative rounded-xl border border-white/[0.06] bg-white/[0.025]"
```

Replace with:

```tsx
className={`relative rounded-xl border bg-white/[0.025] transition-all duration-200 ease-out ${
  isOpen
    ? "border-[var(--color-electric-cyan)]/30 shadow-[0_0_60px_-20px_rgba(0,240,255,0.25)]"
    : "border-white/[0.06] hover:border-white/[0.14] hover:bg-white/[0.04] hover:-translate-y-0.5"
}`}
```

What this does:
- Open state: cyan-tinted border at 30% alpha + outer glow shadow, no hover effects (hover branch skipped).
- Closed state: hover brightens border, lifts card by 2px, slightly increases bg.
- `transition-all duration-200 ease-out` smooths both branches.

- [ ] **Step 2: Polish the Plus icon hover scale**

The inner `<button>` already has the `group` class from Task 1 — no change needed there.

Locate the `<Plus>` element. Update its className from:

```tsx
className="absolute bottom-4 right-4 w-4 h-4 text-[var(--color-electric-cyan)] transition-transform duration-200"
```

to:

```tsx
className="absolute bottom-4 right-4 w-4 h-4 text-[var(--color-electric-cyan)] transition-transform duration-200 group-hover:scale-110"
```

The `group-hover:scale-110` ties to the button's `group` class, so the plus pops slightly when hovering anywhere on the card.

- [ ] **Step 3: Run lint and build**

Run: `npm run lint && npm run build`
Expected: clean.

- [ ] **Step 4: Manual browser smoke (interactive states)**

In the browser:
- Hover an unopened card → border brightens, card lifts ~2px, bg darkens slightly, plus icon scales up.
- Click a card to open → cyan border, soft outer glow, plus rotates 45° (existing inline-style behavior preserved).
- Card to its right (same row) does NOT stretch to match the open card's height — confirms `align-items: start` is working from Task 1's `items-start` class on the grid.
- Hover an open card → no lift (hover branch is conditionally suppressed when open), still feels stable.
- Filter by category, open one card, switch category → opens cleared, glow gone, layout reflows smoothly.

- [ ] **Step 5: Checkpoint — pause for user review**

Show the user. Do not commit.

---

## Task 3: Header polish — meta counter responsive treatment + headline final pass

**Files:**
- Modify: `src/components/sections/FAQSection.tsx` — small additions inside the header band.

**Outcome:** Header band reads as deliberately editorial. The meta counter on desktop matches the headline visually; on mobile it's hidden so the band stays compact. Optional subtle dot-grid background applied to the band only.

- [ ] **Step 1: Confirm meta counter copy reads right**

The meta counter in Task 1 outputs `12 Questions · 4 Categories`. Verify in the browser this is the expected wording. If the user prefers different copy (e.g. `12 ASKED · 4 CATEGORIES` or `4 categories · 12 answers`), edit the string literal in:

```tsx
{faqs.length} Questions · {categories.length - 1} Categories
```

If no change requested, leave as-is and proceed.

- [ ] **Step 2: Add subtle dot-grid background pattern behind the header band**

Locate the header band's outer `motion.div` (the one with `flex flex-col lg:flex-row` from Task 1). Add an inline `style` prop with the dot pattern (cleaner and more robust than packing nested commas/parens into a Tailwind arbitrary value):

From:
```tsx
<motion.div
  className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-10 lg:mb-14"
  initial={{ opacity: 0, y: 12 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, margin: "-100px" }}
  transition={{ duration: 0.5 }}
>
```

To:
```tsx
<motion.div
  className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-10 lg:mb-14"
  style={{
    backgroundImage:
      "radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)",
    backgroundSize: "18px 18px",
  }}
  initial={{ opacity: 0, y: 12 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, margin: "-100px" }}
  transition={{ duration: 0.5 }}
>
```

Why this works:
- `radial-gradient` paints a 1px dot at 4% white alpha on a transparent background; `background-size: 18px 18px` tiles it across the band.
- The 4% alpha is already the "whisper-quiet" intensity — no separate `opacity` modifier needed.
- The band has no other background color, so the pattern shows over the section's `bg-[var(--color-background)]`.
- Content (eyebrow, headline, sub, pills, meta counter) renders on top in normal flow — no z-index manipulation required.

If after browser verification this conflicts visually (e.g. competes with the headline glow, or muddies on certain monitor calibrations), remove the `style` prop entirely — the spec marked the dot pattern as "Skip if it visually conflicts."

- [ ] **Step 3: Run lint and build**

Run: `npm run lint && npm run build`
Expected: clean.

- [ ] **Step 4: Manual browser smoke (header polish)**

In the browser:
- Header band shows the dot grid faintly behind the eyebrow / headline / sub / pills cluster.
- Meta counter renders top-right on `lg+` viewports, hidden below `lg` (`hidden lg:block` from Task 1).
- Resize window from 1440px → 768px → 375px:
  - At `lg+`: horizontal layout with meta counter visible.
  - At `md`: title cluster stacks above the (still 2-column) card grid; meta counter hidden.
  - At mobile: everything single-column, comfortable spacing.
- Cards never overflow horizontally on any viewport.

- [ ] **Step 5: Checkpoint — pause for user review**

Show the user. Particularly ask: keep the dot-grid background, or remove it?

---

## Task 4: Stagger entrance animation

**Files:**
- Modify: `src/components/sections/FAQSection.tsx` — add per-card delay to the existing `motion.div` `transition` prop.

**Outcome:** Cards fade up sequentially when the section enters the viewport on first load — adds polish without distracting on category switches (where reflow uses a different motion path through `AnimatePresence`).

- [ ] **Step 1: Switch from `animate` to `whileInView` with staggered delay**

Locate the card `motion.div` from Task 1/2. Currently:

```tsx
<motion.div
  key={faq.id}
  layout
  initial={{ opacity: 0, y: 8 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -4 }}
  transition={{ duration: 0.22, ease: "easeOut" }}
  className={...}
>
```

Replace with:

```tsx
<motion.div
  key={faq.id}
  layout
  initial={{ opacity: 0, y: 8 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -4 }}
  transition={{
    duration: 0.4,
    delay: Math.min(i, 10) * 0.03,
    ease: "easeOut",
  }}
  className={...}
>
```

Why `Math.min(i, 10)`:
- Caps the stagger delay at 300ms so the last card never feels disconnected.
- With 12 questions, the delay ramps `0ms → 300ms` across the first 11 cards, then the 12th matches.

Note: We keep `animate` (not `whileInView`) because the card list is part of an `AnimatePresence` block. `AnimatePresence` already handles entry/exit via `initial`/`animate`/`exit` — adding `whileInView` would conflict and double-fire animations on category switch. The first-load stagger via `delay` is sufficient.

- [ ] **Step 2: Run lint and build**

Run: `npm run lint && npm run build`
Expected: clean.

- [ ] **Step 3: Manual browser smoke (entrance + filter)**

In the browser:
- Hard refresh, scroll to FAQ section. Cards fade-up in sequence with a visible (but subtle) ripple from top-left to bottom-right.
- Click a category to filter. Cards reflow via `AnimatePresence mode="popLayout"` — no double-staggered re-entry; existing exit/enter runs cleanly because `delay` only applies on initial mount per key.
- Open and close cards — no entrance animation re-triggers (only the answer panel animates, which is a separate `AnimatePresence`).

- [ ] **Step 4: Checkpoint — pause for user review**

Show the user. If the stagger feels too fast / too slow, tweak `0.03` to `0.04` or `0.025`.

---

## Task 5: Final verification

**Files:**
- None (verification-only).

**Outcome:** All acceptance criteria from the spec are met; lint + build are clean; the homepage feels right.

- [ ] **Step 1: Full lint pass**

Run: `npm run lint`
Expected: zero new errors or warnings introduced by `FAQSection.tsx`.

- [ ] **Step 2: Full production build**

Run: `npm run build`
Expected: build succeeds, no type errors, no missing dependencies. The `/` route emits HTML that includes the redesigned FAQ section.

- [ ] **Step 3: Manual browser smoke against spec acceptance criteria**

Open `npm run dev` at the homepage. Verify each item from the spec's acceptance criteria block:

1. [ ] Section visually fits within ~860px on a 1280×800 desktop viewport.
2. [ ] No empty visual region below the title cluster — grid fills horizontal space.
3. [ ] Category chooser still works (state, reset on switch, active styling).
4. [ ] Each FAQ card is clickable as a single button; clicking expands the answer in place inside the card.
5. [ ] Opening one card in a row does not stretch its sibling card.
6. [ ] Stagger animation on viewport enter; smooth reflow on category change.
7. [ ] Hover state visibly differentiates an unfocused card from a focused one (border, lift, glow).
8. [ ] Open card visibly differentiates from a hovered-but-closed card (cyan border, outer glow).
9. [ ] Mobile collapses cleanly to a single column with no horizontal overflow.
10. [ ] Manual smoke: filter through each category, open/close at least 3 cards, resize from 1440→375px.

- [ ] **Step 4: Report any failures**

If any acceptance check fails, add a specific note about which step in which task needs revision and stop. Do not paper over with hacky CSS.

- [ ] **Step 5: Final checkpoint — show user the finished section**

Summarize: what changed, screenshot/describe each viewport behavior, list any spec items deferred. Wait for user approval before committing.

- [ ] **Step 6: Commit (only if user explicitly says to commit)**

If and only if the user says "commit" or similar:

```bash
git add src/components/sections/FAQSection.tsx docs/superpowers/specs/2026-04-28-faq-section-redesign-design.md docs/superpowers/plans/2026-04-28-faq-section-redesign.md
git commit -m "refactor(faq): redesign section to top-band header + 2-column card grid

Replaces the [1fr_1.5fr] sticky-left layout with a vertical flow:
header band → 2-column card grid → centered CTA. Each FAQ becomes
an align-items:start card so opening one doesn't stretch its sibling.
Adds meta counter, stagger entrance, hover lift, and cyan open-state glow.
Behavior (filter, toggle, reset on switch) unchanged."
```

If the user does not explicitly request a commit, leave the work staged for them to review and commit themselves.
