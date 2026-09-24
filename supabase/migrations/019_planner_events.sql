-- ══════════════════════════════════════════════════════════════
-- Planner events — admin-only personal calendar/task planner.
-- Events can link to other admin records (customers, blog posts,
-- contact messages, invoices, projects) to make the planner a
-- cockpit instead of a parallel todo app.
-- ══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS planner_events (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title                 TEXT NOT NULL,
  event_date            DATE NOT NULL,
  event_time            TIME,
  duration_minutes      INT,
  type                  TEXT NOT NULL DEFAULT 'task'
                          CHECK (type IN ('blog','task','meeting','invoice','launch','other')),
  notes                 TEXT NOT NULL DEFAULT '',
  status                TEXT NOT NULL DEFAULT 'pending'
                          CHECK (status IN ('pending','done','cancelled')),
  priority              TEXT NOT NULL DEFAULT 'med'
                          CHECK (priority IN ('low','med','high')),
  linked_entity_type    TEXT
                          CHECK (linked_entity_type IN ('customer','blog_post','project','contact_message','invoice')),
  linked_entity_id      UUID,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS planner_events_date_idx           ON planner_events (event_date);
CREATE INDEX IF NOT EXISTS planner_events_status_date_idx    ON planner_events (status, event_date);
CREATE INDEX IF NOT EXISTS planner_events_linked_entity_idx  ON planner_events (linked_entity_type, linked_entity_id);

-- ── updated_at trigger ─────────────────────────────────────────
CREATE OR REPLACE FUNCTION set_planner_events_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS planner_events_updated_at ON planner_events;
CREATE TRIGGER planner_events_updated_at
  BEFORE UPDATE ON planner_events
  FOR EACH ROW EXECUTE FUNCTION set_planner_events_updated_at();

-- ── RLS ────────────────────────────────────────────────────────
ALTER TABLE planner_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins manage planner_events" ON planner_events;

CREATE POLICY "Admins manage planner_events" ON planner_events
  FOR ALL
  USING ( public.is_admin() )
  WITH CHECK ( public.is_admin() );
