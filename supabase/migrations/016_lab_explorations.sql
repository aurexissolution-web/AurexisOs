-- ══════════════════════════════════════════════════════════════
-- Lab Explorations — public-read content for /the-lab page.
-- Lab Notes are NOT a separate table — they reuse blog_posts
-- with a 'lab' tag plus a pillar tag (ecosystem|ai|web|app).
-- ══════════════════════════════════════════════════════════════

-- ── Table ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS lab_explorations (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug                  TEXT UNIQUE NOT NULL,
  pillar                TEXT NOT NULL CHECK (pillar IN ('ecosystem','ai','web','app')),
  type                  TEXT NOT NULL CHECK (type IN ('interactive','mockup','prototype','video','case')),
  status_tone           TEXT NOT NULL DEFAULT 'live' CHECK (status_tone IN ('live','build')),
  status_label          TEXT NOT NULL DEFAULT 'LIVE',
  hook                  TEXT NOT NULL DEFAULT '',
  title                 TEXT NOT NULL,
  description           TEXT NOT NULL DEFAULT '',
  thumbnail             TEXT,
  outcome               TEXT NOT NULL DEFAULT '',
  primary_cta_label     TEXT NOT NULL DEFAULT '',
  primary_cta_href      TEXT NOT NULL DEFAULT '#',
  secondary_cta_label   TEXT,
  secondary_cta_href    TEXT,
  note_title            TEXT,
  note_href             TEXT,
  is_featured           BOOLEAN NOT NULL DEFAULT false,
  display_order         INT NOT NULL DEFAULT 0,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS lab_explorations_pillar_idx   ON lab_explorations (pillar);
CREATE INDEX IF NOT EXISTS lab_explorations_featured_idx ON lab_explorations (is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS lab_explorations_order_idx    ON lab_explorations (display_order, created_at DESC);

-- ── updated_at trigger ─────────────────────────────────────────
CREATE OR REPLACE FUNCTION set_lab_explorations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS lab_explorations_updated_at ON lab_explorations;
CREATE TRIGGER lab_explorations_updated_at
  BEFORE UPDATE ON lab_explorations
  FOR EACH ROW EXECUTE FUNCTION set_lab_explorations_updated_at();

-- ── RLS — public read, admin write ─────────────────────────────
ALTER TABLE lab_explorations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read lab explorations"  ON lab_explorations;
DROP POLICY IF EXISTS "Admins manage lab explorations" ON lab_explorations;

CREATE POLICY "Public read lab explorations" ON lab_explorations
  FOR SELECT
  USING (true);

CREATE POLICY "Admins manage lab explorations" ON lab_explorations
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

-- ── Thumbnails bucket ──────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'lab-thumbnails',
  'lab-thumbnails',
  true, -- public so thumbnails render directly on the marketing page
  10485760, -- 10 MB
  ARRAY['image/png','image/jpeg','image/jpg','image/webp','image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS for lab-thumbnails: public read, admin write.
DROP POLICY IF EXISTS "Public read lab thumbnails"   ON storage.objects;
DROP POLICY IF EXISTS "Admins upload lab thumbnails" ON storage.objects;
DROP POLICY IF EXISTS "Admins update lab thumbnails" ON storage.objects;
DROP POLICY IF EXISTS "Admins delete lab thumbnails" ON storage.objects;

CREATE POLICY "Public read lab thumbnails" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'lab-thumbnails');

CREATE POLICY "Admins upload lab thumbnails" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'lab-thumbnails'
    AND EXISTS (
      SELECT 1 FROM client_profiles
      WHERE client_profiles.user_id = auth.uid() AND client_profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins update lab thumbnails" ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'lab-thumbnails'
    AND EXISTS (
      SELECT 1 FROM client_profiles
      WHERE client_profiles.user_id = auth.uid() AND client_profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins delete lab thumbnails" ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'lab-thumbnails'
    AND EXISTS (
      SELECT 1 FROM client_profiles
      WHERE client_profiles.user_id = auth.uid() AND client_profiles.role = 'admin'
    )
  );
