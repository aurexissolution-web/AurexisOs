-- 022_flow_quote_requests.sql
-- Stores submissions from the /solutions/flow "Get a Quote" form.
-- Public anonymous writes are NOT allowed — submissions go through
-- /api/quote-request (service: "flow") using the service role.

CREATE TABLE flow_quote_requests (
  id                     UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  tier                   TEXT         NOT NULL,
  business_description   TEXT         NOT NULL,
  accounting_package     TEXT         NOT NULL,
  admin_hours_per_week   TEXT         NOT NULL,
  lhdn_status            TEXT         NOT NULL,
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

ALTER TABLE flow_quote_requests
  ADD CONSTRAINT flow_quote_requests_tier_check
    CHECK (tier IN ('Lite', 'Core', 'Max', 'Not sure yet'));

ALTER TABLE flow_quote_requests
  ADD CONSTRAINT flow_quote_requests_accounting_package_check
    CHECK (accounting_package IN (
      'Bukku', 'AutoCount', 'SQL', 'QuickBooks', 'Xero',
      'Spreadsheet only', 'None', 'Other'
    ));

ALTER TABLE flow_quote_requests
  ADD CONSTRAINT flow_quote_requests_admin_hours_per_week_check
    CHECK (admin_hours_per_week IN ('Under 5', '5–15', '15–30', 'Over 30', 'Not sure'));

ALTER TABLE flow_quote_requests
  ADD CONSTRAINT flow_quote_requests_lhdn_status_check
    CHECK (lhdn_status IN (
      'Already compliant', 'Working on it', 'Haven''t started', 'Not sure if it applies to me'
    ));

ALTER TABLE flow_quote_requests
  ADD CONSTRAINT flow_quote_requests_timeline_check
    CHECK (timeline IN ('ASAP', 'Within a month', 'Within 3 months', 'Flexible'));

ALTER TABLE flow_quote_requests
  ADD CONSTRAINT flow_quote_requests_budget_check
    CHECK (budget IN ('Under RM5k', 'RM5k–12k', 'RM12k+', 'Not sure'));

ALTER TABLE flow_quote_requests
  ADD CONSTRAINT flow_quote_requests_email_check
    CHECK (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$');

CREATE INDEX flow_quote_requests_created_at_idx
  ON flow_quote_requests (created_at DESC);

ALTER TABLE flow_quote_requests ENABLE ROW LEVEL SECURITY;
-- No public policies: this table is server-write-only via the service role.
