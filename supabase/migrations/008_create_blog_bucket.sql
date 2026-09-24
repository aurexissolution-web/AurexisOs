-- Create blog-images bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('blog-images', 'blog-images', true)
ON CONFLICT (id) DO NOTHING;

-- Policies for blog-images bucket
-- Allow public access to view images
CREATE POLICY "Public Access" ON storage.objects
  FOR SELECT USING (bucket_id = 'blog-images');

-- Allow authenticated users to upload/update/delete
CREATE POLICY "Admin Upload Access" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'blog-images');

CREATE POLICY "Admin Update Access" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'blog-images');

CREATE POLICY "Admin Delete Access" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'blog-images');
