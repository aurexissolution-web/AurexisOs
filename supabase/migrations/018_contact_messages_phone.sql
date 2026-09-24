-- ══════════════════════════════════════════════════════════════
-- Contact messages — add phone (for WhatsApp from admin) + a
-- contacted_at timestamp so the admin can mark leads followed-up.
-- ══════════════════════════════════════════════════════════════

ALTER TABLE contact_messages
  ADD COLUMN IF NOT EXISTS phone        TEXT,
  ADD COLUMN IF NOT EXISTS contacted_at TIMESTAMPTZ;

-- Useful for the admin 'inbox' badge count (pending = not yet contacted).
CREATE INDEX IF NOT EXISTS contact_messages_pending_idx
  ON contact_messages (created_at DESC)
  WHERE contacted_at IS NULL;
