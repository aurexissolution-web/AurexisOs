---
title: Portfolio Teaser — Homepage Section
date: 2026-06-20
status: approved
---

# Portfolio Teaser — Homepage Section

A "Selected Work" section that sits between **WhatWeBuild** and **TheMath** on the homepage. Pulls 3 real projects from `portfolio_items`, showcases them in a hero-led asymmetric layout (1 featured + 2 secondary), and links through to the full `/portfolio` page.

Direction chosen: **Option B — Hero + Secondary** from the 2026-06-20 portfolio-teaser brainstorm.

## Why this matters

Visitors hit the homepage and need *proof of work* before the financial pitch (`TheMath` → `Calculator`). The current homepage flow goes: hero → tech stack → philosophy → what we build → math/pricing. There's no "look, we've actually shipped real things for real businesses" beat before the money conversation. This section fills that gap.

## Scope

**In scope**
- One new server component: `src/components/sections/PortfolioTeaser.tsx`
- Mount it between `<WhatWeBuild />` and `<TheMath />` in `src/app/page.tsx`
- Server-side fetch from `portfolio_items` via existing `supabaseAdmin` client
- Hero-led layout: 7-col featured project on the left, 5-col stack of 2 secondary projects on the right (responsive — stacks vertically below `lg`)
- Real data: cover image, title with accent word, description, outcome metrics, tech tags
- Empty states: 0 items → entire section returns `null`; 1 item → featured only (no secondary column); 2 items → featured + 1 secondary

**Out of scope**
- Modifying the existing `/portfolio` page (it already exists and works)
- Modifying the `portfolio_items` schema (no migration needed)
- Hover image zoom / image carousel inside cards (subtle lift + border accent only)
- Filtering by category on the homepage (visitor goes to `/portfolio` for that)

## Data

**Source**: `portfolio_items` table

**Query**:
```sql
SELECT * FROM portfolio_items
ORDER BY
  featured DESC NULLS LAST,
  display_order ASC,
  created_at DESC
LIMIT 3
```

**Field bindings** per card:
| Card field | DB column |
|---|---|
| Cover image | `images[0]` (first element of JSONB array; fallback: gradient placeholder) |
| Title | `title` |
| Accent word | `accent_word` (rendered in violet italic serif inside the title) |
| Description | `description` (featured: 2 lines max; secondary: 1 line max with ellipsis) |
| Outcome metrics | `outcome_metrics` JSONB array — featured shows top 2 metrics inline; secondary skips metrics |
| Tech tags | `tech_tags` array (featured shows 3, secondary shows 2) |
| Link | `/portfolio/${slug}` |

## Layout

**Section frame** (matches the new reviews section background):
- Bg: `#05080F` (slightly elevated from page `#02040A`)
- Top + bottom hairline rules with violet-tinted center
- Dotted-grid texture (24px), masked to fade at edges
- Twin ambient glows: cyan at top-right, violet at bottom-left
- Fine SVG noise grain at 4% opacity overlay

**Header** (centered, max 640px):
- `● SELECTED WORK` eyebrow (mono caps, violet)
- Title: `A few things we've actually shipped.` (sans 600, "actually shipped" in italic serif with violet gradient)
- Lede paragraph

**Main grid** (`lg:grid-cols-[7fr_5fr]`, stacks 1-col below `lg`):

**Featured card** (left, 7 cols):
- Aspect-16/10 cover image at top, with a `★ FEATURED` pill overlay top-left and a giant italic serif `01` in the bottom-left corner of the image
- Body: eyebrow (industry + client), italic serif title with violet accent word, 2-line description, footer row with 2 outcome metrics + "Read the case →" CTA
- Hover: violet border, soft 2px lift, increased shadow

**Secondary stack** (right, 5 cols, 2 cards stacked vertically with 20px gap):
- Horizontal layout per card: 132px aspect-4/3 cover thumbnail on left, body on right
- Body: mono-caps industry eyebrow, italic serif title with cyan accent word, 1-line outcome
- Hover: cyan top accent line + 1px lift

**Archive CTA** (centered below grid):
- Pill button: `View the full archive →` linking to `/portfolio`
- Border-only style with violet hover state

## Edge cases

| # items | Behavior |
|---|---|
| 0 | Section returns `null` — no empty card, no placeholder, just not rendered |
| 1 | Featured spans full width (`lg:grid-cols-1`); no secondary column |
| 2 | Featured 7-col + 1 secondary 5-col |
| 3 | Featured 7-col + 2 secondary stacked 5-col (the default design) |
| 4+ | Still shows 3 (limit in query); user clicks "View the full archive" for the rest |

## Files

**New**:
- `src/components/sections/PortfolioTeaser.tsx` (server component, ~250 LOC)

**Modified**:
- `src/app/page.tsx` — import + mount between `WhatWeBuild` and `TheMath`

**No schema changes, no new migration, no new API route, no new data helpers** — `supabaseAdmin.from('portfolio_items').select()` is enough.

## Hover behaviors

- **Featured**: violet border brightens, card lifts 2px, soft violet shadow appears, CTA arrow extends gap on hover
- **Secondary**: cyan top hairline accent fades in, card lifts 1px, border brightens to cyan/15
- **Archive button**: border + bg shift to violet tints
- No image zoom (intentional — premium, not stock-photo-site)

## Accessibility

- Each card is a single `<a>` with full clickable area (no nested links)
- Cover images get `alt={project.title}`
- Outcome metrics use semantic `<dl>` markup
- Color contrast: title text on dark passes AA at 16px+

## Verification

- `npm run lint` — clean
- `npm run build` — clean, route map shows `/` still
- Visit homepage in dev, scroll past WhatWeBuild → see the new section, click featured card → lands on `/portfolio/[slug]`
- Test with 0, 1, 2, 3 portfolio rows in the DB — each renders the right empty/partial state

## Open questions

None — design is locked. Implementation can proceed.
