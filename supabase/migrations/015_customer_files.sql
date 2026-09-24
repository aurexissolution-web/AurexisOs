-- ══════════════════════════════════════════════════════════════
-- Customer Files — private storage bucket + invoice file column
-- Holds invoices, receipts, and customer-supplied documents.
-- Admin-only RLS; never public; signed URLs only.
-- ══════════════════════════════════════════════════════════════

-- ── Bucket ─────────────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'customer-files',
  'customer-files',
  false,
  52428800, -- 50 MB
  ARRAY[
    'application/pdf',
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/webp',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- ── Storage RLS — admin only ───────────────────────────────────
DROP POLICY IF EXISTS "Admins read customer files"   ON storage.objects;
DROP POLICY IF EXISTS "Admins upload customer files" ON storage.objects;
DROP POLICY IF EXISTS "Admins update customer files" ON storage.objects;
DROP POLICY IF EXISTS "Admins delete customer files" ON storage.objects;

CREATE POLICY "Admins read customer files" ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'customer-files'
    AND EXISTS (
      SELECT 1 FROM client_profiles
      WHERE client_profiles.user_id = auth.uid()
        AND client_profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins upload customer files" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'customer-files'
    AND EXISTS (
      SELECT 1 FROM client_profiles
      WHERE client_profiles.user_id = auth.uid()
        AND client_profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins update customer files" ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'customer-files'
    AND EXISTS (
      SELECT 1 FROM client_profiles
      WHERE client_profiles.user_id = auth.uid()
        AND client_profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins delete customer files" ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'customer-files'
    AND EXISTS (
      SELECT 1 FROM client_profiles
      WHERE client_profiles.user_id = auth.uid()
        AND client_profiles.role = 'admin'
    )
  );

-- ── Invoice file column ────────────────────────────────────────
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS invoice_file_url TEXT;
