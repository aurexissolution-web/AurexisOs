-- Migration 011: Create legal-docs storage bucket for client documents

INSERT INTO storage.buckets (id, name, public)
VALUES ('legal-docs', 'legal-docs', true)
ON CONFLICT (id) DO NOTHING;

-- Allow anyone to read documents
DROP POLICY IF EXISTS "Public Read Legal Docs" ON storage.objects;
CREATE POLICY "Public Read Legal Docs" ON storage.objects
  FOR SELECT USING (bucket_id = 'legal-docs');

-- Allow authenticated users to upload documents
DROP POLICY IF EXISTS "Auth Upload Legal Docs" ON storage.objects;
CREATE POLICY "Auth Upload Legal Docs" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'legal-docs' AND auth.uid() IS NOT NULL);

-- Allow authenticated users to update documents
DROP POLICY IF EXISTS "Auth Update Legal Docs" ON storage.objects;
CREATE POLICY "Auth Update Legal Docs" ON storage.objects
  FOR UPDATE USING (bucket_id = 'legal-docs' AND auth.uid() IS NOT NULL);
