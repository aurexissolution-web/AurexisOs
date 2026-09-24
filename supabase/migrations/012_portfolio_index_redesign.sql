-- 012_portfolio_index_redesign.sql
-- Adds the six columns required by the redesigned /portfolio index:
--   category, accent_word, pull_quote, outcome_metrics, featured, display_order.
-- RLS state: migration 005 dropped the public anonymous SELECT policy on
-- portfolio_items; public reads now flow through server-side code using the
-- service role (e.g. /api/portfolio, /portfolio page.tsx via supabaseAdmin).
-- These new columns inherit that same access pattern — no policy work needed.

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
