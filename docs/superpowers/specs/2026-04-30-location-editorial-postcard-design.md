# LocationSection — Editorial Postcard

**Date:** 2026-04-30
**File:** [src/components/sections/LocationSection.tsx](../../../src/components/sections/LocationSection.tsx)
**Status:** Spec — awaiting sign-off before implementation

---

## Why we're rebuilding (again)

The previous redesign replaced a hand-drawn SVG map with a live operations console (a giant KL clock + status pill + spec rows). It works, but the user feels it's "just a timer" — too sparse, missing the *place* dimension, and not premium enough as a single full-viewport section. A bento approach was rejected because it would echo [WhatWeBelieve.tsx](../../../src/components/sections/WhatWeBelieve.tsx)'s bento grid and dilute both sections.

The new direction is an **editorial postcard**: a single oversized treated photograph of KLCC at blue hour anchors the left column. A small floating "stamp" carries the live KL clock + open status. A hairline strip beneath the photo lists the three cities with pin dots. The right column keeps the existing editorial copy + rituals table.

Premium comes from photographic restraint, not decoration. The clock becomes ornament, not hero. Place becomes hero.

---

## What's on screen (lg breakpoint)

```
┌──────────────────────────────────────────────┬────────────────────────┐
│  ┌─────────────────────────────────────────┐ │  Headquartered in      │
│  │                                         │ │  Sungai Petani, Kedah… │
│  │   KLCC at blue hour                     │ │                        │
│  │   treated grayscale + cyan tint         │ │  Our local context     │
│  │   16:10 aspect, full bleed              │ │  isn't a footnote —    │
│  │                                         │ │  it's why we win.      │
│  │   ┌─────────────────┐                   │ │  …non-transferable.    │
│  │   │ ◆ 13:32 MYT     │  ← stamp anchored │ │                        │
│  │   │ ● OPEN · today  │    bottom-left    │ │  ─── rituals ────────  │
│  │   └─────────────────┘                   │ │  DEEP WORK   09–13     │
│  │                                         │ │  CALLS       14:00+    │
│  └─────────────────────────────────────────┘ │  CADENCE  Mon–Sat      │
│  ─────────────────────────────────────────   │  OFF         Sundays   │
│   ● Sungai Petani · HQ                       │                        │
│   ● Kuala Lumpur · presence                  │                        │
│   ● Penang · on-site                         │                        │
└──────────────────────────────────────────────┴────────────────────────┘
```

**Left column** (lg:col-span-7): photo card + pin strip
**Right column** (lg:col-span-5): two paragraphs + rituals dl (mostly unchanged from current)

---

## Component shape

Keep everything in [LocationSection.tsx](../../../src/components/sections/LocationSection.tsx) — same single-file pattern as today. Three internal pieces:

```tsx
function useKLNow(): KLNow | null { /* from previous version, unchanged */ }

function PostcardStamp({ now }: { now: KLNow | null }) {
  // Compact pill: ◆ glyph + clock + status dot + status label
  // Hairline border, glass blur, 180×80 approx
  // Anchored absolute bottom-left of photo, 24px inset
}

function CityPinStrip() {
  // Horizontal strip: ● city · role · coords-on-hover, three items
  // Hairline top/bottom border, mono labels, ~32px tall
}

function EditorialPostcard() {
  const now = useKLNow();
  return (
    <div className="postcard">
      <div className="photo-frame">
        <Image src={KLCC_PHOTO} ... className="treatment" />
        <PostcardStamp now={now} />
      </div>
      <CityPinStrip />
    </div>
  );
}
```

---

## Photo

**Source:** Unsplash, KLCC / Petronas Towers at blue hour. Stable image ID picked at implementation. Saved to `public/images/klcc-dusk.jpg` (~300–500kb after compression). Loaded via Next.js `<Image>` for automatic LCP optimization.

**Treatment** (CSS filters on the `<Image>` wrapper):
- `saturate(0.35)` — desaturate but not fully grayscale
- `contrast(1.05)` — keep blacks deep
- An overlay div with `mix-blend-mode: color` and a cyan-tinted gradient to inject the brand cyan into the shadows
- A subtle vignette via `box-shadow inset` to draw eye to center

**Aspect ratio:** 16:10 on desktop (560×350 approx), 4:3 on mobile (full-width with shorter height).

**Frame:** rounded-2xl, hairline white/[0.08] border, no drop shadow.

---

## Stamp (live tile)

- Container: `~190px × 76px`, hairline border, `backdrop-blur(12px)`, `bg-black/45`
- Position: absolute, `bottom: 16px`, `left: 16px`
- Rounded `rounded-xl`
- Top row: `◆` glyph (Aurexis brand) + `13:32 MYT` in mono tabular-nums, white
- Bottom row: pulsing dot + `OPEN · today` in mono uppercase white/85
- On hover: scale to 1.02, easeOut 200ms
- Reuses `useKLNow` and `StatusDot` from previous implementation

---

## Pin strip

- Container: `border-t border-b border-white/[0.06]`, `py-3`, full-width of the postcard
- Three city items in a horizontal flex row with `gap-8`
- Each: small cyan dot + city name (mono uppercase) + role (mono dim)
- Coordinates revealed on hover via small floating tooltip (or always visible at md+ if width allows)

---

## Right column

**Unchanged from current:**
- Editorial paragraph 1 (Headquartered in Sungai Petani…)
- Editorial paragraph 2 (Our local context isn't a footnote… *non-transferable*)
- Rituals dl: Deep work / Calls / Cadence / Off-hours

---

## Headline

**Keep both lines from current:**
- `Built in Malaysia.` (serif, upright, white)
- `Open right now.` (serif, italic, white/55, 50% size)

---

## Layout & viewport fit

- Section retains `lg:min-h-screen lg:flex-col lg:justify-center`
- Headline: `lg:text-[64px] xl:text-[80px]` (unchanged from previous)
- Photo aspect ratio + pin strip: ~430px tall on lg
- Right column copy: max-w-md, current line-heights
- Mobile: stacks vertically, photo first, then pin strip, then copy + rituals

---

## Files to change

**Edit:**
- [src/components/sections/LocationSection.tsx](../../../src/components/sections/LocationSection.tsx) — remove `OperationsConsole`, add `EditorialPostcard`, `PostcardStamp`, `CityPinStrip`. Keep `useKLNow` + `StatusDot`. Right column dl stays.

**New:**
- `public/images/klcc-dusk.jpg` — downloaded at implementation time. ~300–500kb after compression.

**No new dependencies. No new files in src/.**

---

## What goes away

- The current `OperationsConsole` component (the giant clock + spec grid). Replaced by the photo card + stamp.
- The 4-cell spec grid (Timezone / Week / Off / HQ) — that information moves into the pin strip + the rituals table on the right.

---

## Verification

1. `npm run lint` — clean.
2. TypeScript clean (`tsc --noEmit`).
3. Dev server: load `/about`, scroll to section, verify:
   - Photo loads quickly (LCP < 2.5s on a typical connection).
   - Treatment looks premium — desaturated dusk skyline with subtle cyan tint, not garish, not gray.
   - Stamp is legible, status dot pulses, time ticks.
   - Pin strip shows three cities cleanly.
   - One viewport on 1440×900: section fits, no inner scroll.
   - Mobile: stacks cleanly, photo doesn't overflow.
   - `prefers-reduced-motion`: pulse + scroll fade-ups disabled, time still updates.
4. No new network requests beyond the one image fetch.
5. Lighthouse LCP from this section: green or yellow.

---

## Out of scope

- Sourcing original photography (using Unsplash royalty-free).
- Real-time weather / sunrise / sunset (rejected previously).
- Interactive globe (rejected previously).
- Bento grid (rejected — would echo WhatWeBelieve).
- Activity feed / log stream (rejected — would feel generic-tech).
- Changes to other About sections.
