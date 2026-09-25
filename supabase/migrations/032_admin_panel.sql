-- 032_admin_panel.sql
-- Schema for the /admin panel: a shared lead workflow across every form, a
-- case_studies table for /work, cover images for insights, one public media
-- bucket, and two security tightenings.
--
-- Every write from the panel goes through server actions using the service
-- role, after a server-side admin check — so none of the new tables get
-- public policies. RLS stays ON everywhere with no policy = server-only.

-- ── 1. Lead workflow on every inbound form ───────────────────────────────────
-- Same status vocabulary everywhere so the Command Center can filter one way.
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'presence_quote_requests', 'flow_quote_requests', 'core_quote_requests',
    'connect_quote_requests', 'ai_readiness_audit_quote_requests'
  ] LOOP
    EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS admin_notes  TEXT NOT NULL DEFAULT ''''', t);
    EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS contacted_at TIMESTAMPTZ', t);
    EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()', t);
    EXECUTE format('ALTER TABLE %I DROP CONSTRAINT IF EXISTS %I', t, t || '_status_check');
    EXECUTE format(
      'ALTER TABLE %I ADD CONSTRAINT %I CHECK (status IN (''new'',''contacted'',''qualified'',''won'',''lost'',''archived''))',
      t, t || '_status_check'
    );
  END LOOP;
END $$;

-- contact_messages predates the shared status column; derive it from contacted_at.
ALTER TABLE contact_messages
  ADD COLUMN IF NOT EXISTS status      TEXT        NOT NULL DEFAULT 'new',
  ADD COLUMN IF NOT EXISTS admin_notes TEXT        NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW();
UPDATE contact_messages SET status = 'contacted' WHERE contacted_at IS NOT NULL AND status = 'new';
ALTER TABLE contact_messages
  DROP CONSTRAINT IF EXISTS contact_messages_status_check,
  ADD CONSTRAINT contact_messages_status_check
    CHECK (status IN ('new','contacted','qualified','won','lost','archived'));

-- ── 2. Capacity-calculator leads (previously Google Sheets only) ──────────────
CREATE TABLE IF NOT EXISTS calculator_leads (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT        NOT NULL CHECK (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  staff         INTEGER     NOT NULL,
  wage          NUMERIC     NOT NULL,
  hours         NUMERIC     NOT NULL,
  annual_waste  NUMERIC     NOT NULL,
  status        TEXT        NOT NULL DEFAULT 'new'
                  CHECK (status IN ('new','contacted','qualified','won','lost','archived')),
  admin_notes   TEXT        NOT NULL DEFAULT '',
  contacted_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS calculator_leads_created_at_idx ON calculator_leads (created_at DESC);
ALTER TABLE calculator_leads ENABLE ROW LEVEL SECURITY;

-- ── 3. Case studies for /work ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS case_studies (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  slug                TEXT        NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  client_name         TEXT        NOT NULL,
  industry            TEXT        NOT NULL DEFAULT '',
  location            TEXT        NOT NULL DEFAULT '',
  outcome_headline    TEXT        NOT NULL,
  summary             TEXT        NOT NULL DEFAULT '',
  problem             TEXT        NOT NULL DEFAULT '',
  what_was_built      TEXT        NOT NULL DEFAULT '',
  result              TEXT        NOT NULL DEFAULT '',
  -- [{ "value": "3x", "label": "more enquiries" }, ...]
  metrics             JSONB       NOT NULL DEFAULT '[]'::jsonb,
  services            TEXT[]      NOT NULL DEFAULT '{}',   -- presence | flow | core | connect | audit
  tech_tags           TEXT[]      NOT NULL DEFAULT '{}',
  timeline            TEXT        NOT NULL DEFAULT '',
  live_url            TEXT,
  cover_image_url     TEXT,
  gallery             TEXT[]      NOT NULL DEFAULT '{}',
  testimonial_quote   TEXT        NOT NULL DEFAULT '',
  testimonial_author  TEXT        NOT NULL DEFAULT '',
  status              TEXT        NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published')),
  featured            BOOLEAN     NOT NULL DEFAULT false,
  display_order       INTEGER     NOT NULL DEFAULT 0,
  published_at        TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS case_studies_published_idx
  ON case_studies (featured DESC, display_order, published_at DESC) WHERE status = 'published';
ALTER TABLE case_studies ENABLE ROW LEVEL SECURITY;

-- ── 4. Insights: cover image + edit tracking ──────────────────────────────────
ALTER TABLE insights_posts
  ADD COLUMN IF NOT EXISTS cover_image_url TEXT,
  ADD COLUMN IF NOT EXISTS updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- ── 5. One public bucket for admin-uploaded images (insights + work) ─────────
-- Public read by URL; no write policies — uploads happen server-side only.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('site-media', 'site-media', true, 5242880,
        ARRAY['image/jpeg','image/png','image/webp','image/avif'])
ON CONFLICT (id) DO NOTHING;

-- ── 6. Security tightenings ───────────────────────────────────────────────────
-- 007's "Admin …" policies actually allowed ANY signed-in user to write
-- portfolio-images. Restrict them to real admins.
DROP POLICY IF EXISTS "Admin Upload Access" ON storage.objects;
DROP POLICY IF EXISTS "Admin Update Access" ON storage.objects;
DROP POLICY IF EXISTS "Admin Delete Access" ON storage.objects;
CREATE POLICY "Admin Upload Access" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'portfolio-images' AND public.is_admin());
CREATE POLICY "Admin Update Access" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'portfolio-images' AND public.is_admin());
CREATE POLICY "Admin Delete Access" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'portfolio-images' AND public.is_admin());

-- Reviews are now submitted through /api/reviews (validated + rate-limited on
-- the server). Close the direct anonymous-insert path so it can't be spammed.
DROP POLICY IF EXISTS "Public insert pending review" ON reviews;
