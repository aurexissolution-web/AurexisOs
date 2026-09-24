-- ══════════════════════════════════════════════════════════════
-- Aurexis Portal Schema
-- Run this migration against your Supabase project via the SQL editor
-- or `supabase db push`.
-- ══════════════════════════════════════════════════════════════

-- ── Extensions ─────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- ── Enums ──────────────────────────────────────────────────────
CREATE TYPE user_role        AS ENUM ('client', 'admin', 'sales');
CREATE TYPE project_phase    AS ENUM ('audit', 'blueprint', 'sprint', 'launch');
CREATE TYPE ticket_urgency   AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE ticket_status    AS ENUM ('open', 'in_progress', 'resolved', 'closed');
CREATE TYPE invoice_status   AS ENUM ('draft', 'sent', 'paid', 'overdue', 'cancelled');
CREATE TYPE lead_stage       AS ENUM ('new', 'contacted', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost');
CREATE TYPE expense_category AS ENUM ('tech_infrastructure', 'operational', 'marketing', 'legal', 'admin');
CREATE TYPE income_type      AS ENUM ('one_time', 'recurring');
CREATE TYPE document_type    AS ENUM ('nda', 'service_agreement', 'proposal', 'other');
CREATE TYPE document_status  AS ENUM ('pending', 'signed', 'expired');

-- ── Profiles (extends auth.users) ──────────────────────────────
CREATE TABLE client_profiles (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role                user_role NOT NULL DEFAULT 'client',
  company_name        TEXT NOT NULL DEFAULT '',
  contact_name        TEXT NOT NULL DEFAULT '',
  contact_email       TEXT NOT NULL DEFAULT '',
  contact_phone       TEXT NOT NULL DEFAULT '',
  billing_address     TEXT NOT NULL DEFAULT '',
  billing_preferences TEXT NOT NULL DEFAULT '',
  avatar_url          TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Projects ───────────────────────────────────────────────────
CREATE TABLE projects (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id           UUID NOT NULL REFERENCES client_profiles(id) ON DELETE CASCADE,
  name                TEXT NOT NULL,
  description         TEXT NOT NULL DEFAULT '',
  phase               project_phase NOT NULL DEFAULT 'audit',
  phase_progress      INT NOT NULL DEFAULT 0 CHECK (phase_progress BETWEEN 0 AND 100),
  services            TEXT[] NOT NULL DEFAULT '{}',
  start_date          DATE NOT NULL DEFAULT CURRENT_DATE,
  target_launch_date  DATE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Support Tickets ────────────────────────────────────────────
CREATE TABLE tickets (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id   UUID NOT NULL REFERENCES client_profiles(id) ON DELETE CASCADE,
  project_id  UUID REFERENCES projects(id) ON DELETE SET NULL,
  subject     TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  urgency     ticket_urgency NOT NULL DEFAULT 'medium',
  status      ticket_status NOT NULL DEFAULT 'open',
  category    TEXT NOT NULL DEFAULT 'General',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

-- ── Feedback / NPS ─────────────────────────────────────────────
CREATE TABLE feedback (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id      UUID NOT NULL REFERENCES client_profiles(id) ON DELETE CASCADE,
  project_id     UUID REFERENCES projects(id) ON DELETE SET NULL,
  nps_score      INT NOT NULL CHECK (nps_score BETWEEN 0 AND 10),
  comment        TEXT NOT NULL DEFAULT '',
  is_testimonial BOOLEAN NOT NULL DEFAULT false,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Documents (Secure Vault) ───────────────────────────────────
CREATE TABLE documents (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id  UUID NOT NULL REFERENCES client_profiles(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  name       TEXT NOT NULL,
  type       document_type NOT NULL DEFAULT 'other',
  file_url   TEXT NOT NULL,
  status     document_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  signed_at  TIMESTAMPTZ
);

-- ── Invoices ───────────────────────────────────────────────────
CREATE TABLE invoices (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id          UUID NOT NULL REFERENCES client_profiles(id) ON DELETE CASCADE,
  project_id         UUID REFERENCES projects(id) ON DELETE SET NULL,
  invoice_number     TEXT NOT NULL UNIQUE,
  amount             NUMERIC(12,2) NOT NULL DEFAULT 0,
  currency           TEXT NOT NULL DEFAULT 'USD',
  status             invoice_status NOT NULL DEFAULT 'draft',
  description        TEXT NOT NULL DEFAULT '',
  due_date           DATE NOT NULL,
  paid_at            TIMESTAMPTZ,
  stripe_payment_url TEXT,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Blog Posts (CMS) ───────────────────────────────────────────
CREATE TABLE blog_posts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  excerpt     TEXT NOT NULL DEFAULT '',
  content     TEXT NOT NULL DEFAULT '',
  cover_image TEXT,
  tags        TEXT[] NOT NULL DEFAULT '{}',
  published   BOOLEAN NOT NULL DEFAULT false,
  author      TEXT NOT NULL DEFAULT 'Aurexis Team',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Portfolio Items ────────────────────────────────────────────
CREATE TABLE portfolio_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL DEFAULT '',
  case_study  TEXT NOT NULL DEFAULT '',
  images      TEXT[] NOT NULL DEFAULT '{}',
  tech_tags   TEXT[] NOT NULL DEFAULT '{}',
  client_name TEXT,
  live_url    TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Income Entries (Sales) ─────────────────────────────────────
CREATE TABLE income_entries (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id        UUID REFERENCES client_profiles(id) ON DELETE SET NULL,
  project_id       UUID REFERENCES projects(id) ON DELETE SET NULL,
  type             income_type NOT NULL DEFAULT 'one_time',
  amount           NUMERIC(12,2) NOT NULL DEFAULT 0,
  currency         TEXT NOT NULL DEFAULT 'USD',
  description      TEXT NOT NULL DEFAULT '',
  date             DATE NOT NULL DEFAULT CURRENT_DATE,
  recurring_months INT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Expense Entries (Sales) ────────────────────────────────────
CREATE TABLE expense_entries (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category     expense_category NOT NULL,
  vendor       TEXT NOT NULL,
  amount       NUMERIC(12,2) NOT NULL DEFAULT 0,
  currency     TEXT NOT NULL DEFAULT 'USD',
  description  TEXT NOT NULL DEFAULT '',
  date         DATE NOT NULL DEFAULT CURRENT_DATE,
  is_recurring BOOLEAN NOT NULL DEFAULT false,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Leads (Pipeline) ──────────────────────────────────────────
CREATE TABLE leads (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name              TEXT NOT NULL,
  company           TEXT NOT NULL DEFAULT '',
  email             TEXT NOT NULL DEFAULT '',
  phone             TEXT,
  stage             lead_stage NOT NULL DEFAULT 'new',
  estimated_value   NUMERIC(12,2) NOT NULL DEFAULT 0,
  currency          TEXT NOT NULL DEFAULT 'USD',
  source            TEXT NOT NULL DEFAULT '',
  notes             TEXT NOT NULL DEFAULT '',
  calcom_booking_id TEXT,
  follow_up_date    DATE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Invite Links (Access Control) ─────────────────────────────
CREATE TABLE invite_links (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token      TEXT NOT NULL UNIQUE DEFAULT encode(extensions.gen_random_bytes(24), 'hex'),
  email      TEXT NOT NULL,
  role       user_role NOT NULL DEFAULT 'client',
  used       BOOLEAN NOT NULL DEFAULT false,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '7 days'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Indexes ────────────────────────────────────────────────────
CREATE INDEX idx_projects_client      ON projects(client_id);
CREATE INDEX idx_tickets_client       ON tickets(client_id);
CREATE INDEX idx_tickets_status       ON tickets(status);
CREATE INDEX idx_feedback_client      ON feedback(client_id);
CREATE INDEX idx_documents_client     ON documents(client_id);
CREATE INDEX idx_invoices_client      ON invoices(client_id);
CREATE INDEX idx_invoices_status      ON invoices(status);
CREATE INDEX idx_blog_posts_slug      ON blog_posts(slug);
CREATE INDEX idx_blog_posts_published ON blog_posts(published);
CREATE INDEX idx_portfolio_slug       ON portfolio_items(slug);
CREATE INDEX idx_income_date          ON income_entries(date);
CREATE INDEX idx_expense_date         ON expense_entries(date);
CREATE INDEX idx_leads_stage          ON leads(stage);
CREATE INDEX idx_invite_token         ON invite_links(token);

-- ── Row-Level Security ─────────────────────────────────────────
ALTER TABLE client_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects        ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets         ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback        ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents       ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices        ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts      ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE income_entries  ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads           ENABLE ROW LEVEL SECURITY;
ALTER TABLE invite_links    ENABLE ROW LEVEL SECURITY;

-- Client can read/update own profile
CREATE POLICY "clients_own_profile" ON client_profiles
  FOR ALL USING (auth.uid() = user_id);

-- Client can read own projects
CREATE POLICY "clients_own_projects" ON projects
  FOR SELECT USING (
    client_id IN (SELECT id FROM client_profiles WHERE user_id = auth.uid())
  );

-- Client can CRUD own tickets
CREATE POLICY "clients_own_tickets" ON tickets
  FOR ALL USING (
    client_id IN (SELECT id FROM client_profiles WHERE user_id = auth.uid())
  );

-- Client can CRUD own feedback
CREATE POLICY "clients_own_feedback" ON feedback
  FOR ALL USING (
    client_id IN (SELECT id FROM client_profiles WHERE user_id = auth.uid())
  );

-- Client can read own documents
CREATE POLICY "clients_own_documents" ON documents
  FOR SELECT USING (
    client_id IN (SELECT id FROM client_profiles WHERE user_id = auth.uid())
  );

-- Client can read own invoices
CREATE POLICY "clients_own_invoices" ON invoices
  FOR SELECT USING (
    client_id IN (SELECT id FROM client_profiles WHERE user_id = auth.uid())
  );

-- Published blog posts are public
CREATE POLICY "public_published_posts" ON blog_posts
  FOR SELECT USING (published = true);

-- Portfolio items are public
CREATE POLICY "public_portfolio" ON portfolio_items
  FOR SELECT USING (true);

-- Admin policies: users with admin role can do everything
-- (Apply via service_role key or custom claims in production)
CREATE POLICY "admin_all_profiles" ON client_profiles
  FOR ALL USING (
    EXISTS (SELECT 1 FROM client_profiles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "admin_all_projects" ON projects
  FOR ALL USING (
    EXISTS (SELECT 1 FROM client_profiles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "admin_all_tickets" ON tickets
  FOR ALL USING (
    EXISTS (SELECT 1 FROM client_profiles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "admin_all_feedback" ON feedback
  FOR ALL USING (
    EXISTS (SELECT 1 FROM client_profiles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "admin_all_documents" ON documents
  FOR ALL USING (
    EXISTS (SELECT 1 FROM client_profiles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "admin_all_invoices" ON invoices
  FOR ALL USING (
    EXISTS (SELECT 1 FROM client_profiles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "admin_all_blog" ON blog_posts
  FOR ALL USING (
    EXISTS (SELECT 1 FROM client_profiles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "admin_all_portfolio" ON portfolio_items
  FOR ALL USING (
    EXISTS (SELECT 1 FROM client_profiles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "admin_all_income" ON income_entries
  FOR ALL USING (
    EXISTS (SELECT 1 FROM client_profiles WHERE user_id = auth.uid() AND role IN ('admin', 'sales'))
  );

CREATE POLICY "admin_all_expenses" ON expense_entries
  FOR ALL USING (
    EXISTS (SELECT 1 FROM client_profiles WHERE user_id = auth.uid() AND role IN ('admin', 'sales'))
  );

CREATE POLICY "admin_all_leads" ON leads
  FOR ALL USING (
    EXISTS (SELECT 1 FROM client_profiles WHERE user_id = auth.uid() AND role IN ('admin', 'sales'))
  );

CREATE POLICY "admin_all_invites" ON invite_links
  FOR ALL USING (
    EXISTS (SELECT 1 FROM client_profiles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- ── Storage Bucket for Legal Documents ─────────────────────────
-- Run this separately if needed:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('legal-docs', 'legal-docs', false);
