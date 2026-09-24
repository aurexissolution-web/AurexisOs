# Portfolio Index Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace `/portfolio` with the approved "Work Issue" editorial layout — server-rendered, no filter tabs, featured-spread + indexed-rows + colophon — backed by a 6-column schema migration and matching admin form additions.

**Architecture:** Thin server-component composer in `src/app/portfolio/page.tsx` pulling all rows from Supabase via `supabaseAdmin`, splitting on `featured = true` and routing to five new section components in `src/components/sections/portfolio/`. Pure CSS hover, no Framer Motion. Admin form gets six new inputs including a custom `outcome_metrics` repeater.

**Tech Stack:** Next.js 16 App Router · React 19 server components · TypeScript strict · Tailwind 4 + inline styles · Supabase Postgres + RLS.

**Spec:** [docs/superpowers/specs/2026-05-20-portfolio-index-redesign-design.md](docs/superpowers/specs/2026-05-20-portfolio-index-redesign-design.md)

**Mockup (frozen):** [.superpowers/brainstorm/50819-1778645453/content/direction-b-index.html](.superpowers/brainstorm/50819-1778645453/content/direction-b-index.html) — server still running at `http://localhost:6033/direction-b-index.html`.

---

## Project conventions (read once before starting)

- **No automatic commits.** Per `CLAUDE.md`, do not commit unless the user explicitly says so. Each task ends with an *optional* commit step — execute it only if the user has approved committing for this session.
- **No test runner.** This codebase has no unit-test framework wired up. Verification per task is `npm run lint` + `npm run build` + (where relevant) opening `http://localhost:3001/portfolio` in the browser.
- **Fonts.** CSS vars live in `src/app/globals.css`: `--font-instrument-serif`, `--font-plus-jakarta`, `--font-geist-mono`. Use them via inline `style={{ fontFamily: 'var(--font-instrument-serif)' }}` — Tailwind utilities for these vars are not defined.
- **Server components.** Every new file under `src/components/sections/portfolio/` is a server component. No `"use client"`. No hooks. No event handlers in JSX.
- **Existing types live in `src/types/portal.ts`** — don't create `src/types/portfolio.ts`. The `PortfolioItem` interface is at line 110-121 and gets extended in place.

---

## Task 1: Create migration `012_portfolio_index_redesign.sql`

**Files:**
- Create: `supabase/migrations/012_portfolio_index_redesign.sql`

- [ ] **Step 1: Write the migration**

```sql
-- 012_portfolio_index_redesign.sql
-- Adds the six columns required by the redesigned /portfolio index:
--   category, accent_word, pull_quote, outcome_metrics, featured, display_order.
-- RLS policies are inherited from migration 005 (public read).

ALTER TABLE portfolio_items
  ADD COLUMN category         TEXT        NOT NULL DEFAULT 'web-engineering',
  ADD COLUMN accent_word      TEXT,
  ADD COLUMN pull_quote       TEXT,
  ADD COLUMN outcome_metrics  JSONB       NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN featured         BOOLEAN     NOT NULL DEFAULT false,
  ADD COLUMN display_order    INTEGER     NOT NULL DEFAULT 0;

ALTER TABLE portfolio_items
  ADD CONSTRAINT portfolio_items_category_check
    CHECK (category IN ('ai-automation', 'web-engineering', 'mobile-ecosystem', 'ecosystem'));

CREATE INDEX portfolio_items_display_order_idx
  ON portfolio_items (display_order ASC, created_at DESC);

CREATE INDEX portfolio_items_featured_idx
  ON portfolio_items (featured) WHERE featured = true;
```

- [ ] **Step 2: Apply the migration locally**

Run: `npx supabase migration up`
Expected: migration `012_portfolio_index_redesign` reports `Applied`.

If supabase CLI is not initialized for this project, apply via `psql` against the Supabase Postgres URL:
```bash
psql "$SUPABASE_DB_URL" -f supabase/migrations/012_portfolio_index_redesign.sql
```

- [ ] **Step 3: Verify schema**

Run:
```bash
psql "$SUPABASE_DB_URL" -c "\d portfolio_items"
```
Expected: output lists `category`, `accent_word`, `pull_quote`, `outcome_metrics`, `featured`, `display_order` with the right types and defaults, plus the two new indexes and the check constraint.

- [ ] **Step 4: (Optional) Commit**

Only if user has approved committing:
```bash
git add supabase/migrations/012_portfolio_index_redesign.sql
git commit -m "feat(portfolio): add index-redesign schema (012)"
```

---

## Task 2: Extend `PortfolioItem` type

**Files:**
- Modify: `src/types/portal.ts:110-121`

- [ ] **Step 1: Replace the interface (and add the new shared types right before it)**

In `src/types/portal.ts`, locate the existing `export interface PortfolioItem { ... }` block at line 110-121 and replace it with:

```ts
export type PortfolioCategory =
  | 'ai-automation'
  | 'web-engineering'
  | 'mobile-ecosystem'
  | 'ecosystem';

export interface OutcomeMetric {
  value: string;
  label: string;
}

export interface PortfolioItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  case_study: string;
  images: string[];
  tech_tags: string[];
  client_name: string | null;
  live_url: string | null;
  created_at: string;
  category: PortfolioCategory;
  accent_word: string | null;
  pull_quote: string | null;
  outcome_metrics: OutcomeMetric[];
  featured: boolean;
  display_order: number;
}
```

- [ ] **Step 2: Verify TypeScript still compiles**

Run: `npm run lint`
Expected: clean, except possibly errors in `src/app/portal/admin/portfolio/page.tsx` referring to `PortfolioItemData` (its private local interface — those are fine to ignore at this stage; we'll edit that file in Task 11).

If lint surfaces errors in files *other than* `src/app/portal/admin/portfolio/page.tsx`, fix them before moving on — typically by reading back the file the error points to and providing the missing field on object literals.

- [ ] **Step 3: (Optional) Commit**

```bash
git add src/types/portal.ts
git commit -m "feat(portfolio): extend PortfolioItem with redesign fields"
```

---

## Task 3: Create `portfolio-config.ts`

**Files:**
- Create: `src/data/portfolio-config.ts`

- [ ] **Step 1: Write the config**

```ts
// src/data/portfolio-config.ts
import type { PortfolioCategory } from '@/types/portal';

export const DISPATCH_NUMBER = '06';
export const VOLUME = 'I';
export const ISSUE_NAME = 'The Work Issue';

export const CATEGORY_ACCENT: Record<PortfolioCategory, string> = {
  'ai-automation': '#A78BFA',
  'web-engineering': '#00F0FF',
  'mobile-ecosystem': '#10B981',
  ecosystem: '#F59E0B',
};

export const CATEGORY_LABEL: Record<PortfolioCategory, string> = {
  'ai-automation': 'AI Automation',
  'web-engineering': 'Web Engineering',
  'mobile-ecosystem': 'Mobile Ecosystem',
  ecosystem: 'Ecosystem',
};

export function todayDispatchDate(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}.${mm}.${dd}`;
}
```

- [ ] **Step 2: Verify lint + build**

Run: `npm run lint`
Expected: clean.

- [ ] **Step 3: (Optional) Commit**

```bash
git add src/data/portfolio-config.ts
git commit -m "feat(portfolio): add category accent + dispatch config"
```

---

## Task 4: Create `PortfolioFolioDivider`

**Files:**
- Create: `src/components/sections/portfolio/PortfolioFolioDivider.tsx`

- [ ] **Step 1: Write the component**

```tsx
// src/components/sections/portfolio/PortfolioFolioDivider.tsx
import { cn } from '@/lib/utils';

interface Props {
  title: string;
  italicWord?: string;
  count: string;
  className?: string;
}

export function PortfolioFolioDivider({ title, italicWord, count, className }: Props) {
  return (
    <div
      className={cn('flex items-center gap-3.5 my-14 mb-6', className)}
      style={{
        fontFamily: 'var(--font-geist-mono), ui-monospace, monospace',
        fontSize: '10.5px',
        letterSpacing: '0.28em',
        textTransform: 'uppercase',
        color: '#00F0FF',
      }}
    >
      <span
        aria-hidden="true"
        className="inline-block rounded-full motion-safe:animate-[portfolioPulse_2s_infinite]"
        style={{
          width: 8,
          height: 8,
          background: '#00F0FF',
          boxShadow: '0 0 10px #00F0FF',
        }}
      />
      <span className="font-semibold" style={{ color: '#f5f5f7' }}>
        {title}
        {italicWord && (
          <>
            {' '}
            <span style={{ color: '#00F0FF', fontStyle: 'normal' }}>{italicWord}</span>
          </>
        )}
      </span>
      <span className="flex-1 h-px" style={{ background: 'rgba(0,240,255,0.18)' }} />
      <span style={{ color: '#64748b' }}>{count}</span>
    </div>
  );
}
```

- [ ] **Step 2: Add the pulse keyframe to globals.css if not already present**

Open `src/app/globals.css` and check if a `portfolioPulse` keyframe exists. If not, append:

```css
@keyframes portfolioPulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
```

- [ ] **Step 3: Verify lint + build**

Run: `npm run lint && npm run build`
Expected: both clean. The new component compiles even though nothing imports it yet.

- [ ] **Step 4: (Optional) Commit**

```bash
git add src/components/sections/portfolio/PortfolioFolioDivider.tsx src/app/globals.css
git commit -m "feat(portfolio): add PortfolioFolioDivider primitive"
```

---

## Task 5: Create `PortfolioMasthead`

**Files:**
- Create: `src/components/sections/portfolio/PortfolioMasthead.tsx`

- [ ] **Step 1: Write the component**

```tsx
// src/components/sections/portfolio/PortfolioMasthead.tsx
import { DISPATCH_NUMBER, ISSUE_NAME, VOLUME, todayDispatchDate } from '@/data/portfolio-config';

interface Props {
  casesLive: number;
}

const MONO = 'var(--font-geist-mono), ui-monospace, monospace';
const SERIF = 'var(--font-instrument-serif), ui-serif, Georgia, serif';

export function PortfolioMasthead({ casesLive }: Props) {
  const today = todayDispatchDate();

  return (
    <header>
      {/* Top rule */}
      <div
        className="flex items-center gap-3.5 pb-[18px]"
        style={{
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          fontFamily: MONO,
          fontSize: '10.5px',
          letterSpacing: '0.26em',
          textTransform: 'uppercase',
          color: '#94a3b8',
        }}
      >
        <span className="flex items-center gap-2" style={{ color: '#00F0FF' }}>
          <span
            aria-hidden="true"
            className="inline-block rounded-full motion-safe:animate-[portfolioPulse_2s_infinite]"
            style={{ width: 7, height: 7, background: '#00F0FF', boxShadow: '0 0 10px #00F0FF' }}
          />
          Live · {today}
        </span>
        <span className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.10)' }} />
        <span style={{ color: '#f5f5f7' }}>
          Dispatch № {DISPATCH_NUMBER} · Vol. {VOLUME} · {ISSUE_NAME}
        </span>
      </div>

      {/* Headline */}
      <h1
        className="my-7"
        style={{
          fontFamily: SERIF,
          fontStyle: 'italic',
          fontWeight: 400,
          fontSize: 'clamp(72px, 14vw, 200px)',
          lineHeight: 0.9,
          letterSpacing: '-0.035em',
          marginBottom: '22px',
        }}
      >
        The{' '}
        <span
          style={{
            backgroundImage: 'linear-gradient(120deg, #00F0FF, #7C3AED 60%, #A78BFA)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
          }}
        >
          Work
        </span>
        <br />
        Issue.
      </h1>

      {/* Meta-ledger + lede */}
      <div
        className="grid gap-x-[60px] gap-y-8 pb-9 grid-cols-1 md:grid-cols-[320px_1fr]"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
      >
        <dl style={{ fontFamily: MONO, fontSize: '11px', color: '#94a3b8' }}>
          <MetaRow label="Editor" value="Aurexis Studio" />
          <MetaRow label="Edition" value="Q2 · 2026" />
          <MetaRow label="Filed under" value="Selected Work" />
          <MetaRow label="Cases live" value={`${casesLive} engagements`} />
          <MetaRow label="Surfaces" value="Web · Mobile · AI" />
        </dl>

        <p
          style={{
            fontFamily: 'var(--font-plus-jakarta), system-ui, sans-serif',
            fontSize: '17px',
            lineHeight: 1.55,
            color: '#cbd5e1',
            maxWidth: 640,
          }}
        >
          <span
            className="float-left pr-3 pt-2"
            style={{
              fontFamily: SERIF,
              fontStyle: 'italic',
              fontWeight: 400,
              fontSize: '76px',
              lineHeight: 0.82,
              color: '#00F0FF',
            }}
            aria-hidden="true"
          >
            T
          </span>
          welve engagements. Four service lines. Every page in this issue is a case we&apos;ve actually shipped — what the client came to us with, how we attacked it, and{' '}
          <em
            style={{
              fontFamily: SERIF,
              fontStyle: 'italic',
              fontWeight: 400,
              fontSize: '19px',
              color: '#fff',
            }}
          >
            the number we moved.
          </em>{' '}
          Hover any row to peek; click to read the full file.
        </p>
      </div>
    </header>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="grid py-2 grid-cols-[90px_1fr]"
      style={{ borderBottom: '1px dashed rgba(255,255,255,0.07)' }}
    >
      <dt
        style={{
          color: '#cbd5e1',
          fontWeight: 500,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          fontSize: '9.5px',
        }}
      >
        {label}
      </dt>
      <dd>{value}</dd>
    </div>
  );
}
```

> **Note on dropcap:** The mockup CSS uses `::first-letter` which is awkward to scope inside a server component. Splitting out the first letter as an `aria-hidden` span (with `T` hard-coded since the lede is static copy) achieves the same visual result without the cascade footgun. Screen readers still read `Twelve…`.

- [ ] **Step 2: Verify lint + build**

Run: `npm run lint && npm run build`
Expected: clean.

- [ ] **Step 3: (Optional) Commit**

```bash
git add src/components/sections/portfolio/PortfolioMasthead.tsx
git commit -m "feat(portfolio): add masthead (top rule + headline + meta-ledger)"
```

---

## Task 6: Create `PortfolioFeatured`

**Files:**
- Create: `src/components/sections/portfolio/PortfolioFeatured.tsx`

- [ ] **Step 1: Write the component**

```tsx
// src/components/sections/portfolio/PortfolioFeatured.tsx
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { PortfolioItem } from '@/types/portal';
import { CATEGORY_LABEL } from '@/data/portfolio-config';
import { PortfolioFolioDivider } from './PortfolioFolioDivider';

interface Props {
  item: PortfolioItem;
  totalCases: number;
}

const MONO = 'var(--font-geist-mono), ui-monospace, monospace';
const SERIF = 'var(--font-instrument-serif), ui-serif, Georgia, serif';

export function PortfolioFeatured({ item, totalCases }: Props) {
  const [first, ...rest] = item.title.split(' ');
  const titleLineOne = first;
  const titleLineTwo = item.accent_word ?? rest.join(' ');

  const cover = item.images?.[0];
  const metric1 = item.outcome_metrics?.[0];
  const metric2 = item.outcome_metrics?.[1];

  const totalPadded = String(totalCases).padStart(2, '0');

  return (
    <section>
      <PortfolioFolioDivider
        title="Folio I —"
        italicWord="Featured"
        count={`01 / ${totalPadded}`}
      />

      <div
        className="grid gap-12 items-stretch mb-3 pt-[30px] pb-10 grid-cols-1 lg:grid-cols-[1.2fr_1fr]"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        {/* Cover */}
        <div
          className="relative overflow-hidden"
          style={{
            borderRadius: 18,
            border: '1px solid rgba(255,255,255,0.08)',
            height: 360,
            backgroundImage: cover
              ? `linear-gradient(135deg, rgba(26,32,48,0.6), rgba(15,20,32,0.6) 60%, rgba(26,32,48,0.6)), url(${cover})`
              : 'linear-gradient(135deg, #1a2030, #0f1420 60%, #1a2030)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {/* Radial wash overlay (matches mockup) */}
          {!cover && (
            <span
              aria-hidden="true"
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  'radial-gradient(ellipse 60% 60% at 30% 40%, rgba(0,240,255,0.15), transparent 60%), radial-gradient(ellipse 50% 50% at 80% 80%, rgba(124,58,237,0.18), transparent 60%)',
              }}
            />
          )}

          {/* Live pill */}
          {item.live_url && (
            <span
              className="absolute top-4 right-4 rounded-full px-[11px] py-[6px] backdrop-blur"
              style={{
                background: 'rgba(0,0,0,0.55)',
                border: '1px solid rgba(0,240,255,0.4)',
                fontFamily: MONO,
                fontSize: '9.5px',
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color: '#00F0FF',
              }}
            >
              <span
                aria-hidden="true"
                className="inline-block rounded-full mr-[6px] align-middle"
                style={{ width: 6, height: 6, background: '#00F0FF', boxShadow: '0 0 8px #00F0FF' }}
              />
              Live
            </span>
          )}

          {/* Bottom caption */}
          <span
            className="absolute bottom-4 left-[18px]"
            style={{
              fontFamily: MONO,
              fontSize: '9px',
              letterSpacing: '0.3em',
              color: 'rgba(255,255,255,0.4)',
              textTransform: 'uppercase',
            }}
          >
            COVER · {item.title.toUpperCase()}
          </span>
        </div>

        {/* Copy side */}
        <div className="flex flex-col justify-center py-3.5">
          <div
            style={{
              fontFamily: MONO,
              fontSize: '10px',
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
              color: '#00F0FF',
              marginBottom: 14,
            }}
          >
            {CATEGORY_LABEL[item.category]}
            {item.client_name ? ` · ${item.client_name}` : ''}
          </div>

          <h2
            style={{
              fontFamily: SERIF,
              fontStyle: 'italic',
              fontWeight: 400,
              fontSize: 64,
              lineHeight: 0.94,
              letterSpacing: '-0.028em',
              marginBottom: 16,
            }}
          >
            {titleLineOne}
            {titleLineTwo && (
              <>
                <br />
                {titleLineTwo}
              </>
            )}
          </h2>

          {item.pull_quote && (
            <p
              style={{
                fontFamily: SERIF,
                fontStyle: 'italic',
                fontSize: 22,
                lineHeight: 1.4,
                color: '#cbd5e1',
                marginBottom: 22,
              }}
            >
              &ldquo;{item.pull_quote}&rdquo;
            </p>
          )}

          {(metric1 || metric2) && (
            <div
              className="flex gap-9 mb-6 py-[18px]"
              style={{
                borderTop: '1px solid rgba(255,255,255,0.08)',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              {metric1 && (
                <div>
                  <div
                    style={{
                      fontFamily: SERIF,
                      fontStyle: 'italic',
                      fontSize: 42,
                      lineHeight: 1,
                      color: '#00F0FF',
                    }}
                  >
                    {metric1.value}
                  </div>
                  <div
                    className="mt-1.5"
                    style={{
                      fontFamily: MONO,
                      fontSize: 9,
                      letterSpacing: '0.26em',
                      color: '#94a3b8',
                      textTransform: 'uppercase',
                    }}
                  >
                    {metric1.label}
                  </div>
                </div>
              )}
              {metric2 && (
                <div>
                  <div
                    style={{
                      fontFamily: SERIF,
                      fontStyle: 'italic',
                      fontSize: 42,
                      lineHeight: 1,
                      color: '#F59E0B',
                    }}
                  >
                    {metric2.value}
                  </div>
                  <div
                    className="mt-1.5"
                    style={{
                      fontFamily: MONO,
                      fontSize: 9,
                      letterSpacing: '0.26em',
                      color: '#94a3b8',
                      textTransform: 'uppercase',
                    }}
                  >
                    {metric2.label}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-3 items-center">
            <Link
              href={`/portfolio/${item.slug}`}
              className="inline-flex items-center gap-1.5 rounded-full font-semibold transition-opacity hover:opacity-90"
              style={{
                background: '#fff',
                color: '#02040A',
                padding: '11px 22px',
                fontSize: 13,
                letterSpacing: '0.02em',
              }}
            >
              Read the case <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            {item.live_url && (
              <a
                href={item.live_url}
                target="_blank"
                rel="noreferrer"
                className="transition-colors hover:text-white"
                style={{
                  color: '#00F0FF',
                  fontFamily: MONO,
                  fontSize: 11,
                  letterSpacing: '0.22em',
                  textTransform: 'uppercase',
                  padding: '11px 8px',
                  borderBottom: '1px solid #00F0FF',
                }}
              >
                View live →
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify lint + build**

Run: `npm run lint && npm run build`
Expected: clean. Component compiles even though no page imports it yet.

- [ ] **Step 3: (Optional) Commit**

```bash
git add src/components/sections/portfolio/PortfolioFeatured.tsx
git commit -m "feat(portfolio): add featured editorial spread (Folio I)"
```

---

## Task 7: Create `PortfolioIndex`

**Files:**
- Create: `src/components/sections/portfolio/PortfolioIndex.tsx`

- [ ] **Step 1: Write the component**

```tsx
// src/components/sections/portfolio/PortfolioIndex.tsx
import Link from 'next/link';
import type { PortfolioItem } from '@/types/portal';
import { CATEGORY_ACCENT, CATEGORY_LABEL } from '@/data/portfolio-config';
import { PortfolioFolioDivider } from './PortfolioFolioDivider';

interface Props {
  items: PortfolioItem[];
  startIndex: number; // 1 if no featured, 2 if featured
}

const MONO = 'var(--font-geist-mono), ui-monospace, monospace';
const SERIF = 'var(--font-instrument-serif), ui-serif, Georgia, serif';

export function PortfolioIndex({ items, startIndex }: Props) {
  return (
    <section>
      <PortfolioFolioDivider
        title="Folio II —"
        italicWord="The Index"
        count={`${items.length} case${items.length === 1 ? '' : 's'}`}
      />

      <div className="pt-1">
        {items.map((item, i) => {
          const accent = CATEGORY_ACCENT[item.category];
          const indexLabel = String(startIndex + i).padStart(2, '0');
          const year = new Date(item.created_at).getFullYear();
          const metric = item.outcome_metrics?.[0];
          const thumb = item.images?.[0];

          return (
            <Link
              key={item.id}
              href={`/portfolio/${item.slug}`}
              className="portfolio-row group block"
              style={
                {
                  '--row-accent': accent,
                } as React.CSSProperties
              }
            >
              {/* Desktop grid */}
              <div
                className="hidden lg:grid items-center gap-6 py-[22px] px-2 portfolio-row-grid transition-colors"
                style={{
                  gridTemplateColumns: '36px 60px 1fr 180px 140px 50px',
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                }}
              >
                <span style={{ fontFamily: MONO, fontSize: 11, color: '#475569' }}>{indexLabel}</span>
                <span
                  className="block"
                  style={{
                    width: 60,
                    height: 42,
                    borderRadius: 6,
                    border: '1px solid rgba(255,255,255,0.06)',
                    background: thumb
                      ? `url(${thumb}) center / cover no-repeat`
                      : 'linear-gradient(135deg, #1a2030, #0f1420)',
                  }}
                />
                <span>
                  <span
                    className="block font-bold text-white"
                    style={{ fontSize: 22, letterSpacing: '-0.015em' }}
                  >
                    {item.title}
                  </span>
                  <span
                    className="block mt-1"
                    style={{
                      fontFamily: MONO,
                      fontWeight: 400,
                      fontSize: 10,
                      letterSpacing: '0.22em',
                      textTransform: 'uppercase',
                      color: '#64748b',
                    }}
                  >
                    {CATEGORY_LABEL[item.category]} · {year}
                  </span>
                </span>
                <span
                  className="line-clamp-2"
                  style={{ fontSize: 12.5, color: '#94a3b8', lineHeight: 1.5 }}
                >
                  {item.description}
                </span>
                <span className="text-right">
                  <span
                    className="block"
                    style={{
                      fontFamily: SERIF,
                      fontStyle: 'italic',
                      fontSize: 38,
                      lineHeight: 1,
                      color: accent,
                    }}
                  >
                    {metric?.value ?? '—'}
                  </span>
                  {metric?.label && (
                    <span
                      className="block mt-1.5"
                      style={{
                        fontFamily: MONO,
                        fontSize: 9,
                        letterSpacing: '0.24em',
                        textTransform: 'uppercase',
                        color: '#64748b',
                      }}
                    >
                      {metric.label}
                    </span>
                  )}
                </span>
                <span
                  className="text-right portfolio-row-arrow transition-all"
                  style={{
                    fontFamily: SERIF,
                    fontStyle: 'italic',
                    fontSize: 26,
                    color: '#475569',
                  }}
                >
                  →
                </span>
              </div>

              {/* Mobile card */}
              <div
                className="lg:hidden p-5 rounded-2xl mb-4 transition-colors portfolio-row-card"
                style={{
                  border: '1px solid rgba(255,255,255,0.06)',
                  background: 'rgba(255,255,255,0.01)',
                }}
              >
                <div
                  className="-mx-5 -mt-5 mb-4 h-32 overflow-hidden rounded-t-2xl"
                  style={{
                    background: thumb
                      ? `url(${thumb}) center / cover no-repeat`
                      : 'linear-gradient(135deg, #1a2030, #0f1420)',
                  }}
                />
                <div className="flex items-center justify-between mb-2">
                  <span style={{ fontFamily: MONO, fontSize: 11, color: '#475569' }}>{indexLabel}</span>
                  <span
                    style={{
                      fontFamily: MONO,
                      fontSize: 9,
                      letterSpacing: '0.24em',
                      textTransform: 'uppercase',
                      color: '#64748b',
                    }}
                  >
                    {CATEGORY_LABEL[item.category]} · {year}
                  </span>
                </div>
                <h3 className="text-white font-bold text-lg mb-2">{item.title}</h3>
                <p className="text-xs mb-3" style={{ color: '#94a3b8', lineHeight: 1.5 }}>
                  {item.description}
                </p>
                <div className="flex items-end justify-between">
                  <span
                    style={{
                      fontFamily: SERIF,
                      fontStyle: 'italic',
                      fontSize: 30,
                      lineHeight: 1,
                      color: accent,
                    }}
                  >
                    {metric?.value ?? '—'}
                  </span>
                  <span
                    style={{
                      fontFamily: SERIF,
                      fontStyle: 'italic',
                      fontSize: 24,
                      color: '#475569',
                    }}
                  >
                    →
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Add the row hover styles to globals.css**

Open `src/app/globals.css` and append:

```css
.portfolio-row:hover .portfolio-row-grid {
  background: rgba(255, 255, 255, 0.02);
  box-shadow: inset 3px 0 0 var(--row-accent, #00F0FF);
}
.portfolio-row:hover .portfolio-row-arrow {
  color: #fff;
  transform: translate(2px, -2px);
}
.portfolio-row:hover .portfolio-row-card {
  border-color: rgba(255, 255, 255, 0.12);
  box-shadow: inset 3px 0 0 var(--row-accent, #00F0FF);
}
```

- [ ] **Step 3: Verify lint + build**

Run: `npm run lint && npm run build`
Expected: clean.

- [ ] **Step 4: (Optional) Commit**

```bash
git add src/components/sections/portfolio/PortfolioIndex.tsx src/app/globals.css
git commit -m "feat(portfolio): add indexed-row Folio II layout"
```

---

## Task 8: Create `PortfolioColophon`

**Files:**
- Create: `src/components/sections/portfolio/PortfolioColophon.tsx`

- [ ] **Step 1: Write the component**

```tsx
// src/components/sections/portfolio/PortfolioColophon.tsx
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { DISPATCH_NUMBER, VOLUME } from '@/data/portfolio-config';

const MONO = 'var(--font-geist-mono), ui-monospace, monospace';
const SERIF = 'var(--font-instrument-serif), ui-serif, Georgia, serif';

export function PortfolioColophon() {
  return (
    <section
      className="mt-24 pt-12 grid gap-x-[60px] gap-y-10 items-center grid-cols-1 lg:grid-cols-[1.5fr_1fr]"
      style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}
    >
      <div>
        <div
          style={{
            fontFamily: SERIF,
            fontStyle: 'italic',
            fontSize: 120,
            lineHeight: 0.85,
            backgroundImage: 'linear-gradient(120deg, #00F0FF, #7C3AED)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
            marginBottom: 12,
          }}
        >
          Fin.
        </div>
        <p
          style={{
            fontFamily: MONO,
            fontSize: 10,
            letterSpacing: '0.28em',
            textTransform: 'uppercase',
            color: '#475569',
          }}
        >
          End of issue · No. {DISPATCH_NUMBER} · Vol. {VOLUME}
        </p>
      </div>

      <div>
        <h3
          style={{
            fontFamily: SERIF,
            fontStyle: 'italic',
            fontSize: 36,
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
            marginBottom: 12,
          }}
        >
          Inspired by these results?
        </h3>
        <p style={{ color: '#94a3b8', fontSize: 14, lineHeight: 1.55, marginBottom: 18 }}>
          Forty-five minutes. Tell us what you&apos;re building. We&apos;ll tell you what it actually needs.
        </p>
        <Link
          href="/contact"
          className="inline-flex items-center gap-2.5 rounded-full font-semibold transition-opacity hover:opacity-90"
          style={{ background: '#fff', color: '#02040A', padding: '13px 24px', fontSize: 13 }}
        >
          Book a discovery <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify lint + build**

Run: `npm run lint && npm run build`
Expected: clean.

- [ ] **Step 3: (Optional) Commit**

```bash
git add src/components/sections/portfolio/PortfolioColophon.tsx
git commit -m "feat(portfolio): add colophon (Fin. + discovery CTA)"
```

---

## Task 9: Replace `src/app/portfolio/page.tsx`

**Files:**
- Modify: `src/app/portfolio/page.tsx` — full replacement (delete the current 318-line client component)

- [ ] **Step 1: Replace the file contents**

Overwrite `src/app/portfolio/page.tsx` with:

```tsx
// src/app/portfolio/page.tsx
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { supabaseAdmin } from '@/lib/supabase/server';
import { PortfolioMasthead } from '@/components/sections/portfolio/PortfolioMasthead';
import { PortfolioFeatured } from '@/components/sections/portfolio/PortfolioFeatured';
import { PortfolioIndex } from '@/components/sections/portfolio/PortfolioIndex';
import { PortfolioColophon } from '@/components/sections/portfolio/PortfolioColophon';
import type { PortfolioItem } from '@/types/portal';

export const revalidate = 60; // server-render with light caching

export default async function PortfolioPage() {
  const { data } = await supabaseAdmin
    .from('portfolio_items')
    .select('*')
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false });

  const items = (data ?? []) as PortfolioItem[];
  const featured = items.find((it) => it.featured) ?? null;
  const rest = featured ? items.filter((it) => it.id !== featured.id) : items;
  const startIndex = featured ? 2 : 1;

  return (
    <div className="flex flex-col min-h-screen" style={{ background: '#02040A', color: '#f5f5f7' }}>
      <Navbar />
      <main className="flex-1 relative overflow-hidden">
        {/* Background radial washes */}
        <span
          aria-hidden="true"
          className="absolute top-0 right-0 pointer-events-none"
          style={{
            width: 700,
            height: 500,
            background: 'rgba(0,240,255,0.06)',
            filter: 'blur(140px)',
            borderRadius: '50%',
          }}
        />
        <span
          aria-hidden="true"
          className="absolute top-0 left-0 pointer-events-none"
          style={{
            width: 600,
            height: 400,
            background: 'rgba(124,58,237,0.07)',
            filter: 'blur(140px)',
            borderRadius: '50%',
          }}
        />

        <div className="relative z-10 mx-auto max-w-[1240px] px-6 lg:px-12 pt-36 pb-20">
          <PortfolioMasthead casesLive={items.length} />
          {featured && <PortfolioFeatured item={featured} totalCases={items.length} />}
          {rest.length > 0 && <PortfolioIndex items={rest} startIndex={startIndex} />}
          <PortfolioColophon />
        </div>
      </main>
      <Footer />
    </div>
  );
}
```

- [ ] **Step 2: Verify lint + build**

Run: `npm run lint && npm run build`
Expected: clean. Build output should list `/portfolio` as a `Dynamic` or `Static` route — NOT as a client-bundle chunk. Check that the build output does not contain a route warning about `"use client"` for `/portfolio`.

- [ ] **Step 3: Browser check (no real content yet — empty state OK)**

If the dev server isn't already running, start it: `npm run dev`. Open `http://localhost:3001/portfolio`. Expected:
- Masthead renders with today's date and the giant gradient headline.
- Folio II — The Index renders with whatever rows exist (they'll have default `web-engineering` category and no metrics; rows show `—` in the metric slot).
- Colophon renders at the bottom.
- No featured spread (no row has `featured = true` yet — that's Task 10).
- No console errors.

- [ ] **Step 4: (Optional) Commit**

```bash
git add src/app/portfolio/page.tsx
git commit -m "feat(portfolio): replace index page with server-rendered editorial layout"
```

---

## Task 10: Backfill one demo featured row

**Files:**
- None to create. SQL-only operation.

- [ ] **Step 1: Pick a real existing row**

Run:
```bash
psql "$SUPABASE_DB_URL" -c "SELECT id, title, slug FROM portfolio_items ORDER BY created_at DESC LIMIT 5;"
```

Pick the most flagship-looking entry. Note its `slug`.

- [ ] **Step 2: Backfill that row with featured-spread content**

Substitute `<chosen-slug>` below. Adjust the prose values to match the actual project (these are placeholders representing the shape; the user can refine via the admin form afterwards).

```sql
UPDATE portfolio_items
SET
  category = 'ecosystem',
  accent_word = 'Treasury.',
  pull_quote = 'They rebuilt our entire treasury stack — web, mobile, and the agent layer — in eleven weeks. Conversion tripled in the first quarter.',
  outcome_metrics = '[
    {"value": "+342%", "label": "Conversion"},
    {"value": "11 wk", "label": "To launch"}
  ]'::jsonb,
  featured = true,
  display_order = 0
WHERE slug = '<chosen-slug>';
```

- [ ] **Step 3: Browser check the featured spread**

Reload `http://localhost:3001/portfolio`. Expected:
- Folio I appears at the top of the content area with the picked row's title (line 1 = first word, line 2 = `Treasury.`), the pull-quote, two stats (`+342%` cyan, `11 wk` amber), and CTAs.
- That row no longer appears in Folio II — only the other rows do.
- Folio II numbering starts at `02`.

- [ ] **Step 4: Backfill remaining rows with at least one metric each (optional but reduces ugly `—` placeholders)**

Loop through remaining rows and give each a plausible single metric and a category. Example for one row:

```sql
UPDATE portfolio_items
SET
  category = 'web-engineering',
  outcome_metrics = '[{"value": "99 / 100", "label": "Lighthouse"}]'::jsonb
WHERE slug = 'lumeo-health-platform';
```

Repeat per row with the user's actual data. Skipping this step is acceptable — the page just shows `—` in the metric slot for ungroomed rows.

- [ ] **Step 5: (Optional) Commit**

No file changes — nothing to commit. SQL was applied directly to the DB.

---

## Task 11: Add admin form fields

**Files:**
- Modify: `src/app/portal/admin/portfolio/page.tsx`

- [ ] **Step 1: Update the local `PortfolioItemData` interface**

In `src/app/portal/admin/portfolio/page.tsx`, find the `interface PortfolioItemData { ... }` block (around line 20-31) and replace it with:

```ts
import type { OutcomeMetric, PortfolioCategory } from '@/types/portal';

interface PortfolioItemData {
  id: string;
  title: string;
  slug: string;
  description: string;
  case_study: string;
  tech_tags: string[];
  client_name: string | null;
  live_url: string | null;
  images: string[];
  created_at: string;
  category: PortfolioCategory;
  accent_word: string | null;
  pull_quote: string | null;
  outcome_metrics: OutcomeMetric[];
  featured: boolean;
  display_order: number;
}
```

- [ ] **Step 2: Update the `form` state initializer**

Find `const [form, setForm] = useState({ ... });` (around line 41-49) and extend the initial object:

```tsx
const [form, setForm] = useState({
  title: '',
  description: '',
  case_study: '',
  tech_tags: '',
  client_name: '',
  live_url: '',
  images: [] as string[],
  category: 'web-engineering' as PortfolioCategory,
  accent_word: '',
  pull_quote: '',
  outcome_metrics: [] as OutcomeMetric[],
  featured: false,
  display_order: 0,
});
```

- [ ] **Step 3: Update `openNew` and `openEdit` to handle the new fields**

Replace `openNew`:

```tsx
function openNew() {
  setEditingId(null);
  setForm({
    title: '',
    description: '',
    case_study: '',
    tech_tags: '',
    client_name: '',
    live_url: '',
    images: [],
    category: 'web-engineering',
    accent_word: '',
    pull_quote: '',
    outcome_metrics: [],
    featured: false,
    display_order: 0,
  });
  setShowEditor(true);
}
```

Replace `openEdit`:

```tsx
function openEdit(item: PortfolioItemData) {
  setEditingId(item.id);
  setForm({
    title: item.title,
    description: item.description,
    case_study: item.case_study || '',
    tech_tags: item.tech_tags.join(', '),
    client_name: item.client_name || '',
    live_url: item.live_url || '',
    images: item.images || [],
    category: item.category ?? 'web-engineering',
    accent_word: item.accent_word ?? '',
    pull_quote: item.pull_quote ?? '',
    outcome_metrics: item.outcome_metrics ?? [],
    featured: item.featured ?? false,
    display_order: item.display_order ?? 0,
  });
  setShowEditor(true);
}
```

- [ ] **Step 4: Extend the `handleSave` payload**

Find `const payload = { ... };` inside `handleSave` (around line 85) and replace with:

```tsx
const payload = {
  title: form.title,
  slug,
  description: form.description,
  case_study: form.case_study,
  tech_tags: form.tech_tags.split(',').map((t) => t.trim()).filter(Boolean),
  client_name: form.client_name || null,
  live_url: form.live_url || null,
  images: form.images,
  category: form.category,
  accent_word: form.accent_word.trim() || null,
  pull_quote: form.pull_quote.trim() || null,
  outcome_metrics: form.outcome_metrics,
  featured: form.featured,
  display_order: Number(form.display_order) || 0,
};
```

- [ ] **Step 5: Add outcome-metric repeater handlers**

Right above the `return (` of the component (around line 140), add:

```tsx
function addMetric() {
  setForm((prev) => ({
    ...prev,
    outcome_metrics: [...prev.outcome_metrics, { value: '', label: '' }],
  }));
}
function updateMetric(idx: number, field: 'value' | 'label', val: string) {
  setForm((prev) => ({
    ...prev,
    outcome_metrics: prev.outcome_metrics.map((m, i) => (i === idx ? { ...m, [field]: val } : m)),
  }));
}
function removeMetric(idx: number) {
  setForm((prev) => ({
    ...prev,
    outcome_metrics: prev.outcome_metrics.filter((_, i) => i !== idx),
  }));
}
```

- [ ] **Step 6: Add the new form inputs inside the editor modal**

Find the existing `<div>` containing the Tech Tags input (around line 204-207). Right AFTER that div (and before the Project Images block), insert the following five sections:

```tsx
{/* Category + Featured + Order row */}
<div className="grid grid-cols-3 gap-4">
  <div>
    <label className="block text-sm font-medium text-[#94A3B8] mb-2">Category</label>
    <select
      className={inputClass}
      value={form.category}
      onChange={(e) => setForm({ ...form, category: e.target.value as PortfolioCategory })}
    >
      <option value="ai-automation">AI Automation</option>
      <option value="web-engineering">Web Engineering</option>
      <option value="mobile-ecosystem">Mobile Ecosystem</option>
      <option value="ecosystem">Ecosystem</option>
    </select>
  </div>
  <div>
    <label className="block text-sm font-medium text-[#94A3B8] mb-2">Display order</label>
    <input
      type="number"
      className={inputClass}
      value={form.display_order}
      onChange={(e) => setForm({ ...form, display_order: Number(e.target.value) })}
    />
    <p className="text-[10px] text-[#64748B] mt-1">Lower numbers sort first.</p>
  </div>
  <div>
    <label className="block text-sm font-medium text-[#94A3B8] mb-2">Featured?</label>
    <label className="flex items-center gap-2 h-[42px] px-4 rounded-lg border border-white/10 bg-[#02040A]">
      <input
        type="checkbox"
        checked={form.featured}
        onChange={(e) => setForm({ ...form, featured: e.target.checked })}
      />
      <span className="text-xs text-[#94A3B8]">Show in the featured spread</span>
    </label>
    <p className="text-[10px] text-[#64748B] mt-1">
      Only one row is shown as featured. Lowest display order wins.
    </p>
  </div>
</div>

{/* Accent word */}
<div>
  <label className="block text-sm font-medium text-[#94A3B8] mb-2">
    Accent word <span className="text-[#64748B]">(featured-spread title, line 2)</span>
  </label>
  <input
    className={inputClass}
    placeholder='e.g. "Treasury."'
    value={form.accent_word}
    onChange={(e) => setForm({ ...form, accent_word: e.target.value })}
  />
</div>

{/* Pull quote */}
<div>
  <label className="block text-sm font-medium text-[#94A3B8] mb-2">
    Pull quote <span className="text-[#64748B]">(featured-spread only)</span>
  </label>
  <textarea
    rows={2}
    className={inputClass + ' resize-none'}
    placeholder="One quotable line from the engagement..."
    value={form.pull_quote}
    onChange={(e) => setForm({ ...form, pull_quote: e.target.value })}
  />
</div>

{/* Outcome metrics repeater */}
<div>
  <label className="block text-sm font-medium text-[#94A3B8] mb-2">
    Outcome metrics <span className="text-[#64748B]">(index uses [0]; featured uses [0] + [1])</span>
  </label>
  <div className="space-y-2">
    {form.outcome_metrics.map((m, i) => (
      <div key={i} className="flex gap-2 items-center">
        <input
          className={inputClass}
          placeholder="Value (e.g. +342%)"
          value={m.value}
          onChange={(e) => updateMetric(i, 'value', e.target.value)}
        />
        <input
          className={inputClass}
          placeholder="Label (e.g. Conversion)"
          value={m.label}
          onChange={(e) => updateMetric(i, 'label', e.target.value)}
        />
        <button
          type="button"
          onClick={() => removeMetric(i)}
          className="px-3 py-2 rounded-lg border border-white/10 text-[#94A3B8] hover:text-red-400 hover:border-red-400/40"
          aria-label="Remove metric"
        >
          ×
        </button>
      </div>
    ))}
    <button
      type="button"
      onClick={addMetric}
      className="text-xs text-[#00F0FF] hover:text-white transition-colors"
    >
      + Add metric
    </button>
  </div>
</div>
```

- [ ] **Step 7: Update `loadItems` to select the new fields (no code change needed)**

`loadItems` already uses `select('*')` — no change required. Confirm by reading the function.

- [ ] **Step 8: Verify lint + build**

Run: `npm run lint && npm run build`
Expected: clean.

- [ ] **Step 9: Browser-check the admin form**

Open `http://localhost:3001/portal/admin/portfolio`. Click the row you backfilled in Task 10. Expected:
- Category dropdown reflects `Ecosystem`.
- Featured checkbox is checked.
- Display order shows 0.
- Accent word shows `Treasury.`.
- Pull quote shows the demo text.
- Outcome metrics shows two paired-input rows with the populated values.

Edit one of the metric values to something different (e.g. `+999%`), hit Update, refresh `http://localhost:3001/portfolio`, confirm the featured spread shows the new value.

- [ ] **Step 10: (Optional) Commit**

```bash
git add src/app/portal/admin/portfolio/page.tsx
git commit -m "feat(portfolio): admin form fields for redesign columns"
```

---

## Task 12: Final verification pass

**Files:** none — pure verification.

- [ ] **Step 1: Lint + build clean from a cold cache**

```bash
rm -rf .next
npm run lint
npm run build
```
Expected: both succeed. The build summary should list `/portfolio` and `/portal/admin/portfolio` without errors.

- [ ] **Step 2: Visual diff against the mockup at 1440px**

Open `http://localhost:3001/portfolio` and `http://localhost:6033/direction-b-index.html` in two browser tabs at 1440px width. Walk top-to-bottom:
- Top rule (`Live · YYYY.MM.DD … Dispatch № 06 …`) — same spacing, same colors.
- Headline `The Work / Issue.` — gradient on `Work`, italic, same approximate size.
- Meta-ledger + lede — left column dashed rows, right column dropcap + `the number we moved` italicized.
- Folio I featured spread — cover image, kicker, italic title with gradient `Treasury.`, pull quote in quotes, two stats (cyan + amber), white pill CTA + cyan-underlined View live.
- Folio II row hover — left-edge accent stripe appears, arrow nudges up-right.
- Colophon — giant `Fin.` gradient, discovery CTA.

Note any deltas. Anything outside a tight tolerance is a fix-it candidate before reporting done.

- [ ] **Step 3: Reduced-motion check**

Chrome DevTools → Rendering → emulate `prefers-reduced-motion: reduce`. Reload `/portfolio`. The pulsing live dot in the top rule and folio dividers should stop. Row hover should still work.

- [ ] **Step 4: Keyboard a11y**

Tab through `/portfolio` from the top of `main`. Expected reachable in order: featured CTA `Read the case`, featured `View live` link (if present), each Folio II row link, colophon `Book a discovery` link. Focus rings visible on each.

- [ ] **Step 5: Mobile check at 390px**

DevTools → device mode → iPhone 14 (390×844). Reload. Expected:
- Masthead headline scales down (`clamp` does the work).
- Meta-ledger collapses to single column above the lede.
- Featured spread stacks (cover above copy).
- Folio II rows render as cards instead of the desktop grid.
- Colophon stacks.

- [ ] **Step 6: Report results**

Summarize: lint ✅, build ✅, visual match ✅, reduced-motion ✅, a11y ✅, mobile ✅. Flag any deltas that need a follow-up before announcing done.

- [ ] **Step 7: (Optional) Final commit + log a remaining-work note**

If the user has approved commits, this is a good checkpoint to squash or amend the per-task commits into a clean feature commit:

```bash
git log --oneline -n 12   # review the per-task commits
# Then either leave as-is or interactive-rebase into a tighter history
```

Out of scope reminder (for future sessions):
- `/portfolio/[slug]` redesign — separate spec, separate session.
- Admin UI redesign — kept the existing modal style; only added fields.
- The remaining slug-page columns (`elevator`, `duration_weeks`, `status`, `case_body`, `cover_caption`, `image_captions`, `testimonial_quote`, `testimonial_author`, `testimonial_role`, `client_logo_url`, `stack_headline`) land in the next migration.
