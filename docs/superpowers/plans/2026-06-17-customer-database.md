# Customer Database — consolidate Projects + Documents + Invoices

**Date:** 2026-06-17 · **Status:** Approved, executing

## Goal

Replace three sibling admin pages (Projects, Documents, Invoices) with a single **Customers** section where each customer is the parent record and projects/invoices/documents/receipts live nested under them. Matches the actual mental model ("how's the Acme account doing?") instead of forcing the user to jump between three spreadsheet views.

## Model

```
Customer (top-level entity)
├── Profile (company name, contact, hosting, GitHub, live URL, status)
├── Projects     ← work we delivered for them
├── Invoices     ← what we sent them (paid/sent/overdue/draft)
├── Documents    ← what they sent us (briefs, signed contracts, NDAs)
└── Receipts     ← payment proof from invoices marked paid
```

## Schema (migration 014)

**New table** `customer_records`:
```sql
id uuid PK, slug text unique, company_name text, contact_name text,
contact_email text, contact_phone text, industry text, notes text,
github_url text, hosting_provider text, live_url text,
first_engaged_at date, status text default 'active', -- active|dormant|archived
created_at, updated_at
```

**Nullable FK columns** added to `projects`, `invoices`, `documents`:
- `customer_record_id uuid REFERENCES customer_records(id) ON DELETE SET NULL`

Existing `client_id` columns remain (nullable) for backwards compatibility. New code writes `customer_record_id`; reads happen via FK join.

RLS: admin role can read/write; everyone else denied.

## Routing

| Path | Purpose |
|---|---|
| `/portal/admin/customers` | List view (search, status filter) |
| `/portal/admin/customers/new` | Create customer form |
| `/portal/admin/customers/[slug]` | Detail with 5 tabs (overview / projects / invoices / documents / receipts) |
| `/portal/admin/customers/[slug]/edit` | Edit customer form |

Inline create flows for projects/invoices/documents live INSIDE the customer detail tabs (no separate routes).

## Sidebar nav (new shape)

```
Dashboard
Customers       ← NEW
Income
Expenses
Net Profit
Blog Engine
Portfolio
```

Removed: Project Control, Documents, Invoices.

## Files

```
docs/superpowers/plans/2026-06-17-customer-database.md   (this file)
supabase/migrations/014_customer_records.sql

src/types/portal.ts                                       (add CustomerRecord + nested types)
src/lib/portal/customer-data.ts                           (queries + mutations)

src/app/portal/admin/customers/
  page.tsx                                                (list)
  new/page.tsx                                            (create)
  [slug]/
    page.tsx                                              (detail)
    edit/page.tsx                                         (edit)

src/components/portal/customers/
  CustomerListRow.tsx
  CustomerDetailHeader.tsx
  CustomerForm.tsx
  CustomerOverviewTab.tsx
  CustomerProjectsTab.tsx
  CustomerInvoicesTab.tsx
  CustomerDocumentsTab.tsx
  CustomerReceiptsTab.tsx
  InlineCreateForm.tsx                                    (shared modal-like row for new project/invoice/doc)

src/app/portal/layout.tsx                                 (nav update)

DELETE:
  src/app/portal/admin/projects/
  src/app/portal/admin/documents/
  src/app/portal/admin/invoices/
```

## Aesthetic

Same editorial dispatch language as Command Center: Instrument Serif italic for headers, JetBrains Mono for tabular figures, cyan/violet/amber/emerald accents, dotted dividers, hairline cyan accent rules at section tops. List rows styled like /portfolio index.

## Non-goals

- Not building file-upload UI for documents (v1 uses URL field; user uploads to Supabase storage manually)
- Not migrating existing `client_profiles` data into `customer_records` (user has none)
- Not adding Stripe-payment flow to invoice creation (existing `/api/stripe/checkout` still works for paid invoices)
- Not touching the dashboard's "Recent Invoices" widget — it queries `invoices` directly, doesn't care about UI nesting
- Not adding bulk import / CSV upload
- Not adding customer-facing portal (admin-only views)

## Verification

- `npm run lint` clean
- `npm run build` clean
- User applies migration 014 in Supabase Dashboard manually
