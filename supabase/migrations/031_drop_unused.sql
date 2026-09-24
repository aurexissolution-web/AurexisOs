-- 031_drop_unused.sql
-- Removes schema that no code in the app uses (audited 2026-09-25 against every
-- .from() / .rpc() / storage call in src/). Kept on purpose:
--   client_profiles + is_admin() + get_user_role()  -- roles; RLS everywhere depends on them
--   projects                                        -- tickets has a FK to it
--   tickets                                         -- /api/health (keep-alive) queries it
--   portfolio-images, avatars buckets               -- needed by the admin panel
-- Nothing here is referenced by a kept table, so no CASCADE is used: if a kept
-- object still depends on something below, this migration fails loudly instead.

-- ── The one kept-table link into the tables below ────────────────────────────
-- projects.customer_record_id (added in 014) points at customer_records.
ALTER TABLE projects DROP COLUMN IF EXISTS customer_record_id;

-- ── Tables (their policies, indexes and triggers go with them) ────────────────
DROP TABLE IF EXISTS blog_posts;         -- superseded by insights_posts (025)
DROP TABLE IF EXISTS lab_explorations;   -- site uses a static data file instead
DROP TABLE IF EXISTS leads;              -- calculator posts to Google Sheets, not here
DROP TABLE IF EXISTS invoices;
DROP TABLE IF EXISTS documents;
DROP TABLE IF EXISTS feedback;
DROP TABLE IF EXISTS income_entries;
DROP TABLE IF EXISTS expense_entries;
DROP TABLE IF EXISTS invite_links;
DROP TABLE IF EXISTS customer_records;   -- last: invoices and documents point at it

-- ── Helper functions and enums only those tables used ─────────────────────────
DROP FUNCTION IF EXISTS set_customer_records_updated_at();
DROP FUNCTION IF EXISTS set_lab_explorations_updated_at();

DROP TYPE IF EXISTS customer_status;
DROP TYPE IF EXISTS lead_stage;
DROP TYPE IF EXISTS invoice_status;
DROP TYPE IF EXISTS document_type;
DROP TYPE IF EXISTS document_status;
DROP TYPE IF EXISTS income_type;
DROP TYPE IF EXISTS expense_category;

-- ── Storage: policies for the four buckets nothing uses ───────────────────────
-- blog-images (008)
DROP POLICY IF EXISTS "Public Access Blog Images"        ON storage.objects;
DROP POLICY IF EXISTS "Admin Upload Access Blog Images"  ON storage.objects;
DROP POLICY IF EXISTS "Admin Update Access Blog Images"  ON storage.objects;
DROP POLICY IF EXISTS "Admin Delete Access Blog Images"  ON storage.objects;
-- legal-docs (011)
DROP POLICY IF EXISTS "Public Read Legal Docs"    ON storage.objects;
DROP POLICY IF EXISTS "Auth Upload Legal Docs"    ON storage.objects;
DROP POLICY IF EXISTS "Auth Update Legal Docs"    ON storage.objects;
-- customer-files (015)
DROP POLICY IF EXISTS "Admins read customer files"   ON storage.objects;
DROP POLICY IF EXISTS "Admins upload customer files" ON storage.objects;
DROP POLICY IF EXISTS "Admins update customer files" ON storage.objects;
DROP POLICY IF EXISTS "Admins delete customer files" ON storage.objects;
-- lab-thumbnails (016)
DROP POLICY IF EXISTS "Public read lab thumbnails"   ON storage.objects;
DROP POLICY IF EXISTS "Admins upload lab thumbnails" ON storage.objects;
DROP POLICY IF EXISTS "Admins update lab thumbnails" ON storage.objects;
DROP POLICY IF EXISTS "Admins delete lab thumbnails" ON storage.objects;

-- ── Storage: the empty buckets themselves ─────────────────────────────────────
-- Supabase can block direct DELETEs on storage tables ("use the Storage API").
-- If it does, keep going: the buckets are empty and harmless, and can be removed
-- from Dashboard > Storage.
DO $$
BEGIN
  DELETE FROM storage.buckets
  WHERE id IN ('blog-images', 'legal-docs', 'customer-files', 'lab-thumbnails');
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Left empty buckets in place (%). Delete them in Dashboard > Storage if wanted.', SQLERRM;
END
$$;
