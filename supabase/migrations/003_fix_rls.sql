-- Fix infinite recursion in client_profiles policy

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM client_profiles WHERE user_id = auth.uid() AND role = 'admin'
  );
$$;

-- Drop the old recursive policy
DROP POLICY IF EXISTS "admin_all_profiles" ON client_profiles;

-- Create the new non-recursive policy
CREATE POLICY "admin_all_profiles" ON client_profiles
  FOR ALL USING ( public.is_admin() );
