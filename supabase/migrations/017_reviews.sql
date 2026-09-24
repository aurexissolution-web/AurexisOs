-- ══════════════════════════════════════════════════════════════
-- Reviews — public-submitted, admin-moderated client reviews.
-- Public CAN insert (auto-pending) + read approved only.
-- Admin CAN read/update/delete everything.
-- ══════════════════════════════════════════════════════════════

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'review_status') THEN
    CREATE TYPE review_status AS ENUM ('pending', 'approved', 'rejected');
  END IF;
END$$;

CREATE TABLE IF NOT EXISTS reviews (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT '',
  rating        INT  NOT NULL CHECK (rating BETWEEN 1 AND 5),
  content       TEXT NOT NULL CHECK (char_length(content) BETWEEN 8 AND 320),
  avatar_key    TEXT NOT NULL DEFAULT 'cyan',
  email         TEXT,
  status        review_status NOT NULL DEFAULT 'pending',
  featured      BOOLEAN NOT NULL DEFAULT false,
  admin_notes   TEXT NOT NULL DEFAULT '',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  approved_at   TIMESTAMPTZ,
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS reviews_status_idx     ON reviews (status);
CREATE INDEX IF NOT EXISTS reviews_approved_idx   ON reviews (approved_at DESC) WHERE status = 'approved';
CREATE INDEX IF NOT EXISTS reviews_featured_idx   ON reviews (featured) WHERE featured = true AND status = 'approved';

-- ── updated_at trigger ─────────────────────────────────────────
CREATE OR REPLACE FUNCTION set_reviews_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS reviews_updated_at ON reviews;
CREATE TRIGGER reviews_updated_at
  BEFORE UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION set_reviews_updated_at();

-- ── RLS ────────────────────────────────────────────────────────
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public insert pending review"   ON reviews;
DROP POLICY IF EXISTS "Public read approved reviews"   ON reviews;
DROP POLICY IF EXISTS "Admins manage reviews"          ON reviews;

-- Anyone (even unauthenticated) can submit a review, but it MUST start as pending.
CREATE POLICY "Public insert pending review" ON reviews
  FOR INSERT
  WITH CHECK (status = 'pending');

-- Anyone can read approved reviews (this is what the public site needs).
CREATE POLICY "Public read approved reviews" ON reviews
  FOR SELECT
  USING (status = 'approved');

-- Admins can do everything — including read pending/rejected for moderation.
CREATE POLICY "Admins manage reviews" ON reviews
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM client_profiles
      WHERE client_profiles.user_id = auth.uid()
        AND client_profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM client_profiles
      WHERE client_profiles.user_id = auth.uid()
        AND client_profiles.role = 'admin'
    )
  );
