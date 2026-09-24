-- 025_insights_posts.sql
-- Stores posts for /insights and /insights/[slug]. Public reads happen
-- server-side via the service role (getInsightPosts / getInsightPostBySlug
-- in src/lib/insights.ts), filtered to status = 'published' in application
-- code — the same access pattern already used for portfolio_items (see
-- migration 005).

CREATE TABLE insights_posts (
  id             UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  slug           TEXT         NOT NULL UNIQUE,
  title          TEXT         NOT NULL,
  excerpt        TEXT         NOT NULL,
  body           TEXT         NOT NULL,
  published_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  status         TEXT         NOT NULL DEFAULT 'draft',
  created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

ALTER TABLE insights_posts
  ADD CONSTRAINT insights_posts_status_check
    CHECK (status IN ('draft', 'published'));

CREATE INDEX insights_posts_published_at_idx
  ON insights_posts (published_at DESC);

ALTER TABLE insights_posts ENABLE ROW LEVEL SECURITY;
-- No public policies: reads flow through the service role, filtered to
-- status = 'published' in code — the same access pattern as portfolio_items.
