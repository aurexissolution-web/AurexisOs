-- 028_core_quote_meeting.sql
-- Adds the "online or face to face?" question to the Core quote form
-- (same shape as 026 for Presence). Nullable because earlier rows never
-- answered it. RLS is already enabled on core_quote_requests (023) with no
-- public policies; these columns inherit that — server-write-only.

ALTER TABLE core_quote_requests
  ADD COLUMN meeting_preference TEXT,
  ADD COLUMN meeting_address    TEXT;

ALTER TABLE core_quote_requests
  ADD CONSTRAINT core_quote_requests_meeting_preference_check
    CHECK (meeting_preference IS NULL OR meeting_preference IN ('Online', 'Face to face'));

ALTER TABLE core_quote_requests
  ADD CONSTRAINT core_quote_requests_meeting_address_check
    CHECK (
      meeting_preference IS DISTINCT FROM 'Face to face'
      OR (meeting_address IS NOT NULL AND length(btrim(meeting_address)) > 0)
    );
