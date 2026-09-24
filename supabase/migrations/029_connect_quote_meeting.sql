-- 029_connect_quote_meeting.sql
-- Adds the "online or face to face?" question to the Connect quote form
-- (same shape as 026 for Presence). Nullable because earlier rows never
-- answered it. RLS is already enabled on connect_quote_requests (021) with no
-- public policies; these columns inherit that — server-write-only.

ALTER TABLE connect_quote_requests
  ADD COLUMN meeting_preference TEXT,
  ADD COLUMN meeting_address    TEXT;

ALTER TABLE connect_quote_requests
  ADD CONSTRAINT connect_quote_requests_meeting_preference_check
    CHECK (meeting_preference IS NULL OR meeting_preference IN ('Online', 'Face to face'));

ALTER TABLE connect_quote_requests
  ADD CONSTRAINT connect_quote_requests_meeting_address_check
    CHECK (
      meeting_preference IS DISTINCT FROM 'Face to face'
      OR (meeting_address IS NOT NULL AND length(btrim(meeting_address)) > 0)
    );
