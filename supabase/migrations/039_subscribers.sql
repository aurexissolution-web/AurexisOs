-- 039_subscribers.sql
-- People who left their details in the website pop-up or footer, the follow-up
-- email series they are on, and the newsletters sent from the admin panel.
-- Written only by server code (service role), so RLS stays ON with no policies.
CREATE TABLE IF NOT EXISTS subscribers (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  email            TEXT        NOT NULL CHECK (char_length(btrim(email)) BETWEEN 3 AND 160),
  name             TEXT        NOT NULL DEFAULT '' CHECK (char_length(name) <= 120),
  business         TEXT        NOT NULL DEFAULT '' CHECK (char_length(business) <= 160),
  source           TEXT        NOT NULL DEFAULT 'popup' CHECK (char_length(source) <= 40),
  status           TEXT        NOT NULL DEFAULT 'active' CHECK (status IN ('active','unsubscribed')),
  -- Public token used only by the unsubscribe link in each email.
  unsub_token      UUID        NOT NULL DEFAULT gen_random_uuid(),
  -- How many follow-up emails have been sent; the next one is due at next_send_at.
  drip_step        INT         NOT NULL DEFAULT 0 CHECK (drip_step >= 0),
  next_send_at     TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  unsubscribed_at  TIMESTAMPTZ
);
CREATE UNIQUE INDEX IF NOT EXISTS subscribers_email_key ON subscribers (lower(email));
CREATE UNIQUE INDEX IF NOT EXISTS subscribers_unsub_token_key ON subscribers (unsub_token);
CREATE INDEX IF NOT EXISTS subscribers_due_idx ON subscribers (next_send_at)
  WHERE status = 'active' AND next_send_at IS NOT NULL;
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS email_broadcasts (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  subject     TEXT        NOT NULL CHECK (char_length(btrim(subject)) BETWEEN 1 AND 200),
  body        TEXT        NOT NULL CHECK (char_length(btrim(body)) BETWEEN 1 AND 10000),
  recipients  INT         NOT NULL DEFAULT 0,
  sent_by     UUID,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE email_broadcasts ENABLE ROW LEVEL SECURITY;
