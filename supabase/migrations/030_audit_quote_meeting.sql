-- 030_audit_quote_meeting.sql
-- Adds the "online or face to face?" question to the AI Readiness Audit quote form
-- (same shape as 026 for Presence). Nullable because earlier rows never
-- answered it. RLS is already enabled on ai_readiness_audit_quote_requests (024) with no
-- public policies; these columns inherit that — server-write-only.

ALTER TABLE ai_readiness_audit_quote_requests
  ADD COLUMN meeting_preference TEXT,
  ADD COLUMN meeting_address    TEXT;

ALTER TABLE ai_readiness_audit_quote_requests
  ADD CONSTRAINT ai_readiness_audit_quote_requests_meeting_preference_check
    CHECK (meeting_preference IS NULL OR meeting_preference IN ('Online', 'Face to face'));

ALTER TABLE ai_readiness_audit_quote_requests
  ADD CONSTRAINT ai_readiness_audit_quote_requests_meeting_address_check
    CHECK (
      meeting_preference IS DISTINCT FROM 'Face to face'
      OR (meeting_address IS NOT NULL AND length(btrim(meeting_address)) > 0)
    );
