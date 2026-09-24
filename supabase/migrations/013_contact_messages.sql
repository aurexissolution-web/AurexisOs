-- 013_contact_messages.sql
-- Stores submissions from the /contact form. Public anonymous writes are NOT
-- allowed — submissions go through /api/contact using the service role.
-- Admin viewing is out of scope; reads happen via direct DB access for now.

CREATE TABLE contact_messages (
  id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  intent       TEXT         NOT NULL,
  name         TEXT         NOT NULL,
  email        TEXT         NOT NULL,
  company      TEXT,
  stage        TEXT,
  message      TEXT         NOT NULL,
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  notified_at  TIMESTAMPTZ
);

ALTER TABLE contact_messages
  ADD CONSTRAINT contact_messages_intent_check
    CHECK (intent IN (
      'new-project', 'ai-agent', 'existing-client',
      'press-partnerships', 'careers'
    ));

ALTER TABLE contact_messages
  ADD CONSTRAINT contact_messages_email_check
    CHECK (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$');

CREATE INDEX contact_messages_created_at_idx
  ON contact_messages (created_at DESC);

ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
-- No public policies: this table is server-write-only via the service role.
