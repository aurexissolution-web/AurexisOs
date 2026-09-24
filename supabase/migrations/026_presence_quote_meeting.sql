-- 026_presence_quote_meeting.sql
-- Adds the "online or face to face?" question to the Presence quote form.
-- Nullable because rows submitted before this migration never answered it.
-- RLS is already enabled on presence_quote_requests (020) with no public
-- policies; these columns inherit that — server-write-only via service role.

ALTER TABLE presence_quote_requests
  ADD COLUMN meeting_preference TEXT,
  ADD COLUMN meeting_address    TEXT;

ALTER TABLE presence_quote_requests
  ADD CONSTRAINT presence_quote_requests_meeting_preference_check
    CHECK (meeting_preference IS NULL OR meeting_preference IN ('Online', 'Face to face'));

ALTER TABLE presence_quote_requests
  ADD CONSTRAINT presence_quote_requests_meeting_address_check
    CHECK (
      meeting_preference IS DISTINCT FROM 'Face to face'
      OR (meeting_address IS NOT NULL AND length(btrim(meeting_address)) > 0)
    );
