-- ══════════════════════════════════════════════════════════════
-- Migration 006: Fix RLS Infinite Recursion
--
-- The previous policies used EXISTS(SELECT 1 FROM client_profiles...)
-- directly inside the policy for client_profiles, which triggers an 
-- infinite recursion in Postgres. 
-- We fix this by using a SECURITY DEFINER function to read the user's role
-- without triggering RLS, and then we update the policies to use this function.
-- ══════════════════════════════════════════════════════════════

-- 1. Create a security definer function to securely get the user's role bypassing RLS
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS public.user_role
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM client_profiles WHERE user_id = auth.uid() LIMIT 1;
$$;

-- 2. Fix chat_logs policy
DROP POLICY IF EXISTS "admin_read_chat_logs" ON chat_logs;
CREATE POLICY "admin_read_chat_logs" ON chat_logs
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND public.get_user_role() = 'admin'
  );

-- 3. Fix admin and sales policies for all tables to use the function

-- client_profiles
DROP POLICY IF EXISTS "admin_all_profiles" ON client_profiles;
CREATE POLICY "admin_all_profiles" ON client_profiles
  FOR ALL USING (
    auth.uid() IS NOT NULL AND public.get_user_role() = 'admin'
  );

-- projects
DROP POLICY IF EXISTS "admin_all_projects" ON projects;
CREATE POLICY "admin_all_projects" ON projects
  FOR ALL USING (
    auth.uid() IS NOT NULL AND public.get_user_role() = 'admin'
  );

-- tickets
DROP POLICY IF EXISTS "admin_all_tickets" ON tickets;
CREATE POLICY "admin_all_tickets" ON tickets
  FOR ALL USING (
    auth.uid() IS NOT NULL AND public.get_user_role() = 'admin'
  );

-- feedback
DROP POLICY IF EXISTS "admin_all_feedback" ON feedback;
CREATE POLICY "admin_all_feedback" ON feedback
  FOR ALL USING (
    auth.uid() IS NOT NULL AND public.get_user_role() = 'admin'
  );

-- documents
DROP POLICY IF EXISTS "admin_all_documents" ON documents;
CREATE POLICY "admin_all_documents" ON documents
  FOR ALL USING (
    auth.uid() IS NOT NULL AND public.get_user_role() = 'admin'
  );

-- invoices
DROP POLICY IF EXISTS "admin_all_invoices" ON invoices;
CREATE POLICY "admin_all_invoices" ON invoices
  FOR ALL USING (
    auth.uid() IS NOT NULL AND public.get_user_role() = 'admin'
  );

-- blog_posts
DROP POLICY IF EXISTS "admin_all_blog" ON blog_posts;
CREATE POLICY "admin_all_blog" ON blog_posts
  FOR ALL USING (
    auth.uid() IS NOT NULL AND public.get_user_role() = 'admin'
  );

-- portfolio_items
DROP POLICY IF EXISTS "admin_all_portfolio" ON portfolio_items;
CREATE POLICY "admin_all_portfolio" ON portfolio_items
  FOR ALL USING (
    auth.uid() IS NOT NULL AND public.get_user_role() = 'admin'
  );

-- income_entries
DROP POLICY IF EXISTS "admin_all_income" ON income_entries;
CREATE POLICY "admin_all_income" ON income_entries
  FOR ALL USING (
    auth.uid() IS NOT NULL AND public.get_user_role() IN ('admin', 'sales')
  );

-- expense_entries
DROP POLICY IF EXISTS "admin_all_expenses" ON expense_entries;
CREATE POLICY "admin_all_expenses" ON expense_entries
  FOR ALL USING (
    auth.uid() IS NOT NULL AND public.get_user_role() IN ('admin', 'sales')
  );

-- leads
DROP POLICY IF EXISTS "admin_all_leads" ON leads;
CREATE POLICY "admin_all_leads" ON leads
  FOR ALL USING (
    auth.uid() IS NOT NULL AND public.get_user_role() IN ('admin', 'sales')
  );

-- invite_links
DROP POLICY IF EXISTS "admin_all_invites" ON invite_links;
CREATE POLICY "admin_all_invites" ON invite_links
  FOR ALL USING (
    auth.uid() IS NOT NULL AND public.get_user_role() = 'admin'
  );
