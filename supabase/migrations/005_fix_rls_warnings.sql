-- ══════════════════════════════════════════════════════════════
-- Migration 005: Fix Supabase Security Warnings
--
-- 1. Drop anonymous/permissive policies on chat_logs
-- 2. Drop public anonymous SELECT policies on blog_posts & portfolio_items
--    (public reads now go through server-side API routes using service role)
-- 3. Re-create all "client_own" and "admin_all" policies to require
--    auth.uid() IS NOT NULL, preventing anonymous role access
-- ══════════════════════════════════════════════════════════════

-- ── 1. Chat Logs: remove permissive anonymous policies ──────
-- The AI API route uses supabaseAdmin (service role) which bypasses RLS,
-- so no anonymous or authenticated policies are needed for chat_logs.
DROP POLICY IF EXISTS "anyone_can_insert_chat" ON chat_logs;
DROP POLICY IF EXISTS "anyone_can_read_chat" ON chat_logs;

-- Only admins can read chat logs (for review/learning purposes)
CREATE POLICY "admin_read_chat_logs" ON chat_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM client_profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- ── 2. Blog Posts: remove public anonymous SELECT ───────────
-- Public reads now go through /api/blog (server-side, service role)
DROP POLICY IF EXISTS "public_published_posts" ON blog_posts;

-- ── 3. Portfolio Items: remove public anonymous SELECT ──────
-- Public reads now go through /api/portfolio (server-side, service role)
DROP POLICY IF EXISTS "public_portfolio" ON portfolio_items;

-- ── 4. Tighten client policies to require authenticated user ─
-- Drop and recreate each client policy with explicit auth.uid() IS NOT NULL

-- client_profiles
DROP POLICY IF EXISTS "clients_own_profile" ON client_profiles;
CREATE POLICY "clients_own_profile" ON client_profiles
  FOR ALL USING (
    auth.uid() IS NOT NULL AND auth.uid() = user_id
  );

-- projects
DROP POLICY IF EXISTS "clients_own_projects" ON projects;
CREATE POLICY "clients_own_projects" ON projects
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND
    client_id IN (SELECT id FROM client_profiles WHERE user_id = auth.uid())
  );

-- tickets
DROP POLICY IF EXISTS "clients_own_tickets" ON tickets;
CREATE POLICY "clients_own_tickets" ON tickets
  FOR ALL USING (
    auth.uid() IS NOT NULL AND
    client_id IN (SELECT id FROM client_profiles WHERE user_id = auth.uid())
  );

-- feedback
DROP POLICY IF EXISTS "clients_own_feedback" ON feedback;
CREATE POLICY "clients_own_feedback" ON feedback
  FOR ALL USING (
    auth.uid() IS NOT NULL AND
    client_id IN (SELECT id FROM client_profiles WHERE user_id = auth.uid())
  );

-- documents
DROP POLICY IF EXISTS "clients_own_documents" ON documents;
CREATE POLICY "clients_own_documents" ON documents
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND
    client_id IN (SELECT id FROM client_profiles WHERE user_id = auth.uid())
  );

-- invoices
DROP POLICY IF EXISTS "clients_own_invoices" ON invoices;
CREATE POLICY "clients_own_invoices" ON invoices
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND
    client_id IN (SELECT id FROM client_profiles WHERE user_id = auth.uid())
  );

-- ── 5. Tighten admin policies to require authenticated user ──

-- client_profiles
DROP POLICY IF EXISTS "admin_all_profiles" ON client_profiles;
CREATE POLICY "admin_all_profiles" ON client_profiles
  FOR ALL USING (
    auth.uid() IS NOT NULL AND
    EXISTS (SELECT 1 FROM client_profiles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- projects
DROP POLICY IF EXISTS "admin_all_projects" ON projects;
CREATE POLICY "admin_all_projects" ON projects
  FOR ALL USING (
    auth.uid() IS NOT NULL AND
    EXISTS (SELECT 1 FROM client_profiles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- tickets
DROP POLICY IF EXISTS "admin_all_tickets" ON tickets;
CREATE POLICY "admin_all_tickets" ON tickets
  FOR ALL USING (
    auth.uid() IS NOT NULL AND
    EXISTS (SELECT 1 FROM client_profiles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- feedback
DROP POLICY IF EXISTS "admin_all_feedback" ON feedback;
CREATE POLICY "admin_all_feedback" ON feedback
  FOR ALL USING (
    auth.uid() IS NOT NULL AND
    EXISTS (SELECT 1 FROM client_profiles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- documents
DROP POLICY IF EXISTS "admin_all_documents" ON documents;
CREATE POLICY "admin_all_documents" ON documents
  FOR ALL USING (
    auth.uid() IS NOT NULL AND
    EXISTS (SELECT 1 FROM client_profiles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- invoices
DROP POLICY IF EXISTS "admin_all_invoices" ON invoices;
CREATE POLICY "admin_all_invoices" ON invoices
  FOR ALL USING (
    auth.uid() IS NOT NULL AND
    EXISTS (SELECT 1 FROM client_profiles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- blog_posts
DROP POLICY IF EXISTS "admin_all_blog" ON blog_posts;
CREATE POLICY "admin_all_blog" ON blog_posts
  FOR ALL USING (
    auth.uid() IS NOT NULL AND
    EXISTS (SELECT 1 FROM client_profiles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- portfolio_items
DROP POLICY IF EXISTS "admin_all_portfolio" ON portfolio_items;
CREATE POLICY "admin_all_portfolio" ON portfolio_items
  FOR ALL USING (
    auth.uid() IS NOT NULL AND
    EXISTS (SELECT 1 FROM client_profiles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- income_entries (admin + sales)
DROP POLICY IF EXISTS "admin_all_income" ON income_entries;
CREATE POLICY "admin_all_income" ON income_entries
  FOR ALL USING (
    auth.uid() IS NOT NULL AND
    EXISTS (SELECT 1 FROM client_profiles WHERE user_id = auth.uid() AND role IN ('admin', 'sales'))
  );

-- expense_entries (admin + sales)
DROP POLICY IF EXISTS "admin_all_expenses" ON expense_entries;
CREATE POLICY "admin_all_expenses" ON expense_entries
  FOR ALL USING (
    auth.uid() IS NOT NULL AND
    EXISTS (SELECT 1 FROM client_profiles WHERE user_id = auth.uid() AND role IN ('admin', 'sales'))
  );

-- leads (admin + sales)
DROP POLICY IF EXISTS "admin_all_leads" ON leads;
CREATE POLICY "admin_all_leads" ON leads
  FOR ALL USING (
    auth.uid() IS NOT NULL AND
    EXISTS (SELECT 1 FROM client_profiles WHERE user_id = auth.uid() AND role IN ('admin', 'sales'))
  );

-- invite_links
DROP POLICY IF EXISTS "admin_all_invites" ON invite_links;
CREATE POLICY "admin_all_invites" ON invite_links
  FOR ALL USING (
    auth.uid() IS NOT NULL AND
    EXISTS (SELECT 1 FROM client_profiles WHERE user_id = auth.uid() AND role = 'admin')
  );
