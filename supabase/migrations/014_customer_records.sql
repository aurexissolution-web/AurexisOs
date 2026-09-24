-- ══════════════════════════════════════════════════════════════
-- Customer Records — consolidates projects, invoices, documents
-- under a single customer entity (admin CRM, not auth-coupled).
-- ══════════════════════════════════════════════════════════════

-- ── Enum ───────────────────────────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'customer_status') THEN
    CREATE TYPE customer_status AS ENUM ('active', 'dormant', 'archived');
  END IF;
END$$;

-- ── Table ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS customer_records (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug                TEXT UNIQUE NOT NULL,
  company_name        TEXT NOT NULL,
  contact_name        TEXT NOT NULL DEFAULT '',
  contact_email       TEXT NOT NULL DEFAULT '',
  contact_phone       TEXT NOT NULL DEFAULT '',
  industry            TEXT NOT NULL DEFAULT '',
  notes               TEXT NOT NULL DEFAULT '',
  github_url          TEXT,
  hosting_provider    TEXT,
  live_url            TEXT,
  first_engaged_at    DATE,
  status              customer_status NOT NULL DEFAULT 'active',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS customer_records_status_idx ON customer_records (status);
CREATE INDEX IF NOT EXISTS customer_records_slug_idx   ON customer_records (slug);

-- ── FK columns on existing tables ──────────────────────────────
ALTER TABLE projects  ADD COLUMN IF NOT EXISTS customer_record_id UUID REFERENCES customer_records(id) ON DELETE SET NULL;
ALTER TABLE invoices  ADD COLUMN IF NOT EXISTS customer_record_id UUID REFERENCES customer_records(id) ON DELETE SET NULL;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS customer_record_id UUID REFERENCES customer_records(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS projects_customer_record_idx  ON projects  (customer_record_id);
CREATE INDEX IF NOT EXISTS invoices_customer_record_idx  ON invoices  (customer_record_id);
CREATE INDEX IF NOT EXISTS documents_customer_record_idx ON documents (customer_record_id);

-- Relax legacy client_id columns so new rows can use customer_record_id only.
ALTER TABLE projects  ALTER COLUMN client_id DROP NOT NULL;
ALTER TABLE invoices  ALTER COLUMN client_id DROP NOT NULL;
ALTER TABLE documents ALTER COLUMN client_id DROP NOT NULL;

-- ── updated_at trigger ─────────────────────────────────────────
CREATE OR REPLACE FUNCTION set_customer_records_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS customer_records_updated_at ON customer_records;
CREATE TRIGGER customer_records_updated_at
  BEFORE UPDATE ON customer_records
  FOR EACH ROW EXECUTE FUNCTION set_customer_records_updated_at();

-- ── RLS ────────────────────────────────────────────────────────
ALTER TABLE customer_records ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins manage customer records" ON customer_records;
CREATE POLICY "Admins manage customer records" ON customer_records
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
