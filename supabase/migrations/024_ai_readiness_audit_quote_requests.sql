-- 024_ai_readiness_audit_quote_requests.sql
-- Stores submissions from the /solutions/ai-readiness-audit "Get Started" form.
-- Public anonymous writes are NOT allowed — submissions go through
-- /api/quote-request (service: "ai-readiness-audit") using the service role.

CREATE TABLE ai_readiness_audit_quote_requests (
  id                     UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  tier                   TEXT         NOT NULL,
  business_description   TEXT         NOT NULL,
  ai_stage               TEXT         NOT NULL,
  biggest_question       TEXT         NOT NULL,
  grant_interest         TEXT         NOT NULL,
  name                   TEXT         NOT NULL,
  whatsapp               TEXT         NOT NULL,
  email                  TEXT         NOT NULL,
  notes                  TEXT,
  status                 TEXT         NOT NULL DEFAULT 'new',
  ip                     TEXT,
  user_agent             TEXT,
  created_at             TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

ALTER TABLE ai_readiness_audit_quote_requests
  ADD CONSTRAINT ai_readiness_audit_quote_requests_tier_check
    CHECK (tier IN ('Audit Light', 'Audit Full', 'Not sure yet'));

ALTER TABLE ai_readiness_audit_quote_requests
  ADD CONSTRAINT ai_readiness_audit_quote_requests_ai_stage_check
    CHECK (ai_stage IN (
      'Haven''t tried anything', 'Team uses ChatGPT informally', 'We''ve bought one AI tool',
      'We''ve built something', 'Not sure'
    ));

ALTER TABLE ai_readiness_audit_quote_requests
  ADD CONSTRAINT ai_readiness_audit_quote_requests_biggest_question_check
    CHECK (biggest_question IN (
      'Where AI could save time', 'Where AI could increase revenue',
      'Whether we''re ready for a custom build', 'Whether a grant applies to us', 'Other'
    ));

ALTER TABLE ai_readiness_audit_quote_requests
  ADD CONSTRAINT ai_readiness_audit_quote_requests_grant_interest_check
    CHECK (grant_interest IN ('Yes', 'No', 'Not sure'));

ALTER TABLE ai_readiness_audit_quote_requests
  ADD CONSTRAINT ai_readiness_audit_quote_requests_email_check
    CHECK (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$');

CREATE INDEX ai_readiness_audit_quote_requests_created_at_idx
  ON ai_readiness_audit_quote_requests (created_at DESC);

ALTER TABLE ai_readiness_audit_quote_requests ENABLE ROW LEVEL SECURITY;
-- No public policies: this table is server-write-only via the service role.
