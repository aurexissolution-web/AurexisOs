-- 034_clients.sql
-- Client database: one row per business/person, their contacts, and a
-- timeline of everything that happened. Enquiries already in the lead tables
-- are turned into clients here (matched on email), so it is never empty.
--
-- Written only by server actions (service role) after an admin check, so RLS
-- stays ON with no policies = server-only, like the lead and calendar tables.

-- ── Matching helpers ─────────────────────────────────────────────────────────
-- Malaysian numbers arrive as "012-345 6789", "+60 12 345 6789", "60123456789".
-- All normalise to 60123456789 so the same person matches across forms.
CREATE OR REPLACE FUNCTION norm_phone(p TEXT) RETURNS TEXT
LANGUAGE sql IMMUTABLE AS $$
  SELECT CASE
    WHEN d = '' THEN NULL
    WHEN d LIKE '00%' THEN substr(d, 3)
    WHEN d LIKE '0%'  THEN '6' || d
    ELSE d
  END
  FROM (SELECT regexp_replace(coalesce(p, ''), '\D', '', 'g') AS d) s
$$;

-- ── Clients ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS clients (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name                TEXT        NOT NULL CHECK (char_length(btrim(name)) BETWEEN 1 AND 160),
  company             TEXT        NOT NULL DEFAULT '',
  kind                TEXT        NOT NULL DEFAULT 'business' CHECK (kind IN ('business','individual')),
  status              TEXT        NOT NULL DEFAULT 'lead' CHECK (status IN ('lead','active','past','lost')),
  owner_id            UUID,
  industry            TEXT        NOT NULL DEFAULT '',
  source              TEXT        NOT NULL DEFAULT 'manual',
  website             TEXT        NOT NULL DEFAULT '',
  address             TEXT        NOT NULL DEFAULT '',
  tags                TEXT[]      NOT NULL DEFAULT '{}',
  notes               TEXT        NOT NULL DEFAULT '',
  first_contact_at    TIMESTAMPTZ,
  last_contact_at     TIMESTAMPTZ,
  next_followup_at    TIMESTAMPTZ,
  next_followup_note  TEXT        NOT NULL DEFAULT '',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS clients_name_idx ON clients (lower(name));
CREATE INDEX IF NOT EXISTS clients_status_idx ON clients (status);
CREATE INDEX IF NOT EXISTS clients_followup_idx ON clients (next_followup_at) WHERE next_followup_at IS NOT NULL;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- ── Contacts (several people per client) ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS client_contacts (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id   UUID        NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  name        TEXT        NOT NULL DEFAULT '',
  role        TEXT        NOT NULL DEFAULT '',
  email       TEXT        NOT NULL DEFAULT '',
  phone       TEXT        NOT NULL DEFAULT '',
  is_primary  BOOLEAN     NOT NULL DEFAULT false,
  email_key   TEXT GENERATED ALWAYS AS (NULLIF(lower(btrim(email)), '')) STORED,
  phone_key   TEXT GENERATED ALWAYS AS (norm_phone(phone)) STORED,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS client_contacts_client_idx ON client_contacts (client_id);
CREATE INDEX IF NOT EXISTS client_contacts_email_key_idx ON client_contacts (email_key) WHERE email_key IS NOT NULL;
CREATE INDEX IF NOT EXISTS client_contacts_phone_key_idx ON client_contacts (phone_key) WHERE phone_key IS NOT NULL;
ALTER TABLE client_contacts ENABLE ROW LEVEL SECURITY;

-- ── Timeline ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS client_activity (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id    UUID        NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  kind         TEXT        NOT NULL
                 CHECK (kind IN ('enquiry','email_sent','meeting','call','whatsapp','note','file','status_change','invoice','service')),
  title        TEXT        NOT NULL DEFAULT '',
  body         TEXT        NOT NULL DEFAULT '',
  occurred_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actor_id     UUID,
  -- Where an automatic entry came from ("presence:<uuid>", "event:<uuid>"), so
  -- the same source can never be logged twice.
  ref          TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS client_activity_client_idx ON client_activity (client_id, occurred_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS client_activity_ref_uniq ON client_activity (client_id, ref) WHERE ref IS NOT NULL;
ALTER TABLE client_activity ENABLE ROW LEVEL SECURITY;

-- ── Link existing records to a client ────────────────────────────────────────
ALTER TABLE presence_quote_requests           ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES clients(id) ON DELETE SET NULL;
ALTER TABLE flow_quote_requests               ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES clients(id) ON DELETE SET NULL;
ALTER TABLE core_quote_requests               ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES clients(id) ON DELETE SET NULL;
ALTER TABLE connect_quote_requests            ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES clients(id) ON DELETE SET NULL;
ALTER TABLE ai_readiness_audit_quote_requests ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES clients(id) ON DELETE SET NULL;
ALTER TABLE contact_messages                  ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES clients(id) ON DELETE SET NULL;
ALTER TABLE calculator_leads                  ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES clients(id) ON DELETE SET NULL;
ALTER TABLE calendar_events                   ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES clients(id) ON DELETE SET NULL;

-- ── Backfill: one client per distinct email found in past enquiries ──────────
-- Runs only while the clients table is empty, so re-running this file is safe.
DROP TABLE IF EXISTS _clients;
DROP TABLE IF EXISTS _src;
CREATE TEMP TABLE _src AS
SELECT 'presence'::text AS src, id, created_at, btrim(name) AS name, lower(btrim(email)) AS ekey,
       whatsapp AS phone, business_description AS company, status FROM presence_quote_requests
UNION ALL SELECT 'flow', id, created_at, btrim(name), lower(btrim(email)), whatsapp, business_description, status FROM flow_quote_requests
UNION ALL SELECT 'core', id, created_at, btrim(name), lower(btrim(email)), whatsapp, business_description, status FROM core_quote_requests
UNION ALL SELECT 'connect', id, created_at, btrim(name), lower(btrim(email)), whatsapp, business_description, status FROM connect_quote_requests
UNION ALL SELECT 'audit', id, created_at, btrim(name), lower(btrim(email)), whatsapp, business_description, status FROM ai_readiness_audit_quote_requests
UNION ALL SELECT 'contact', id, created_at, btrim(name), lower(btrim(email)), phone, coalesce(company, ''), status FROM contact_messages
UNION ALL SELECT 'calculator', id, created_at, split_part(email, '@', 1), lower(btrim(email)), NULL, '', status FROM calculator_leads;

-- One planned client per distinct valid email, with ids fixed up front so every
-- later step joins on the id (never on timestamps, which can collide).
CREATE TEMP TABLE _clients AS
SELECT
  gen_random_uuid() AS id,
  s.ekey,
  coalesce((array_agg(NULLIF(s.name, '') ORDER BY s.created_at) FILTER (WHERE NULLIF(s.name, '') IS NOT NULL))[1],
           split_part(s.ekey, '@', 1)) AS name,
  CASE WHEN bool_or(s.status = 'won') THEN 'active'
       WHEN bool_or(s.status IN ('new','contacted','qualified')) THEN 'lead'
       ELSE 'lost' END AS status,
  (array_agg(s.src ORDER BY s.created_at))[1] AS source,
  min(s.created_at) AS first_at,
  max(s.created_at) AS last_at
FROM _src s
WHERE s.ekey ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'
GROUP BY s.ekey;

INSERT INTO clients (id, name, kind, status, source, first_contact_at, last_contact_at)
SELECT id, name, 'business', status, source, first_at, last_at
FROM _clients
WHERE NOT EXISTS (SELECT 1 FROM clients);

-- One primary contact per backfilled client, using the newest enquiry's details.
INSERT INTO client_contacts (client_id, name, email, phone, is_primary)
SELECT DISTINCT ON (c.id) c.id, coalesce(NULLIF(s.name, ''), c.name), s.ekey, coalesce(s.phone, ''), true
FROM _clients c
JOIN _src s ON s.ekey = c.ekey
WHERE EXISTS (SELECT 1 FROM clients x WHERE x.id = c.id)
  AND NOT EXISTS (SELECT 1 FROM client_contacts cc WHERE cc.client_id = c.id)
ORDER BY c.id, s.created_at DESC;

-- Attach each enquiry row to its client.
UPDATE presence_quote_requests r SET client_id = cc.client_id FROM client_contacts cc WHERE r.client_id IS NULL AND cc.email_key = lower(btrim(r.email));
UPDATE flow_quote_requests r SET client_id = cc.client_id FROM client_contacts cc WHERE r.client_id IS NULL AND cc.email_key = lower(btrim(r.email));
UPDATE core_quote_requests r SET client_id = cc.client_id FROM client_contacts cc WHERE r.client_id IS NULL AND cc.email_key = lower(btrim(r.email));
UPDATE connect_quote_requests r SET client_id = cc.client_id FROM client_contacts cc WHERE r.client_id IS NULL AND cc.email_key = lower(btrim(r.email));
UPDATE ai_readiness_audit_quote_requests r SET client_id = cc.client_id FROM client_contacts cc WHERE r.client_id IS NULL AND cc.email_key = lower(btrim(r.email));
UPDATE contact_messages r SET client_id = cc.client_id FROM client_contacts cc WHERE r.client_id IS NULL AND cc.email_key = lower(btrim(r.email));
UPDATE calculator_leads r SET client_id = cc.client_id FROM client_contacts cc WHERE r.client_id IS NULL AND cc.email_key = lower(btrim(r.email));

-- Timeline: one "enquiry" entry per past enquiry.
INSERT INTO client_activity (client_id, kind, title, body, occurred_at, ref)
SELECT c.id, 'enquiry',
       'New ' || CASE s.src WHEN 'audit' THEN 'AI Audit' WHEN 'calculator' THEN 'calculator' ELSE initcap(s.src) END || ' enquiry',
       left(coalesce(s.company, ''), 400), s.created_at, s.src || ':' || s.id
FROM _src s
JOIN _clients c ON c.ekey = s.ekey
WHERE EXISTS (SELECT 1 FROM clients x WHERE x.id = c.id)
ON CONFLICT DO NOTHING;

DROP TABLE IF EXISTS _clients;
DROP TABLE IF EXISTS _src;
