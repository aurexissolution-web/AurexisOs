# Admin Command Center — premium dashboard rewrite

**Date:** 2026-06-17 · **Status:** Approved, executing

## Goal

Rebuild `/portal/admin` from a sparse 2-stat dashboard into a premium command center showing the full state of the company: revenue, profit, projects, P&L history, expense mix, recent invoices, content output, and inbound enquiries. Aesthetic: editorial-meets-financial-terminal (Stripe + Mercury + Bloomberg, dialed back with the site's editorial dispatch register).

## Layout (12-col asymmetric grid)

```
01 · COMMAND CENTER ──────────── kuala lumpur · live ●

[ REVENUE MTD · 7col big italic serif ] [ NET PROFIT MTD · 5col ]
                                        [ ACTIVE PROJECTS · 5col ]

02 · PROFIT & LOSS
[ P&L 12-month chart · 8col ]           [ INCOME MIX donut · 4col ]
[ EXPENSES BY CATEGORY · 6col ]         [ PROJECT FUNNEL · 6col ]

03 · ACTIVITY
[ RECENT INVOICES · 6col ] [ CONTENT · 3col ] [ INBOUND · 3col ]
```

## Data sources (all real Supabase queries — no mock)

| Widget | Table(s) |
|---|---|
| Revenue MTD + sparkline | `income_entries` summed by day, current month vs previous |
| Net Profit MTD | Revenue MTD − `expense_entries` MTD; margin % |
| Active Projects | `projects` count by phase; `target_launch_date` ≤ 14d |
| P&L 12-month chart | `income_entries` + `expense_entries` grouped by month |
| Income mix | `income_entries.type` (`recurring` vs `one_time`) sums |
| Expense categories | `expense_entries` grouped by `category`, MTD |
| Project funnel | `projects` count per `phase` |
| Recent invoices | `invoices` ORDER BY `created_at` DESC LIMIT 5 |
| Content pulse | `blog_posts` (published vs draft); `portfolio_items` (+ featured) |
| Inbound messages | `contact_messages` last 7d + most recent |

## Aesthetic spec

- **Grid:** CSS grid, 12 cols, 24px gap, max-w-7xl
- **Cards:** `bg-white/[0.015]` `border-white/[0.06]` radius 14px; hover lifts 1px + border cyan/30
- **Hero numerals:** Instrument Serif italic 72–96px (cyan gradient on revenue, white on profit)
- **Secondary numerals:** Plus Jakarta semibold 28–32px
- **Tabular figures:** JetBrains Mono 12.5px, tabular-nums
- **Labels:** JetBrains Mono uppercase 9.5px tracking-[0.24em] white/45
- **Section headers:** `01 · COMMAND CENTER ──── ts · live ●` (matches /portfolio masthead)
- **Deltas:** emerald up (▲), red down (▼), white/40 flat
- **Charts:** pure SVG, brand palette only — cyan (revenue), amber (expenses), emerald (profit), violet (secondary)
- **Empty states:** italic serif "No data yet · Add your first entry →" dotted-border card

## Files

```
docs/superpowers/plans/2026-06-17-admin-command-center.md   (this file)

src/lib/portal/dashboard-data.ts                            (data layer)
src/components/portal/dashboard/
  SectionHeader.tsx
  MetricCard.tsx
  Sparkline.tsx
  DeltaBadge.tsx
  LiveTimestamp.tsx
  DashboardHero.tsx
  PnLChart.tsx
  IncomeMixDonut.tsx
  ExpenseBreakdown.tsx
  ProjectFunnel.tsx
  RecentInvoices.tsx
  ContentPulse.tsx
  InboundMessages.tsx
```

Plus full rewrite of `src/app/portal/admin/page.tsx`.

## Phases

1. Data layer — single `fetchDashboardOverview()` with parallel queries + typed return
2. Shared primitives — SectionHeader, MetricCard, Sparkline, DeltaBadge, LiveTimestamp
3. Hero band — DashboardHero wired with real data
4. Charts band — PnL, IncomeMixDonut, ExpenseBreakdown, ProjectFunnel
5. Activity rail — RecentInvoices, ContentPulse, InboundMessages
6. Page rewrite — orchestrating with skeleton states + empty states
7. Verify — lint, build, eyeball

## Non-goals

- Not adding real-time websocket updates (poll on window focus only)
- Not adding chart drill-downs / time-range pickers
- Not touching the sub-pages (`/income`, `/expenses`, `/projects`)
- Not touching DB schema
- Not handling currency conversion — assumes MYR
- Not adding a chart library — all charts custom SVG
