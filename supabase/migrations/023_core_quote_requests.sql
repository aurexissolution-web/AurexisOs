-- 023_core_quote_requests.sql
-- Stores submissions from the /solutions/core "Get a Quote" form.
-- Public anonymous writes are NOT allowed — submissions go through
-- /api/quote-request (service: "core") using the service role.

CREATE TABLE core_quote_requests (
  id                     UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  tier                   TEXT         NOT NULL,
  business_description   TEXT         NOT NULL,
  saas_spend             TEXT         NOT NULL,
  bottleneck             TEXT         NOT NULL,
  data_migration         TEXT         NOT NULL,
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

ALTER TABLE core_quote_requests
  ADD CONSTRAINT core_quote_requests_tier_check
    CHECK (tier IN ('Starter', 'Growth', 'Enterprise', 'Not sure yet'));

ALTER TABLE core_quote_requests
  ADD CONSTRAINT core_quote_requests_saas_spend_check
    CHECK (saas_spend IN (
      'Under RM1,000', 'RM1,000–5,000', 'RM5,000–15,000', 'Over RM15,000', 'Not sure'
    ));

ALTER TABLE core_quote_requests
  ADD CONSTRAINT core_quote_requests_bottleneck_check
    CHECK (bottleneck IN (
      'Job tracking', 'Inventory', 'Client records', 'Reporting',
      'Multi-branch coordination', 'Other'
    ));

ALTER TABLE core_quote_requests
  ADD CONSTRAINT core_quote_requests_data_migration_check
    CHECK (data_migration IN (
      'Yes, spreadsheets', 'Yes, another system', 'Yes, both', 'No, starting fresh'
    ));

ALTER TABLE core_quote_requests
  ADD CONSTRAINT core_quote_requests_timeline_check
    CHECK (timeline IN ('Within 3 months', '3–6 months', 'Flexible'));

ALTER TABLE core_quote_requests
  ADD CONSTRAINT core_quote_requests_budget_check
    CHECK (budget IN ('Under RM25k', 'RM25k–60k', 'RM60k+', 'Not sure'));

ALTER TABLE core_quote_requests
  ADD CONSTRAINT core_quote_requests_email_check
    CHECK (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$');

CREATE INDEX core_quote_requests_created_at_idx
  ON core_quote_requests (created_at DESC);

ALTER TABLE core_quote_requests ENABLE ROW LEVEL SECURITY;
-- No public policies: this table is server-write-only via the service role.
