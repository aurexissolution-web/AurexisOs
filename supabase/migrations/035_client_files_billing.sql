-- 035_client_files_billing.sql
-- Client files (private storage), services bought, invoice tracking, and the
-- flag that stops a follow-up phone reminder being sent twice. Server-only
-- (service role after an admin check): RLS ON, no policies.

ALTER TABLE clients ADD COLUMN IF NOT EXISTS followup_notified_at TIMESTAMPTZ;

-- ── Files ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS client_files (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id     UUID        NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  name          TEXT        NOT NULL CHECK (char_length(name) BETWEEN 1 AND 200),
  kind          TEXT        NOT NULL DEFAULT 'other' CHECK (kind IN ('quote','invoice','contract','other')),
  storage_path  TEXT        NOT NULL UNIQUE,
  size_bytes    BIGINT      NOT NULL DEFAULT 0,
  mime_type     TEXT        NOT NULL DEFAULT '',
  uploaded_by   UUID,
  sent_at       TIMESTAMPTZ,
  sent_to       TEXT        NOT NULL DEFAULT '',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS client_files_client_idx ON client_files (client_id, created_at DESC);
ALTER TABLE client_files ENABLE ROW LEVEL SECURITY;

-- Private bucket: no public read, no policies. Files are opened through
-- short-lived signed links created on the server after an admin check.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('client-files', 'client-files', false, 20971520, ARRAY[
  'application/pdf','image/png','image/jpeg','image/webp',
  'application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain','text/csv','application/zip'
])
ON CONFLICT (id) DO NOTHING;

-- ── Services a client bought ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS client_services (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id       UUID        NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  solution        TEXT        NOT NULL DEFAULT 'other'
                    CHECK (solution IN ('presence','flow','core','connect','audit','other')),
  name            TEXT        NOT NULL CHECK (char_length(name) BETWEEN 1 AND 160),
  price_myr       NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (price_myr >= 0),
  status          TEXT        NOT NULL DEFAULT 'quoted'
                    CHECK (status IN ('quoted','in_progress','live','cancelled')),
  start_date      DATE,
  care_plan       TEXT        NOT NULL DEFAULT '',
  care_price_myr  NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (care_price_myr >= 0),
  renewal_date    DATE,
  notes           TEXT        NOT NULL DEFAULT '',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS client_services_client_idx ON client_services (client_id);
CREATE INDEX IF NOT EXISTS client_services_renewal_idx ON client_services (renewal_date) WHERE renewal_date IS NOT NULL;
ALTER TABLE client_services ENABLE ROW LEVEL SECURITY;

-- ── Invoice tracking (not accounting: what was billed and whether it is paid) ─
CREATE TABLE IF NOT EXISTS client_invoices (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id     UUID        NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  service_id    UUID        REFERENCES client_services(id) ON DELETE SET NULL,
  number        TEXT        NOT NULL DEFAULT '',
  description   TEXT        NOT NULL DEFAULT '',
  amount_myr    NUMERIC(12,2) NOT NULL CHECK (amount_myr >= 0),
  status        TEXT        NOT NULL DEFAULT 'sent' CHECK (status IN ('draft','sent','paid','void')),
  issued_on     DATE        NOT NULL DEFAULT CURRENT_DATE,
  due_on        DATE,
  paid_on       DATE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (status <> 'paid' OR paid_on IS NOT NULL)
);
CREATE INDEX IF NOT EXISTS client_invoices_client_idx ON client_invoices (client_id, issued_on DESC);
CREATE INDEX IF NOT EXISTS client_invoices_open_idx ON client_invoices (due_on) WHERE status = 'sent';
ALTER TABLE client_invoices ENABLE ROW LEVEL SECURITY;

-- ── Merge two clients into one (atomic: all-or-nothing) ──────────────────────
-- Everything on `drop_id` moves to `keep_id`, then `drop_id` is deleted.
-- Contacts and timeline entries that would duplicate one already on the kept
-- client (same email/phone, same source ref) are dropped, not doubled.
CREATE OR REPLACE FUNCTION merge_clients(keep_id UUID, drop_id UUID) RETURNS VOID
LANGUAGE plpgsql AS $$
DECLARE
  t TEXT;
BEGIN
  IF keep_id = drop_id THEN RAISE EXCEPTION 'Cannot merge a client into itself'; END IF;
  IF NOT EXISTS (SELECT 1 FROM clients WHERE id = keep_id) OR NOT EXISTS (SELECT 1 FROM clients WHERE id = drop_id) THEN
    RAISE EXCEPTION 'Both clients must exist';
  END IF;

  UPDATE client_contacts c SET client_id = keep_id
  WHERE c.client_id = drop_id
    AND NOT EXISTS (
      SELECT 1 FROM client_contacts k
      WHERE k.client_id = keep_id
        AND ((c.email_key IS NOT NULL AND k.email_key = c.email_key)
          OR (c.phone_key IS NOT NULL AND k.phone_key = c.phone_key))
    );

  UPDATE client_activity a SET client_id = keep_id
  WHERE a.client_id = drop_id
    AND (a.ref IS NULL OR NOT EXISTS (SELECT 1 FROM client_activity b WHERE b.client_id = keep_id AND b.ref = a.ref));

  UPDATE client_files    SET client_id = keep_id WHERE client_id = drop_id;
  UPDATE client_services SET client_id = keep_id WHERE client_id = drop_id;
  UPDATE client_invoices SET client_id = keep_id WHERE client_id = drop_id;
  UPDATE calendar_events SET client_id = keep_id WHERE client_id = drop_id;
  FOREACH t IN ARRAY ARRAY[
    'presence_quote_requests','flow_quote_requests','core_quote_requests',
    'connect_quote_requests','ai_readiness_audit_quote_requests','contact_messages','calculator_leads'
  ] LOOP
    EXECUTE format('UPDATE %I SET client_id = $1 WHERE client_id = $2', t) USING keep_id, drop_id;
  END LOOP;

  UPDATE clients k SET
    tags = (SELECT coalesce(array_agg(DISTINCT x), '{}') FROM unnest(k.tags || d.tags) AS x),
    notes = CASE WHEN d.notes = '' THEN k.notes
                 WHEN k.notes = '' THEN d.notes
                 ELSE k.notes || E'\n\n--- merged from ' || d.name || E' ---\n' || d.notes END,
    company = CASE WHEN k.company = '' THEN d.company ELSE k.company END,
    industry = CASE WHEN k.industry = '' THEN d.industry ELSE k.industry END,
    website = CASE WHEN k.website = '' THEN d.website ELSE k.website END,
    address = CASE WHEN k.address = '' THEN d.address ELSE k.address END,
    first_contact_at = LEAST(k.first_contact_at, d.first_contact_at),
    last_contact_at = GREATEST(k.last_contact_at, d.last_contact_at),
    next_followup_at = CASE WHEN k.next_followup_at IS NULL THEN d.next_followup_at ELSE k.next_followup_at END,
    next_followup_note = CASE WHEN k.next_followup_at IS NULL THEN d.next_followup_note ELSE k.next_followup_note END,
    status = CASE WHEN 'active' IN (k.status, d.status) THEN 'active' ELSE k.status END,
    updated_at = NOW()
  FROM clients d
  WHERE k.id = keep_id AND d.id = drop_id;

  INSERT INTO client_activity (client_id, kind, title, body)
  SELECT keep_id, 'status_change', 'Merged with another client record', 'Merged from: ' || name FROM clients WHERE id = drop_id;

  DELETE FROM clients WHERE id = drop_id;
END;
$$;
