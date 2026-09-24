-- 020_presence_quote_requests.sql
-- Stores submissions from the /solutions/presence "Get a Quote" form.
-- Public anonymous writes are NOT allowed — submissions go through
-- /api/quote-request using the service role.

CREATE TABLE presence_quote_requests (
  id                     UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  website_type           TEXT         NOT NULL,
  business_description   TEXT         NOT NULL,
  has_website             TEXT         NOT NULL,
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

ALTER TABLE presence_quote_requests
  ADD CONSTRAINT presence_quote_requests_website_type_check
    CHECK (website_type IN (
      'Landing Page', 'Business Site', 'Corporate Site', 'E-commerce',
      'Booking', 'Client Portal', 'Custom', 'Not sure yet'
    ));

ALTER TABLE presence_quote_requests
  ADD CONSTRAINT presence_quote_requests_has_website_check
    CHECK (has_website IN ('Yes', 'No', 'It''s outdated'));

ALTER TABLE presence_quote_requests
  ADD CONSTRAINT presence_quote_requests_timeline_check
    CHECK (timeline IN ('ASAP', 'Within a month', 'Within 3 months', 'Flexible'));

ALTER TABLE presence_quote_requests
  ADD CONSTRAINT presence_quote_requests_budget_check
    CHECK (budget IN ('Under RM3k', 'RM3k–8k', 'RM8k–15k', 'RM15k+', 'Not sure'));

ALTER TABLE presence_quote_requests
  ADD CONSTRAINT presence_quote_requests_email_check
    CHECK (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$');

CREATE INDEX presence_quote_requests_created_at_idx
  ON presence_quote_requests (created_at DESC);

ALTER TABLE presence_quote_requests ENABLE ROW LEVEL SECURITY;
-- No public policies: this table is server-write-only via the service role.
