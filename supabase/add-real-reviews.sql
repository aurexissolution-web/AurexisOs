-- ══════════════════════════════════════════════════════════════
-- Add real client reviews — MANUAL one-off, not a migration.
--
-- Why this file exists: the public review-submission form and the admin
-- approval UI were both removed with the portal (they survive only in
-- .removed-admin-backup/). There is no write path to `reviews` in the live
-- app, so real reviews have to be inserted directly.
--
-- HOW TO RUN
--   Supabase dashboard → SQL Editor → paste → Run.
--   (Or: psql "$SUPABASE_DB_URL" -f supabase/add-real-reviews.sql)
--
-- BEFORE YOU RUN
--   Replace every <ANGLE BRACKET> with the client's real words. Do not
--   paraphrase into marketing copy — the value of these is that they sound
--   like a person. Keep their phrasing, including the un-slick bits.
--
--   Get permission first. Publishing someone's words and name on your
--   homepage needs their yes, ideally in writing (a WhatsApp "ok can" is
--   fine — screenshot it and keep it).
--
-- FIELD NOTES
--   name       The person or business shown under the quote.
--   role       Small line beneath the name, e.g. "Legal practice · KL".
--   rating     1-5. Renders as the number in the verified badge.
--   content    8-320 characters, enforced by a CHECK constraint. Longer
--              quotes get truncated with a "Read full story" toggle.
--   featured   Exactly ONE should be true — that one renders as the big
--              left-hand card. The next two fill the right column.
--   status     Must be 'approved' or the site will not show it.
--   avatar_key Colour seed for the monogram circle. 'cyan' is the default.
-- ══════════════════════════════════════════════════════════════

INSERT INTO reviews (name, role, rating, content, status, featured, approved_at, avatar_key)
VALUES
  -- ── The featured quote (big card, left) ──────────────────────
  (
    '<CLIENT NAME>',
    '<SECTOR · CITY>',
    5,
    '<THEIR ACTUAL WORDS — 8 to 320 characters. Use the sentence they said, not a polished version of it.>',
    'approved',
    true,
    now(),
    'cyan'
  ),

  -- ── Supporting quote 1 (right column, top) ───────────────────
  (
    '<CLIENT NAME>',
    '<SECTOR · CITY>',
    5,
    '<THEIR ACTUAL WORDS>',
    'approved',
    false,
    now(),
    'cyan'
  ),

  -- ── Supporting quote 2 (right column, bottom) ────────────────
  (
    '<CLIENT NAME>',
    '<SECTOR · CITY>',
    5,
    '<THEIR ACTUAL WORDS>',
    'approved',
    false,
    now(),
    'cyan'
  );

-- ── Verify what the homepage will now show ─────────────────────
-- Should return your rows, featured first.
SELECT name, role, rating, featured, left(content, 60) AS preview
FROM reviews
WHERE status = 'approved'
ORDER BY featured DESC, approved_at DESC;
