# `/portfolio` Redesign — Design Spec

**Status:** Direction & both surfaces approved by user — 2026-05-13
**Mockup (index, frozen reference):** [.superpowers/brainstorm/50819-1778645453/content/direction-b-index.html](.superpowers/brainstorm/50819-1778645453/content/direction-b-index.html)
**Mockup (case page, frozen reference):** [.superpowers/brainstorm/50819-1778645453/content/direction-b-case-v2.html](.superpowers/brainstorm/50819-1778645453/content/direction-b-case-v2.html)
**Replaces:** [src/app/portfolio/page.tsx](src/app/portfolio/page.tsx) + [src/app/portfolio/[slug]/page.tsx](src/app/portfolio/[slug]/page.tsx)

---

## Context

The current `/portfolio` surface is a competent agency-style table list (desktop rows / mobile cards) with a "The Case Files." headline. The `/portfolio/[slug]` detail page is a generic stack of header + image + case-study prose + sidebar CTA. Both predate the editorial shift the rest of the site has made (services hub, location postcard, the-stack receipt, FAQ redesign), and read as off-brand.

After brainstorming three directions — *The Dossier* (forensic / classified), *The Work Issue* (editorial dispatch), and *Cinematic Acts* (parallel to services hub) — the user picked **The Work Issue**: it inherits the most from the existing dispatch system, makes the *outcome metric* the hero of each row instead of the client name, and reuses the masthead/colophon primitives already shipped on `/services`.

The case page went through two iterations. The user landed on the restrained version: one big move per section, generous whitespace, no parallel labeled story blocks, no receipt component, no colored tech-chip grid. Type does the work.

---

## Architecture

```
src/app/portfolio/page.tsx                    ← thin server composer (was client-only)
src/app/portfolio/[slug]/page.tsx             ← thin server composer (was client-only)
src/components/sections/portfolio/
├── PortfolioMasthead.tsx                     ← top rule + giant "The Work Issue." + meta-ledger + lede
├── PortfolioFeatured.tsx                     ← Folio I: featured-case editorial spread
├── PortfolioIndex.tsx                        ← Folio II: indexed rows with outcome-metric heroes
├── PortfolioFolioDivider.tsx                 ← reusable folio rule (dot · title · spacer · count)
├── PortfolioColophon.tsx                     ← shared "Fin." + discovery CTA closer
└── case/
    ├── CaseUtilityRow.tsx                    ← back link + floating live-URL status pill
    ├── CaseIdentity.tsx                      ← kicker + giant title + one-line elevator
    ├── CaseCover.tsx                         ← full-bleed hero image w/ client-mark + caption
    ├── CaseNumbers.tsx                       ← 3-up serif italic outcome figures
    ├── CaseBody.tsx                          ← single dropcap prose section, "The Case"
    ├── CaseInterlude.tsx                     ← full-bleed testimonial blockquote
    ├── CaseGallery.tsx                       ← vertical stack of supporting images
    ├── CaseStack.tsx                         ← serif headline + monospace stack line
    ├── CaseFin.tsx                           ← huge gradient "Fin." closer
    └── CaseNext.tsx                          ← single-line next-case link (hover hints cyan)

src/data/portfolio-config.ts                  ← static config: category → accent color, labels
src/types/portfolio.ts                        ← extended PortfolioItem interface (mirrors DB schema)
```

### Why this shape

- Both pages compose narrowly-scoped section components, mirroring the [src/components/sections/services/](src/components/sections/services/) pattern. The current `page.tsx` files are 100+ lines of mixed concerns (fetch, layout, motion); splitting them lets each section be readable in isolation and lets us swap individual sections later (e.g., add a `CaseProcessReceipt` follow-up) without touching the rest.
- Index page goes from **client-only** (current) to **server component** with server-side Supabase fetch. The masthead and folio dividers are static, the rows are server-rendered. We lose the Framer Motion stagger-in, which is fine — the editorial design doesn't need it, and we get faster TTFB + proper indexable HTML.
- Case page becomes **server-rendered** with `generateStaticParams()` for build-time generation of all portfolio slugs. SEO win, perf win.

### Data flow

- Index: `page.tsx` calls `supabaseAdmin.from('portfolio_items').select('*').order('display_order, created_at desc')` on the server. The first row where `featured = true` becomes the featured spread; the rest render in `PortfolioIndex`. No filter tabs (see *Folio Dividers* below).
- Case: `page.tsx` uses `generateStaticParams()` to list slugs at build time, then per-slug it fetches the full row plus the *next case* (next row by `display_order, created_at desc`, wrapping to the first row if at the end) for the `CaseNext` peek.

---

## Sections in detail

### Index — Masthead

[src/components/sections/portfolio/PortfolioMasthead.tsx](src/components/sections/portfolio/PortfolioMasthead.tsx)

Server component. Three rows, mirrors the services masthead almost exactly:
1. **Top rule** — `[Live · YYYY.MM.DD]` (pulsing cyan dot) ─── `Dispatch № 06 · Vol. I · The Work Issue`. Live date is the current month rendered server-side. Dispatch number and volume are constants in `portfolio-config.ts`.
2. **Headline** — Instrument Serif italic, `clamp(72px, 14vw, 200px)`. Two lines: `The Work` / `Issue.` — "Work" rendered in the cyan→violet→light-violet gradient identical to services' `in detail.` treatment.
3. **Meta-ledger + lede** (12-col split: ~320px / 1fr). Left: monospace metadata table (`Editor`, `Edition`, `Filed under`, `Cases live`, `Surfaces`). Right: dropcap-led lede paragraph with a serif italic `<em>` accent on `the number we moved`.

No interactivity. Pure type composition.

### Index — Featured spread (Folio I)

[src/components/sections/portfolio/PortfolioFeatured.tsx](src/components/sections/portfolio/PortfolioFeatured.tsx)

Server component. Receives a `PortfolioItem` (the one with `featured = true`). Renders:

- A `PortfolioFolioDivider` reading `Folio I — Featured · 01 / 04`.
- A 12-col grid (1.2fr / 1fr): left = cover image with a glassy "Live" pill top-right and a `COVER · {title}` monospace caption bottom-left; right = kicker (`{category} · {client subtype}`) → serif italic title → serif italic pull-quote → two-stat row (`outcome_metrics[0]` and `[1]`) bordered top/bottom → CTAs (white pill `Read the case →` + cyan underline `View live →`).

The stat colors alternate: first stat uses the case's accent, second uses cyan (or amber if the case is already cyan-accented). This matches the mockup where Orbital's `+342%` is cyan and `11 wk` is amber. Implementation: a small `pickPairAccents(accent)` helper in `portfolio-config.ts`.

### Index — Folio dividers (replaces filter tabs)

[src/components/sections/portfolio/PortfolioFolioDivider.tsx](src/components/sections/portfolio/PortfolioFolioDivider.tsx)

The current pill filter tabs (All / AI Automation / Web Development / App Development) are **removed**. They flatten the editorial register. Categories instead become section headers within the index — `Folio II — The Index` for the main list. Future shipping plan: if/when we have enough cases to warrant grouping, we add `Folio III — AI Automation`, `Folio IV — Mobile`, etc.

The component takes `{ title, italicWord?, accent, count }` and renders: pulsing dot · `Folio II — The Index` (title in white, italic suffix in accent) · flex spacer rule · `11 cases` count. Reusable: also used inside the case page sections.

### Index — Indexed rows (Folio II)

[src/components/sections/portfolio/PortfolioIndex.tsx](src/components/sections/portfolio/PortfolioIndex.tsx)

Server component. Receives the remaining `PortfolioItem[]` (excluding the featured one). For each item, renders a row with this grid:

```
36px      60px       1fr                 180px           140px            50px
[index]   [thumb]    [name + category]   [desc one-liner] [outcome metric] [arrow]
```

- **index**: monospace `02`, `03`, … padded to 2 digits.
- **thumb**: 60×42 rounded rect; uses `images[0]` if present, otherwise the case accent as a subtle gradient placeholder.
- **name**: bold 22px title, with the category as a monospace caption below (`Web Engineering · 2025`).
- **desc**: one-line description (truncate to ~110 chars with `line-clamp-2`).
- **metric**: huge serif italic figure colored in the case's accent (cyan/amber/violet/emerald), with a tiny monospace label below.
- **arrow**: serif italic `→` that nudges up-right on row hover; the row also gets an inset 3px left-edge stripe in the accent color on hover.

Each row is a `<Link href="/portfolio/{slug}">` — server-side, no JS needed for navigation. The hover effects are pure CSS.

Mobile (<lg): the row collapses to a card matching the existing mobile treatment — index, thumb banner, title, category, accent metric, arrow.

### Index — Colophon

[src/components/sections/portfolio/PortfolioColophon.tsx](src/components/sections/portfolio/PortfolioColophon.tsx)

Server component. Split 1.5fr / 1fr. Left: huge gradient "Fin." (cyan → violet) + `End of issue · No. 06 · Vol. I` monospace rule. Right: `Inspired by these results?` serif italic h3 + supporting copy + white pill `Book a discovery →` (`/contact`).

Mirrors the services colophon precisely. Single shared CTA card (no `Action` sidebar like the current case page).

### Case — Utility row

Back link to `/portfolio` on the left (monospace, amber `←`). Floating amber **Operational →** pill on the right linking to `live_url`. If `status = confidential`, the pill reads `Confidential` and is non-clickable. If no `live_url`, the pill is omitted.

### Case — Identity

Kicker (`{category} · {year} · {duration}`), giant Instrument Serif italic title with the case noun-word rendered in the accent gradient (e.g. `Orbital` plain, `Treasury.` amber-gradient — controlled by an `accent_word` field, see Data section). If `accent_word` is null or doesn't appear in `title`, the full title renders in plain white with no gradient. Title splits on first space by default to put the accent word on line 2; if `title` is a single word, the accent word renders inline. Below: a single one-line elevator paragraph in `#cbd5e1` at 20px.

### Case — Cover

Full-bleed hero image in a `aspect-ratio: 16/9; rounded-3xl` container. Uses `images[0]`. If missing, a styled gradient fallback (same as the index thumbs but bigger). Overlay: client mark top-left (Instrument Serif italic, faded), caption bottom-left (monospace, `Cover · {caption}` from the new `cover_caption` field).

### Case — Numbers

3-up grid of huge serif italic outcome figures from `outcome_metrics[]`. `clamp(72px, 9vw, 144px)`. All colored in the case accent. Monospace label below each. **Hard-capped at 3** for the case page (the index featured spread shows 2). If `outcome_metrics` has more than 3 entries, we display the first 3. If it has 1 or 2, we render that many in a centered row (no empty cells). If empty, the whole section is omitted.

### Case — Body ("The Case")

`PortfolioFolioDivider`-style label `The Case`, then a single prose block in a max-width-800px column. The prose comes from a new structured field `case_body` (text/markdown — see Data section). The **first paragraph's first letter** gets a 100px Instrument Serif italic dropcap in the accent color. Subsequent paragraphs are plain. `<em>` tags render as Instrument Serif italic at 21px for emphasis.

### Case — Interlude

If `testimonial_quote` is present: a full-bleed (`-mx-14`) blockquote with cyan/amber glow on the leading typographic quote mark, 36-56px Instrument Serif italic, with `{author} · {role} · {company}` in monospace below. If no testimonial, the section is omitted entirely.

### Case — Gallery ("The Surfaces")

Vertical stack of `images[1..]` (the cover is `images[0]`). Each shot is a `aspect-ratio: 16/9; rounded-2xl` container with a monospace caption pulled from a parallel `image_captions` array (new field). If captions are absent, we render the index-style accent gradient placeholder with no caption. Empty state: section omitted entirely.

### Case — Stack ("The Stack")

Serif italic h3 (`Boring tech. / Built to scale.` — copy is configurable per-case via a new `stack_headline` field with a default), then a monospace `stack-line` rendering `tech_tags` separated by `·`. ~3 tags per line via natural wrap. No icons, no chips, no colored glyphs.

### Case — Fin

Huge gradient "Fin." (case accent → light tint → white), `clamp(140px, 18vw, 240px)`. Below: `End of file · No. {case_number} · Vol. I` monospace rule. The `case_number` is `'AX-' + padStart(2, '0')` of the `display_order`.

### Case — Next

Loads the next case (by `display_order, created_at desc`). Renders a single horizontal row: `Next case` monospace label (top), giant Instrument Serif italic case name (bottom-left), `→` arrow (bottom-right). On hover the name and arrow shift to cyan and the arrow translates +8px. Wraps to first case if currently on the last.

---

## Data model

The current `portfolio_items` table is too thin to drive the design. Migration **`012_portfolio_redesign.sql`** adds the following columns (all nullable except `category` which gets a backfilled default):

```sql
ALTER TABLE portfolio_items
  ADD COLUMN category          TEXT NOT NULL DEFAULT 'web-engineering',
  ADD COLUMN accent_word       TEXT,                              -- e.g. "Treasury." rendered in gradient
  ADD COLUMN elevator          TEXT NOT NULL DEFAULT '',
  ADD COLUMN duration_weeks    INT,
  ADD COLUMN status            TEXT NOT NULL DEFAULT 'shipped',   -- live | shipped | confidential | in_progress
  ADD COLUMN featured          BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN display_order     INT NOT NULL DEFAULT 0,
  ADD COLUMN outcome_metrics   JSONB NOT NULL DEFAULT '[]',       -- [{ value: "+342%", label: "Conversion" }, ...]
  ADD COLUMN case_body         TEXT NOT NULL DEFAULT '',          -- markdown-ish prose, paragraphs split on \n\n
  ADD COLUMN cover_caption     TEXT,
  ADD COLUMN image_captions    TEXT[] NOT NULL DEFAULT '{}',      -- aligned to images[1..]
  ADD COLUMN testimonial_quote TEXT,
  ADD COLUMN testimonial_author TEXT,
  ADD COLUMN testimonial_role  TEXT,
  ADD COLUMN client_logo_url   TEXT,
  ADD COLUMN stack_headline    TEXT;                              -- override for "Boring tech. / Built to scale."

CREATE INDEX portfolio_items_display_order_idx ON portfolio_items (display_order, created_at DESC);
CREATE INDEX portfolio_items_featured_idx ON portfolio_items (featured) WHERE featured = true;
```

`category` valid values are enforced in TypeScript (`'ai-automation' | 'web-engineering' | 'mobile-ecosystem' | 'ecosystem'`) and a CHECK constraint added in the migration. The accent color is **derived** from category in `portfolio-config.ts` — not stored. Mapping:

```ts
ai-automation     → #A78BFA (violet)
web-engineering   → #00F0FF (cyan)
mobile-ecosystem  → #10B981 (emerald)
ecosystem         → #F59E0B (amber)
```

`PortfolioItem` in [src/types/portal.ts](src/types/portal.ts) is extended with the new fields. (We keep the type in `portal.ts` rather than creating `src/types/portfolio.ts` — the file is the canonical home for all portal-backed types and breaking that pattern adds friction.)

`case_study` (existing column) is **deprecated but retained** for backward compatibility — old rows that haven't been migrated by hand still read from it as a fallback when `case_body` is empty. We don't drop it in this migration.

### RLS

`portfolio_items` already has RLS enabled with a public-read policy (from migration `005_fix_rls_warnings.sql`). The new columns inherit the same policy — no policy changes needed.

### Admin portal

The existing admin form at [src/app/portal/admin/portfolio/](src/app/portal/admin/portfolio/) needs the new fields added so admins can edit them. **In scope for this redesign:**
- `category` select (one of the 4 enum values)
- `featured` checkbox
- `status` select
- `accent_word` text input
- `elevator` textarea (1 line)
- `duration_weeks` number input
- `outcome_metrics` repeater (value + label rows)
- `case_body` long textarea (replaces `case_study`)
- `cover_caption` text input
- `testimonial_quote / _author / _role` group
- `image_captions` repeater (paired with the existing image upload list)
- `stack_headline` text input
- `display_order` number input
- `client_logo_url` image upload

We don't redesign the admin form's UI in this scope — it stays as today's form pattern, just with more fields.

---

## Reusable primitives

Imported as-is:

- [src/components/layout/Navbar.tsx](src/components/layout/Navbar.tsx) and [src/components/layout/Footer.tsx](src/components/layout/Footer.tsx) — composed in both pages.
- [src/lib/supabase/server.ts](src/lib/supabase/server.ts) `supabaseAdmin` — server-side fetch.
- [src/lib/utils.ts](src/lib/utils.ts) `cn()` — class composition.
- Design tokens from [src/app/globals.css](src/app/globals.css): `--font-instrument-serif`, `--font-plus-jakarta`, `--font-geist-mono`, `--bg-primary`, the four accent color variables.
- `ChevronRight`, `ArrowUpRight`, `ArrowLeft` from `lucide-react` for utility-row icons.

Things we deliberately do **not** reuse:
- The `NeonButton` component from the current case page — replaced by simple white-pill `<Link>` matching services.
- Framer Motion on the index page — animations on this page are scroll-reveal only and can be pure CSS.
- The `FILTERS` array and filter-tab logic — fully removed.

---

## Animation discipline

The page is overwhelmingly static. The few moving parts:

- **Pulsing dots** in the masthead and folio dividers — pure CSS `@keyframes pulse` 2s loop.
- **Row hover** on the index — CSS transitions on `background`, `box-shadow` (left-edge stripe), `arrow color + transform`. No JS.
- **Next-case hover** on the case page — CSS transitions on `color` and `transform`.
- **`prefers-reduced-motion`** — gate the pulsing dot animations only. Everything else is hover-triggered and respects the user's input.

No `IntersectionObserver`, no count-ups, no Framer Motion. Faster page, less code.

---

## Verification

After the implementation plan executes:

1. **Static checks**
   - `npm run lint` clean
   - `npm run build` clean — both `/portfolio` and `/portfolio/[slug]` should appear in the build output as static (case page via `generateStaticParams`) or fully-server-rendered (index page) routes, not client-rendered.
   - TypeScript strict clean.

2. **Migration**
   - Apply `012_portfolio_redesign.sql` locally via `npx supabase migration up`. Verify all 14 new columns exist, the CHECK constraint enforces category enum, the two indexes are created.
   - Backfill: at least one existing row gets manually updated with `category`, `outcome_metrics`, `case_body` so the new pages render with real content.

3. **Index page (`/portfolio`)**
   - Renders the masthead with current date, dispatch № 06.
   - If a row has `featured = true`, it renders in Folio I as the featured spread; otherwise Folio I is omitted and Folio II is the only content.
   - Rows render with the correct accent per category. Hover shows the left-edge stripe in that accent.
   - DevTools network tab — page is served as HTML (server component); no React hydration errors.

4. **Case page (`/portfolio/{slug}`)**
   - Renders all 10 sections in order, in the correct accent for the case's category.
   - Sections that depend on optional data (interlude, gallery, status pill) gracefully omit when data is missing — no empty sections, no broken layout.
   - Live URL pill links out with `target="_blank" rel="noreferrer"`.
   - Next-case link wraps to the first case from the last.
   - Run `npm run build` and confirm the case route is statically generated for every slug in the DB at build time.

5. **Admin portal**
   - Open `/portal/admin/portfolio`. All new fields are editable. Saving a row with the new fields persists them.
   - Saving an `outcome_metrics` entry with malformed JSON shows a form-level error.

6. **A11y + reduced motion**
   - Tab through both pages — all interactive elements (CTAs, links, status pill) are keyboard-reachable and visibly focused.
   - DevTools → Rendering → emulate `prefers-reduced-motion: reduce`. Pulsing dots stop. Everything else (which was hover-triggered) is unaffected.

7. **Browser check**
   - Both pages match the frozen mockups at `.superpowers/brainstorm/50819-1778645453/content/direction-b-index.html` and `direction-b-case-v2.html` to a close approximation.

---

## Out of scope

- The admin portal **UI redesign** — admins still use today's form layout, just with new fields.
- A markdown renderer for `case_body` — paragraphs split on `\n\n`, inline `<em>...</em>` and `<strong>...</strong>` are honored, nothing else. If we need real markdown later, swap to `react-markdown` in a separate change.
- Filtering / search on the index — removed. We add folio sub-dividers when we have enough cases to warrant them.
- Per-case OG images — handled in a follow-up if needed.
- Sitemap entries — the existing sitemap generator already includes portfolio routes via Next.js's built-in mechanism.
- Image optimization — out of scope; existing `<img>` usage stays as today and is flagged for a separate Next.js Image-component migration pass.
- Backfilling all existing rows — only one row gets manually backfilled to demo the new fields. The admin can fill the rest via the portal.
