// ── Portal Database Types ──────────────────────────────────────

export type UserRole = "client" | "admin";

export type ProjectPhase = "audit" | "blueprint" | "sprint" | "launch";
export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue" | "cancelled";
export type ExpenseCategory = "tech_infrastructure" | "operational" | "marketing" | "legal" | "admin";
export type IncomeType = "one_time" | "recurring";
export type CustomerStatus = "active" | "dormant" | "archived";
export type ReviewStatus = "pending" | "approved" | "rejected";
export type ReviewAvatarKey =
  | "cyan"
  | "violet"
  | "emerald"
  | "amber"
  | "cyan-violet"
  | "amber-emerald"
  | "silver"
  | "constellation";

export interface Review {
  id: string;
  name: string;
  role: string;
  rating: number;
  content: string;
  avatar_key: ReviewAvatarKey;
  email: string | null;
  status: ReviewStatus;
  featured: boolean;
  admin_notes: string;
  created_at: string;
  approved_at: string | null;
  updated_at: string;
}

export interface CustomerRecord {
  id: string;
  slug: string;
  company_name: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  industry: string;
  notes: string;
  github_url: string | null;
  hosting_provider: string | null;
  live_url: string | null;
  first_engaged_at: string | null;
  status: CustomerStatus;
  created_at: string;
  updated_at: string;
}

export interface ClientProfile {
  id: string;
  user_id: string;
  role: UserRole;
  company_name: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  email?: string;
  billing_address: string;
  billing_preferences: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  client_id: string;
  name: string;
  description: string;
  phase: ProjectPhase;
  phase_progress: number; // 0-100 within current phase
  services: string[];
  start_date: string;
  target_launch_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: string;
  client_id: string;
  project_id: string | null;
  name: string;
  type: "nda" | "service_agreement" | "proposal" | "other";
  file_url: string;
  status: "pending" | "signed" | "expired";
  created_at: string;
  signed_at: string | null;
}

export interface Invoice {
  id: string;
  client_id: string;
  project_id: string | null;
  invoice_number: string;
  amount: number;
  currency: string;
  status: InvoiceStatus;
  description: string;
  due_date: string;
  paid_at: string | null;
  bank_reference: string | null;
  receipt_url: string | null;
  invoice_file_url: string | null;
  payment_method: string;
  created_at: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image: string | null;
  tags: string[];
  published: boolean;
  author: string;
  created_at: string;
  updated_at: string;
}

export type PortfolioCategory =
  | 'ai-automation'
  | 'web-engineering'
  | 'mobile-ecosystem'
  | 'ecosystem'
  | 'data-engineering';

export interface OutcomeMetric {
  value: string;
  label: string;
}

export interface PortfolioItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  case_study: string;
  images: string[];
  tech_tags: string[];
  client_name: string | null;
  live_url: string | null;
  created_at: string;
  category: PortfolioCategory;
  accent_word: string | null;
  pull_quote: string | null;
  outcome_metrics: OutcomeMetric[];
  featured: boolean;
  display_order: number;
}

// ── Phase config ───────────────────────────────────────────────
export const PROJECT_PHASES: { key: ProjectPhase; label: string; order: number }[] = [
  { key: "audit", label: "Audit", order: 0 },
  { key: "blueprint", label: "Blueprint", order: 1 },
  { key: "sprint", label: "Sprint", order: 2 },
  { key: "launch", label: "Launch", order: 3 },
];

// ── /contact types ─────────────────────────────────────────
export type ContactIntent =
  | 'new-project'
  | 'ai-agent'
  | 'existing-client'
  | 'press-partnerships'
  | 'careers';

export type ContactAccent = 'cyan' | 'violet' | 'cyan-mix';

export interface Founder {
  initials: string;
  name: string;
  role: string;
  blurb: string;
  brings: string;
  accent: ContactAccent;
  available: boolean;
  imageSrc?: string;
}

export interface Studio {
  city: string;
  country: string;
  role: string;
  address: string;
  addressNote: string;
  accent: 'cyan' | 'violet';
  skyline: 'kl' | 'sp';
  imageSrc?: string;
}

export interface FAQ {
  q: string;
  a: string;
}

export interface ContactMessage {
  id: string;
  intent: ContactIntent;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  stage: string | null;
  message: string;
  created_at: string;
  notified_at: string | null;
  contacted_at: string | null;
}

// ── Planner ────────────────────────────────────────────────
export type PlannerEventType =
  | "blog"
  | "task"
  | "meeting"
  | "invoice"
  | "launch"
  | "other";

export type PlannerEventStatus = "pending" | "done" | "cancelled";
export type PlannerEventPriority = "low" | "med" | "high";

export type PlannerLinkedEntityType =
  | "customer"
  | "blog_post"
  | "project"
  | "contact_message"
  | "invoice";

export interface PlannerEvent {
  id: string;
  title: string;
  event_date: string;          // ISO date (YYYY-MM-DD)
  event_time: string | null;   // HH:MM:SS or null for all-day
  duration_minutes: number | null;
  type: PlannerEventType;
  notes: string;
  status: PlannerEventStatus;
  priority: PlannerEventPriority;
  linked_entity_type: PlannerLinkedEntityType | null;
  linked_entity_id: string | null;
  created_at: string;
  updated_at: string;
}

export const PLANNER_EVENT_TYPE_META: Record<
  PlannerEventType,
  { label: string; color: string; bg: string; border: string }
> = {
  blog:    { label: "Blog",     color: "#00F0FF", bg: "rgba(0,240,255,0.10)",  border: "rgba(0,240,255,0.35)" },
  task:    { label: "Task",     color: "#FFFFFF", bg: "rgba(255,255,255,0.06)", border: "rgba(255,255,255,0.20)" },
  meeting: { label: "Meeting",  color: "#A78BFA", bg: "rgba(167,139,250,0.12)", border: "rgba(167,139,250,0.40)" },
  invoice: { label: "Invoice",  color: "#F59E0B", bg: "rgba(245,158,11,0.12)",  border: "rgba(245,158,11,0.40)" },
  launch:  { label: "Launch",   color: "#10B981", bg: "rgba(16,185,129,0.12)",  border: "rgba(16,185,129,0.40)" },
  other:   { label: "Other",    color: "#9CA3AF", bg: "rgba(156,163,175,0.10)", border: "rgba(156,163,175,0.30)" },
};
