-- 033_calendar_events.sql
-- The admin calendar: meetings, calls, tasks and deadlines with per-event
-- reminders. Written only by server actions (service role) after an admin
-- check, so RLS stays ON with no policies = server-only, like the lead tables.

CREATE TABLE IF NOT EXISTS calendar_events (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  title           TEXT        NOT NULL CHECK (char_length(title) BETWEEN 1 AND 160),
  kind            TEXT        NOT NULL DEFAULT 'meeting'
                    CHECK (kind IN ('meeting','call','task','deadline')),
  starts_at       TIMESTAMPTZ NOT NULL,
  ends_at         TIMESTAMPTZ NOT NULL,
  location        TEXT        NOT NULL DEFAULT '',
  meeting_url     TEXT,
  attendee        TEXT        NOT NULL DEFAULT '',
  notes           TEXT        NOT NULL DEFAULT '',
  -- "presence:<uuid>" etc: the Command Center lead this event belongs to.
  lead_ref        TEXT,
  -- Minutes before starts_at to send a phone notification; {} = none, 0 = at start.
  reminders       INTEGER[]   NOT NULL DEFAULT '{15}'
                    CHECK (reminders <@ ARRAY[0,5,10,15,30,60,120,1440,2880]),
  reminders_sent  INTEGER[]   NOT NULL DEFAULT '{}',
  status          TEXT        NOT NULL DEFAULT 'scheduled'
                    CHECK (status IN ('scheduled','done','cancelled')),
  -- Google Calendar invite: whether to send one, and the iCalendar SEQUENCE so
  -- edits update the same event instead of creating a duplicate.
  send_invite     BOOLEAN     NOT NULL DEFAULT true,
  invite_seq      INTEGER     NOT NULL DEFAULT 0,
  created_by      UUID,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (ends_at > starts_at)
);

CREATE INDEX IF NOT EXISTS calendar_events_starts_at_idx ON calendar_events (starts_at);
CREATE INDEX IF NOT EXISTS calendar_events_upcoming_idx
  ON calendar_events (starts_at) WHERE status = 'scheduled';

ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
