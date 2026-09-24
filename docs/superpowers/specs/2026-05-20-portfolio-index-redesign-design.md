# `/portfolio` Index Redesign — Design Spec

**Status:** Direction approved by user — 2026-05-20
**Mockup (frozen reference):** [.superpowers/brainstorm/50819-1778645453/content/direction-b-index.html](.superpowers/brainstorm/50819-1778645453/content/direction-b-index.html)
**Replaces:** [src/app/portfolio/page.tsx](src/app/portfolio/page.tsx) only
**Out of scope:** [src/app/portfolio/[slug]/page.tsx](src/app/portfolio/[slug]/page.tsx) — deferred to a separate session
**Supersedes (index portion of):** [docs/superpowers/specs/2026-05-13-portfolio-redesign-design.md](docs/superpowers/specs/2026-05-13-portfolio-redesign-design.md)

---

## Context

The current `/portfolio` is a competent agency-style table list with a "The Case Files." headline, pill filter tabs, and Framer Motion table rows. It predates the editorial dispatch system the rest of the site has shipped (services hub, location postcard, the-stack receipt, FAQ) and reads off-brand.

After brainstorming three directions on 2026-05-13 (*Dossier* / *The Work Issue* / *Cinematic Acts*), the user approved **The Work Issue** — an editorial dispatch matching the services masthead system. The mockup at [direction-b-index.html](.superpowers/brainstorm/50819-1778645453/content/direction-b-index.html) is the frozen visual reference.

The May 13 spec covered both index + slug pages and proposed a 14-column migration. This spec narrows scope to the **index page only** with a 6-column migration; the remaining 8 columns will be added in the slug-page spec when we tackle that surface.

---

## Architecture

```
src/app/portfolio/page.tsx                    ← thin server composer (was "use client")
src/components/sections/portfolio/
├── PortfolioMasthead.tsx                     ← top rule + giant "The Work Issue." + meta-ledger + lede
├── PortfolioFeatured.tsx                     ← Folio I: featured-case editorial spread
├── PortfolioIndex.tsx                        ← Folio II: indexed rows with outcome-metric heroes
├── PortfolioFolioDivider.tsx                 ← reusable folio rule (dot · title · spacer · count)
└── PortfolioColophon.tsx                     ← "Fin." + discovery CTA closer

src/data/portfolio-config.ts                  ← category → accent color, dispatch constants
src/types/portal.ts                           ← extend PortfolioItem with 6 new fields
```

### Why this shape

- Mirrors the existing [src/components/sections/services/](src/components/sections/services/) pattern. Today's `page.tsx` mixes fetch, layout, and motion in 318 lines; splitting into focused section components matches the codebase convention and lets us swap individual sections later.
- Page becomes **server-rendered** instead of client-fetched. Faster TTFB, indexable HTML, no loading spinner, no useEffect data dance.
- The mockup has no animation that needs Framer Motion. Hover states are pure CSS; the pulsing live dot is a CSS keyframe. The whole page is static once rendered.

### Data flow

`page.tsx` calls `supabaseAdmin.from('portfolio_items').select('*').order('display_order', { ascending: true }).order('created_at', { ascending: false })` on the server.

- The first row where `featured = true` (per the sort above — lowest `display_order`, then newest `created_at`) becomes the featured spread (`PortfolioFeatured`). If multiple rows are flagged featured, only one is rendered as featured; the rest fall through to the index.
- If **no row** has `featured = true`, `PortfolioFeatured` and its `Folio I` divider are omitted entirely; only `Folio II — The Index` renders, with `count = items.length` and row numbering starting at `01`.
- When a featured row exists: `Folio II — The Index` count is `items.length - 1`, row numbering starts at `02`.
- The remaining rows render in `PortfolioIndex`.

---

## Sections in detail

### Masthead

[src/components/sections/portfolio/PortfolioMasthead.tsx](src/components/sections/portfolio/PortfolioMasthead.tsx)

Server component. Three vertical bands:

1. **Top rule** — `[Live · YYYY.MM.DD]` (pulsing cyan dot) ─── `Dispatch № 06 · Vol. I · The Work Issue`. Live date is computed server-side as today in `YYYY.MM.DD`. `Dispatch № 06` and `Vol. I` are constants in `portfolio-config.ts`.
2. **Headline** — Instrument Serif italic, `clamp(72px, 14vw, 200px)`, line-height `0.9`. Two lines: `The Work` / `Issue.` — the word `Work` rendered in the cyan→violet→light-violet gradient (`linear-gradient(120deg, #00F0FF, #7C3AED 60%, #A78BFA)`), identical to the services masthead.
3. **Meta-ledger + lede** — 12-col split (`320px / 1fr` with `60px` gap). Left column: monospace metadata table with dashed bottom borders, rows `Editor`, `Edition`, `Filed under`, `Cases live`, `Surfaces`. Right column: dropcap-led lede paragraph with serif italic `<em>` accent on `the number we moved`. The `Cases live` value is derived: `{items.length} engagements`.

No interactivity. Pure type composition.

### Folio dividers (replaces filter tabs)

[src/components/sections/portfolio/PortfolioFolioDivider.tsx](src/components/sections/portfolio/PortfolioFolioDivider.tsx)

The current pill filter tabs (All / AI Automation / Web Development / App Development) are **removed**. Categories instead become section headers via this component.

Props: `{ title: string; italicWord?: string; accent?: 'cyan'; count: string }`. Renders:

```
●  Folio I — Featured     ────────────────────────────  01 / 04
```

The leading dot is a glowing pulsing cyan circle. `Folio I` and `Folio II` are the two instances used now; the hash-spacer fills the remaining horizontal space; the count text is `text-[#64748b]`.

### Featured spread (Folio I)

[src/components/sections/portfolio/PortfolioFeatured.tsx](src/components/sections/portfolio/PortfolioFeatured.tsx)

Server component. Receives a single `PortfolioItem` (the one with `featured = true`).

- A `PortfolioFolioDivider` reading `Folio I — Featured · 01 / 04`. The count uses `01 / {totalCases}` (zero-padded numerator).
- A 12-col grid (`1.2fr / 1fr`, `48px` gap), `height: 360px`:
  - **Left cell — cover.** If `images[0]` exists, that image is used as `background-image` with a `linear-gradient(135deg, #1a2030, #0f1420 60%, #1a2030)` underlay. If no image, the underlay alone renders. A `Live` pill sits top-right (glassy black, cyan dot, cyan border) — only if `live_url` is present. Caption `COVER · {title.toUpperCase()}` bottom-left in monospace.
  - **Right cell — copy.** Vertically centered. Stack: kicker (`{category_label}` from `portfolio-config.ts` mapping) → serif italic title (line 1 = first word of `title`, line 2 = `accent_word` or remainder) → serif italic pull-quote (`pull_quote` field, rendered in straight double quotes) → two-stat row (`outcome_metrics[0]` cyan, `outcome_metrics[1]` amber) bordered top/bottom → CTAs (white pill `Read the case →` linking to `/portfolio/{slug}`, cyan-underlined `View live →` linking to `live_url` if present, omitted otherwise).

Hard requirement: featured rows must have at least two `outcome_metrics`, else the second stat slot renders empty (acceptable degraded state — design assumes properly authored content).

### Indexed rows (Folio II)

[src/components/sections/portfolio/PortfolioIndex.tsx](src/components/sections/portfolio/PortfolioIndex.tsx)

Server component. Receives the remaining `PortfolioItem[]` (excluding the featured one).

Header: `PortfolioFolioDivider` reading `Folio II — The Index · {n} cases`.

For each item, a row with this grid:

```
36px      60px       1fr                 180px           140px            50px
[index]   [thumb]    [name + category]   [desc one-line] [outcome metric] [arrow]
gap: 24px · padding: 22px 8px · border-bottom: 1px solid rgba(255,255,255,.05)
```

- **index**: monospace `02`, `03`, … padded to 2 digits. Numbering starts at `02` because the featured spread is logically `01`. If no featured row exists, numbering starts at `01`.
- **thumb**: 60×42 rounded `6px` rect. `images[0]` as `background-image` `cover` if present; otherwise `linear-gradient(135deg, #1a2030, #0f1420)` alone.
- **name**: bold 22px white title, with the category label as a monospace caption below (`Web Engineering · 2025`).
- **desc**: one-line `description`, 12.5px, `#94a3b8`, `line-clamp-2`.
- **metric**: huge serif italic figure (`outcome_metrics[0].value`, 38px italic), colored in the row's accent (mapped from `category`). Monospace label below (`outcome_metrics[0].label`).
- **arrow**: serif italic `→`, 26px, `#475569`. On row hover: arrow goes white and translates `(+2px, -2px)`.

Hover behavior (pure CSS, no JS):
- Row background: `rgba(255,255,255,.02)`.
- Inset 3px left-edge stripe in the row's accent color (`box-shadow: inset 3px 0 0 {accent}`).
- Arrow transform + color as above.

Each row is a `<Link href="/portfolio/{slug}">`, server-rendered.

**Mobile (<lg):** the grid collapses to a card per row — index + thumb banner at top, name + category, description, accent metric, arrow. Same accent treatment.

### Colophon

[src/components/sections/portfolio/PortfolioColophon.tsx](src/components/sections/portfolio/PortfolioColophon.tsx)

Server component. Top border, `96px` top margin, 12-col split (`1.5fr / 1fr`, `60px` gap):

- **Left:** giant gradient `Fin.` (Instrument Serif italic, 120px, `linear-gradient(120deg, #00F0FF, #7C3AED)`) → `End of issue · No. 06 · Vol. I` monospace rule.
- **Right:** `Inspired by these results?` serif italic h3 → supporting copy (`Forty-five minutes. Tell us what you're building. We'll tell you what it actually needs.`) → white pill `Book a discovery →` linking to `/contact`.

Single shared CTA card. No sidebar Action card.

---

## Data model

Migration **`012_portfolio_index_redesign.sql`** adds **6** columns to `portfolio_items`:

```sql
ALTER TABLE portfolio_items
  ADD COLUMN category         TEXT        NOT NULL DEFAULT 'web-engineering',
  ADD COLUMN accent_word      TEXT,                          -- e.g. "Treasury." rendered on line 2 of featured title
  ADD COLUMN pull_quote       TEXT,                          -- featured-spread pull quote, rendered in straight quotes
  ADD COLUMN outcome_metrics  JSONB       NOT NULL DEFAULT '[]',  -- [{ "value": "+342%", "label": "Conversion" }, ...]
  ADD COLUMN featured         BOOLEAN     NOT NULL DEFAULT false,
  ADD COLUMN display_order    INT         NOT NULL DEFAULT 0;

ALTER TABLE portfolio_items
  ADD CONSTRAINT portfolio_items_category_check
    CHECK (category IN ('ai-automation', 'web-engineering', 'mobile-ecosystem', 'ecosystem'));

CREATE INDEX portfolio_items_display_order_idx
  ON portfolio_items (display_order ASC, created_at DESC);

CREATE INDEX portfolio_items_featured_idx
  ON portfolio_items (featured) WHERE featured = true;
```

### Category → accent color mapping (in TS, not DB)

`portfolio-config.ts` exports the mapping. Accent color is **derived** from category — never stored — so changing the palette later is a one-line edit.

```ts
ai-automation     → #A78BFA  (violet)
web-engineering   → #00F0FF  (cyan)
mobile-ecosystem  → #10B981  (emerald)
ecosystem         → #F59E0B  (amber)
```

It also exports human-readable category labels (`AI Automation`, `Web Engineering`, `Mobile Ecosystem`, `Ecosystem`) and the dispatch constants (`DISPATCH_NUMBER = '06'`, `VOLUME = 'I'`, `ISSUE_NAME = 'The Work Issue'`).

### Type changes

Extend the `PortfolioItem` interface in [src/types/portal.ts](src/types/portal.ts) with the 6 new fields plus a typed `OutcomeMetric` shape:

```ts
type OutcomeMetric = { value: string; label: string };
type PortfolioCategory = 'ai-automation' | 'web-engineering' | 'mobile-ecosystem' | 'ecosystem';

// PortfolioItem gets:
category: PortfolioCategory;
accent_word: string | null;
pull_quote: string | null;
outcome_metrics: OutcomeMetric[];
featured: boolean;
display_order: number;
```

### RLS

`portfolio_items` has RLS enabled. Migration `005_fix_rls_warnings.sql` **dropped** the public anonymous SELECT policy — public reads now flow through server-side code using the service role (`/api/portfolio` for the current client-fetch implementation; the new server component fetches via `supabaseAdmin` directly). The 6 new columns inherit this same access pattern. No policy changes needed, but the new page must continue to fetch server-side — a client-side `supabase.from('portfolio_items').select(...)` would return zero rows.

### Backfill

The migration does **not** auto-backfill content. After applying:

1. The default `category = 'web-engineering'` and `display_order = 0` apply to all existing rows.
2. **One** row gets manually updated via SQL (or the admin form once the new fields are added) with realistic values for `category`, `outcome_metrics`, `featured = true`, `accent_word`, `pull_quote` — enough to demo the featured spread.
3. Remaining rows should have their `outcome_metrics` set to at least one entry each for visual quality. Empty `outcome_metrics` is non-fatal: the metric cell renders `—` instead of crashing, but the row reads as unfinished.

---

## Admin portal additions

[src/app/portal/admin/portfolio/page.tsx](src/app/portal/admin/portfolio/page.tsx) currently has a modal editor with: title, description, case_study, tech_tags, client_name, live_url, images.

**Add to the editor modal:**

| Field | Input type | Notes |
|---|---|---|
| `category` | `<select>` | Four options matching the enum. Required. |
| `featured` | `<input type="checkbox">` | "Show in the featured spread". Help text: "Only one row is shown as featured. If multiple are flagged, the lowest `display_order` wins (newest `created_at` as tiebreak)." |
| `display_order` | `<input type="number">` | Default 0. Lower = earlier. Help text: "Featured row aside, lower numbers sort first; ties break on created date." |
| `accent_word` | `<input type="text">` | Optional. Help text: "The second line of the featured title (e.g. 'Treasury.'). Renders in the cyan→violet gradient." |
| `pull_quote` | `<textarea rows={2}>` | Optional. Rendered in straight double quotes on the featured spread. |
| `outcome_metrics` | Custom repeater | Array of `{ value, label }`. UI: list of paired text inputs with a `+ Add metric` button and `×` to remove. Save is not blocked at 0 entries (DB default is empty array). Index rows with no metrics render `—` in the metric slot rather than crashing. |

**No UI redesign of the admin form** — keep the existing modal pattern, glass card, NeonButton style. Just add the new inputs as additional rows in the same flow.

**Save payload** includes the new fields with the same naming as the DB columns. `outcome_metrics` is saved as a JS array; Supabase serializes it to JSONB.

---

## Reusable primitives

Imported as-is:

- [src/components/layout/Navbar.tsx](src/components/layout/Navbar.tsx) and [src/components/layout/Footer.tsx](src/components/layout/Footer.tsx) — composed in the page.
- [src/lib/supabase/server.ts](src/lib/supabase/server.ts) `supabaseAdmin` — server-side fetch.
- [src/lib/utils.ts](src/lib/utils.ts) `cn()` — class composition.
- Design tokens from [src/app/globals.css](src/app/globals.css): `--font-instrument-serif`, `--font-plus-jakarta`, `--font-geist-mono`.

Deliberately **not** reused:
- Framer Motion on the page — animations are pure CSS, no JS dependency.
- The `FILTERS` array and filter-tab logic — fully removed.

---

## Animation discipline

The page is overwhelmingly static. The few moving parts:

- **Pulsing live dot** in the masthead top rule and folio dividers — pure CSS `@keyframes` 2s loop on opacity.
- **Row hover** in the index — CSS transitions on `background`, inset `box-shadow` (left-edge stripe), arrow `color` + `transform`. No JS.
- **`prefers-reduced-motion`** — gate the pulsing dot animations only. Row hovers are user-triggered and respect the input by default.

No `IntersectionObserver`, no count-ups, no Framer Motion, no Lenis tie-ins on this page.

---

## Verification

After the implementation plan executes:

1. **Static checks**
   - `npm run lint` clean
   - `npm run build` clean — `/portfolio` should appear in the build output as a server-rendered route, not client-rendered. No `"use client"` in `src/app/portfolio/page.tsx`.
   - TypeScript strict clean.

2. **Migration**
   - Apply `012_portfolio_index_redesign.sql` locally via `npx supabase migration up`. Verify all 6 new columns exist, the CHECK constraint enforces the category enum, and the two indexes are created.
   - Backfill at least one existing row with realistic data (`featured = true`, `outcome_metrics` populated, `category` set, `accent_word` + `pull_quote` populated) so the new page renders with real content.

3. **Page renders**
   - Renders the masthead with today's date in `YYYY.MM.DD`, `Dispatch № 06 · Vol. I · The Work Issue`.
   - If a row has `featured = true`, Folio I renders with the featured spread; otherwise Folio I is omitted and Folio II is the only content.
   - Rows render with the correct accent per category. Hover shows the left-edge stripe in that accent and the arrow nudges up-right.
   - Each row links to `/portfolio/{slug}` (the old slug page renders, with the existing layout — unchanged for now).
   - Live URL pill on the featured spread links out with `target="_blank" rel="noreferrer"`.
   - DevTools Network tab: the page is served as HTML (server component); no client-side fetch to `/api/portfolio`; no React hydration errors in console.

4. **Admin portal**
   - Open `/portal/admin/portfolio`. All 6 new fields are editable in the modal.
   - Saving a row with `category` set, `featured = true`, and 2 outcome metrics, then refreshing `/portfolio`, shows that row in the featured spread.
   - Removing `featured = true` from all rows and refreshing `/portfolio` collapses the page to the index only.

5. **A11y + reduced motion**
   - Tab through the page — all interactive elements (featured CTAs, index rows, colophon CTA) are keyboard-reachable and visibly focused.
   - DevTools → Rendering → emulate `prefers-reduced-motion: reduce`. Pulsing live dot stops. Hover behaviors unaffected.

6. **Visual match**
   - Eye-check against [.superpowers/brainstorm/50819-1778645453/content/direction-b-index.html](.superpowers/brainstorm/50819-1778645453/content/direction-b-index.html) at 1440px wide. Spacing, color, type sizing should match within a tight tolerance.

---

## Out of scope (deferred)

- `/portfolio/[slug]` redesign — separate spec, separate session. The current slug page keeps working with the new fields ignored. The remaining 8 columns from the May 13 spec (`elevator`, `duration_weeks`, `status`, `case_body`, `cover_caption`, `image_captions`, `testimonial_quote`, `testimonial_author`, `testimonial_role`, `client_logo_url`, `stack_headline`) will be added in that follow-up migration.
- Filtering / search on the index — removed. We'll add folio sub-dividers (`Folio III — AI Automation`, etc.) when we have enough cases to warrant them.
- Per-case OG images — handled separately if needed.
- Sitemap entries — Next.js's built-in mechanism already covers `/portfolio` and `/portfolio/[slug]`.
- Image optimization — existing `<img>` usage stays; a Next.js `Image` migration is its own pass.
- Backfilling all existing rows — only the one featured demo row gets backfilled. Admins fill the rest via the portal.
