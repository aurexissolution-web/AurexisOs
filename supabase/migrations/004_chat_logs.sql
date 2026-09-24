-- ── Chat Logs (no auth required, for AI learning) ──────────────
CREATE TABLE chat_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id  TEXT NOT NULL,
  role        TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content     TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_chat_logs_session ON chat_logs(session_id);
CREATE INDEX idx_chat_logs_created ON chat_logs(created_at);

-- Allow public insert and select (no auth needed)
ALTER TABLE chat_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anyone_can_insert_chat" ON chat_logs
  FOR INSERT WITH CHECK (true);

CREATE POLICY "anyone_can_read_chat" ON chat_logs
  FOR SELECT USING (true);
