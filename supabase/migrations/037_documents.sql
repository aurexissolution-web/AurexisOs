-- 037_documents.sql
-- Issued invoices, receipts and proposals. Each row keeps the full form data
-- (`data`) so a document can be reopened, duplicated or re-downloaded exactly
-- as issued. Written only by server actions (service role) after an admin
-- check, so RLS stays ON with no policies = server-only.
CREATE TABLE IF NOT EXISTS documents (
  id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  kind        TEXT          NOT NULL CHECK (kind IN ('proposal','invoice','receipt')),
  number      TEXT          NOT NULL CHECK (char_length(btrim(number)) BETWEEN 1 AND 60),
  client_id   UUID          REFERENCES clients(id) ON DELETE SET NULL,
  title       TEXT          NOT NULL DEFAULT '',
  status      TEXT          NOT NULL DEFAULT 'issued' CHECK (status IN ('draft','issued','void')),
  data        JSONB         NOT NULL,
  total_myr   NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (total_myr >= 0),
  doc_date    DATE          NOT NULL DEFAULT CURRENT_DATE,
  source_id   UUID          REFERENCES documents(id) ON DELETE SET NULL,
  created_by  UUID,
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  UNIQUE (kind, number)
);
CREATE INDEX IF NOT EXISTS documents_kind_date_idx ON documents (kind, doc_date DESC);
CREATE INDEX IF NOT EXISTS documents_client_idx ON documents (client_id) WHERE client_id IS NOT NULL;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Who may open the private Documents dashboard (/documents). Separate from
-- admin: being an admin does not grant access. Add a person by first creating
-- their user in Supabase Auth, then:
--   INSERT INTO documents_access (user_id)
--   SELECT id FROM auth.users WHERE email = 'you@example.com';
CREATE TABLE IF NOT EXISTS documents_access (
  user_id     UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE documents_access ENABLE ROW LEVEL SECURITY;
