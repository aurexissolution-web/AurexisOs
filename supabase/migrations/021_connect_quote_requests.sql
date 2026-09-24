-- 021_connect_quote_requests.sql
-- Stores submissions from the /solutions/connect "Get a Quote" form.
-- Public anonymous writes are NOT allowed — submissions go through
-- /api/quote-request (service: "connect") using the service role.

CREATE TABLE connect_quote_requests (
  id                     UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  tier                   TEXT         NOT NULL,
  business_description   TEXT         NOT NULL,
  has_meta_account       TEXT         NOT NULL,
  enquiries_per_month    TEXT         NOT NULL,
  timeline               TEXT         NOT NULL,
  budget                 TEXT         NOT NULL,
  name                   TEXT         NOT NULL,
  whatsapp               TEXT         NOT NULL,
  email                  TEXT         NOT NULL,
  notes                  TEXT,
  status                 TEXT         NOT NULL DEFAULT 'new',
  ip                     TEXT,
  user_agent             TEXT,
  created_at             TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

ALTER TABLE connect_quote_requests
  ADD CONSTRAINT connect_quote_requests_tier_check
    CHECK (tier IN ('Starter', 'Growth', 'Pro', 'Custom', 'Not sure yet'));

ALTER TABLE connect_quote_requests
  ADD CONSTRAINT connect_quote_requests_has_meta_account_check
    CHECK (has_meta_account IN ('Yes', 'No', 'Not sure'));

ALTER TABLE connect_quote_requests
  ADD CONSTRAINT connect_quote_requests_enquiries_per_month_check
    CHECK (enquiries_per_month IN ('Under 50', '50–200', '200–1,000', 'Over 1,000', 'Not sure'));

ALTER TABLE connect_quote_requests
  ADD CONSTRAINT connect_quote_requests_timeline_check
    CHECK (timeline IN (
      'Before 1 October (Meta deadline)', 'Within a month', 'Within 3 months', 'Flexible'
    ));

ALTER TABLE connect_quote_requests
  ADD CONSTRAINT connect_quote_requests_budget_check
    CHECK (budget IN ('Under RM3k', 'RM3k–8k', 'RM8k+', 'Not sure'));

ALTER TABLE connect_quote_requests
  ADD CONSTRAINT connect_quote_requests_email_check
    CHECK (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$');

CREATE INDEX connect_quote_requests_created_at_idx
  ON connect_quote_requests (created_at DESC);

ALTER TABLE connect_quote_requests ENABLE ROW LEVEL SECURITY;
-- No public policies: this table is server-write-only via the service role.
