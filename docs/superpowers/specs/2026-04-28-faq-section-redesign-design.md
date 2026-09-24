# FAQ Section Redesign

**File touched:** [src/components/sections/FAQSection.tsx](../../../src/components/sections/FAQSection.tsx)
**Date:** 2026-04-28
**Status:** Approved by user, ready for implementation plan

---

## Problem

The current FAQ section has three structural issues:

1. **Vertical imbalance** — left column ends at ~600px while right column runs to ~1100px (12 questions × ~75px each). The sticky left column floats with empty black space below it during the lower half of the scroll.
2. **Density mismatch** — single-column list of 12 questions reads as a support page, not a marketing surface. Premium product FAQs typically show 4–6 high-signal questions or compact them visually.
3. **No visual anchor** — pure text + thin dividers + small `Q.0X` mono labels read as "documentation," not "premium."

User feedback: *"section doesn't fit in one page and it looks a bit empty. Make it premium and aesthetic. Keep the category chooser."*

---

## Design

Replace the `[1fr_1.5fr]` left/right split with a **vertical flow** of three blocks:

1. Full-width **header band** (eyebrow, headline, sub, category pills, meta counter)
2. Full-width **2-column card grid** for questions
3. Centered **bottom CTA** ("Still have questions? → Talk to us")

### Why this works

- 12 cards in a 2-column grid become 6 rows ≈ 480px, vs. today's ~900px.
- Header band ≈ 280px. Total section ≈ 860px — close to one viewport on a 1080p screen.
- Eye flows top → grid → CTA. No floating sticky column with nothing under it.
- Cards introduce the visual rhythm and depth that "premium" requires; dividers don't carry that weight.

---

## Block 1 — Header band

Full width, contained by `max-w-7xl mx-auto`. Layout on desktop: title cluster (eyebrow + headline + sub + pills) left-aligned in the band; meta counter top-right, vertically aligned with the eyebrow row. On mobile: everything stacks left-aligned, meta counter hidden.

**Eyebrow:** `FREQUENTLY ASKED` — same mono uppercase tracking-wide treatment as today.

**Headline:** Same wording — "*Honest* answers. No marketing fluff." Italic cyan accent on "Honest" preserved (current `drop-shadow` glow stays). Scale up to `text-4xl md:text-5xl lg:text-6xl` and tighten leading.

**Sub:** Trim from current copy to `Filter by what you're here to solve.` — drop "Click any question to expand" because the cards visually invite the click on their own.

**Category pills:** Same styling as today (cyan-tinted active state, ghost inactive). Row gap `gap-2`, wraps on small screens. Position: directly below sub, left-aligned.

**Meta counter:** New element. Top-right of the band on desktop: `12 Questions · 4 Categories` in `font-mono text-[11px] uppercase tracking-[0.22em] text-white/40`. Adds editorial flourish, fills horizontal whitespace on the right of the headline.

**Background detail:** Optional very-low-opacity dot grid pattern behind the band only (not the card grid). Pure cosmetic, makes the band feel intentional. Achievable with a CSS background-image of `radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)` at small repeat. Skip if it visually conflicts.

---

## Block 2 — 2-column card grid

`grid grid-cols-1 md:grid-cols-2 gap-4` with `align-items: start`. The `align-items: start` is critical: when one card opens in a row, its sibling stays at the top of the row instead of stretching to match height — preserves clean rhythm.

### Card — collapsed state

```
┌────────────────────────────────────┐
│ Q.01                       [AI]    │  ← top row: index + category chip
│                                    │
│ Which workflows can AI agents      │  ← question (text-[15px], font-medium, white/85)
│ actually replace?                  │
│                                    │
│                              [+]   │  ← cyan plus icon, bottom-right
└────────────────────────────────────┘
```

**Container:**
- `bg-white/[0.025]`
- `border border-white/[0.06]`
- `rounded-xl`
- `p-5`
- Click target = full card (button)

**Q.0X label:** Mono, `text-[11px]`, `tracking-[0.22em]`, `text-white/45`. Renumbers based on filtered list (matches current behavior).

**Category chip:** Tiny pill, top-right. `text-[10px]`, mono uppercase, `tracking-[0.18em]`, `text-white/55`, `border border-white/[0.08]`, `bg-white/[0.02]`, `px-2 py-0.5 rounded-full`. Labels: `AI`, `WEB`, `APP`, `ECOSYSTEM`. Always visible, including when "All" filter is active — that's where it earns its keep, hinting at category in the unfiltered view.

**Question text:** `text-[15px] md:text-base font-medium text-white/85 leading-snug`. ~3 lines max for the longest current question.

**Plus icon:** Cyan, `w-4 h-4`, bottom-right, absolute-positioned in card. Hairline stroke. Rotates 45° when card is open (current behavior preserved).

### Card — hover

- Border: `border-white/[0.14]`
- Subtle radial glow from top-left: `before:` pseudo-element with `radial-gradient` at 0% 0%, cyan at ~8% intensity, fading. Or simpler: `bg-white/[0.04]` on hover.
- Lift: `-translate-y-0.5`
- Plus icon: `scale-105`
- Transition: `transition-all duration-200 ease-out`

### Card — open

- Border: `border-cyan/30` (use `var(--color-electric-cyan)` token at ~30% alpha)
- Outer glow: `shadow-[0_0_60px_-20px_rgba(0,240,255,0.25)]`
- Plus icon: rotate 45° (current behavior, stays cyan)
- Answer panel below question text:
  - Margin-top `mt-4`
  - Thin cyan left rule: `border-l-2 border-[var(--color-electric-cyan)]/40 pl-4`
  - Subtle background tint: `bg-white/[0.02] rounded-r-md py-3`
  - Answer text: `text-[14px] md:text-[15px] leading-[1.65] text-white/65`
  - This matches the current expanded answer styling — just lifted into the card.
- Open animation: height + opacity, 220ms easeOut (current values preserved).

### Stagger entrance

Each card fades up with delay `i * 30ms` on viewport enter, capped at ~10 (so the last cards still feel responsive). Use `motion.div` with `initial={{ opacity: 0, y: 8 }}`, `whileInView={{ opacity: 1, y: 0 }}`, `viewport={{ once: true, margin: "-50px" }}`, `transition={{ duration: 0.4, delay: Math.min(i, 10) * 0.03 }}`.

### Category switch

Use `AnimatePresence mode="popLayout"` (already in place) so cards reflow smoothly when filter changes. Reset `openIds` on category switch (current behavior preserved).

---

## Block 3 — Bottom CTA

Centered below the grid, with breathing room above (`mt-12`).

```
        Still have questions? → Talk to us
```

- Anchor link to `/contact`
- `text-[15px] text-white/55`, hover `text-white`
- Cyan `ArrowRight` icon (`w-4 h-4`)
- Hover: arrow translates `+0.5` on x-axis (current behavior preserved)
- Slightly larger and more centered than today; this is the section's terminal action.

---

## What's NOT changing

- Category filter logic, state machine, `selectCategory` reset behavior
- Question content (`faqs` array)
- Open/close mechanics, `AnimatePresence`, expanded answer styling
- Color system — stays cyan-mono. No per-category color coding (would feel off-brand vs. rest of the site).
- Section background (`var(--color-background)`)
- `max-w-7xl` container
- Mobile single-column layout

---

## Responsive behavior

- **Mobile (`< md`)**: single-column card grid. Header band stacks (eyebrow → headline → sub → pills → meta). Meta counter optionally hidden on `< md` to save space.
- **Tablet (`md`)**: 2-column card grid. Header band may keep meta counter on the right or stack it.
- **Desktop (`lg`+)**: 2-column card grid, full header band horizontal layout, `max-w-7xl` container.
- No 3-column layout on `xl` — 3 cols × 4 rows would create odd holes when filtering by category (3 questions per category = 1 row of 3, leaves a hole). 2 columns is the safer rhythm at all sizes.

---

## Acceptance criteria

1. Section visually fits within ~860px on a 1280×800 desktop viewport.
2. No empty visual region below the title cluster — the grid fills horizontal space.
3. Category chooser still works exactly as today (state, reset on switch, active styling).
4. Each FAQ card is clickable as a single button; clicking expands the answer in place inside the card.
5. Opening one card in a row does not stretch its sibling card.
6. Stagger animation on viewport enter; smooth reflow on category change.
7. Hover state visibly differentiates an unfocused card from a focused one (border, lift, glow).
8. Open card visibly differentiates from a hovered-but-closed card (cyan border, outer glow).
9. Mobile collapses cleanly to a single column with no horizontal overflow.
10. `npm run lint` clean. `npm run build` clean. Manual smoke in `npm run dev`: filter through each category, open/close at least 3 cards, resize to mobile width.

---

## Tradeoffs accepted

- **Sticky title gone.** Today the title sticks while questions scroll. With the new layout the section is short enough that sticky behavior isn't needed.
- **Card-row asymmetry.** When one card in a row is open, its sibling card sits at the top of a tall row. Mitigated by `align-items: start` so it reads as deliberate, not broken.
- **Eyebrow-style meta counter ("12 Questions · 4 Categories")** is mildly redundant with the visible category list. Accepted because it earns visual weight on the right side of the header band.

---

## Out of scope (do not build now)

- Search input over questions
- "Show more / show less" reveal pattern
- Category color coding (per-category accent hues)
- Animated background visual or 3D element behind the header
- Modal/drawer reveal for answers
- Scroll-linked progress indicator
