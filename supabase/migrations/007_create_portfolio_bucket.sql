-- Create portfolio-images bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('portfolio-images', 'portfolio-images', true)
ON CONFLICT (id) DO NOTHING;

-- Policies for portfolio-images bucket
-- Allow public access to view images
CREATE POLICY "Public Access" ON storage.objects
  FOR SELECT USING (bucket_id = 'portfolio-images');

-- Allow authenticated users (specifically admins) to upload/update/delete
CREATE POLICY "Admin Upload Access" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'portfolio-images');

CREATE POLICY "Admin Update Access" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'portfolio-images');

CREATE POLICY "Admin Delete Access" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'portfolio-images');
