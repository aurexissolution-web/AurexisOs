"use client";

import { supabase } from "@/lib/supabase/client";
import type { ExpenseCategory, ProjectPhase } from "@/types/portal";
import { PROJECT_PHASES } from "@/types/portal";

const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  tech_infrastructure: "Tech Infrastructure",
  operational: "Operational",
  marketing: "Marketing",
  legal: "Legal",
  admin: "Admin",
};

export type InvoiceStatusKey = "draft" | "sent" | "paid" | "overdue" | "cancelled";

export interface InvoiceSummary {
  id: string;
  invoice_number: string;
  amount: number;
  currency: string;
  status: InvoiceStatusKey;
  created_at: string;
  due_date: string;
}

export interface PnLMonth {
  month: string;
  monthLabel: string;
  revenue: number;
  expenses: number;
  profit: number;
}

export interface DashboardOverview {
  asOf: string;
  revenue: {
    mtd: number;
    previousMonth: number;
    deltaPct: number | null;
    daily30: number[];
  };
  profit: {
    mtd: number;
    marginPct: number | null;
    daily30: number[];
  };
  expenses: {
    mtd: number;
  };
  ytd: {
    revenue: number;
    expenses: number;
    profit: number;
    marginPct: number | null;
  };
  projects: {
    active: number;
    byPhase: Record<ProjectPhase, number>;
    launchingSoon: number;
    total: number;
  };
  pnl12mo: PnLMonth[];
  incomeMix: {
    recurring: number;
    oneTime: number;
    total: number;
  };
  expensesByCategory: Array<{
    category: ExpenseCategory;
    label: string;
    amount: number;
  }>;
  recentInvoices: InvoiceSummary[];
  content: {
    blogPublished: number;
    blogDrafts: number;
    portfolioTotal: number;
    portfolioFeatured: number;
    latestBlog: Array<{ id: string; title: string; cover_image: string | null; created_at: string }>;
    latestPortfolio: Array<{ id: string; title: string; images: string[]; created_at: string; featured: boolean }>;
  };
  inbound: {
    lastWeek: number;
    latest: { name: string; message: string; intent: string; created_at: string } | null;
  };
}

interface IncomeRow {
  amount: number;
  date: string;
  type: "one_time" | "recurring";
}

interface ExpenseRow {
  amount: number;
  date: string;
  category: ExpenseCategory;
}

interface ProjectRow {
  phase: ProjectPhase;
  target_launch_date: string | null;
}

function monthKey(d: Date): string {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

function dayKey(d: Date): string {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
}

function startOfMonth(year: number, month: number): Date {
  return new Date(Date.UTC(year, month, 1));
}

function pctDelta(curr: number, prev: number): number | null {
  if (prev <= 0) return curr > 0 ? null : 0;
  return ((curr - prev) / prev) * 100;
}

export async function fetchDashboardOverview(now: Date = new Date()): Promise<DashboardOverview> {
  const currYear = now.getUTCFullYear();
  const currMonth = now.getUTCMonth();
  const monthStart = startOfMonth(currYear, currMonth);
  const prevMonthStart = startOfMonth(currYear, currMonth - 1);
  const ytdStart = startOfMonth(currYear, 0);
  const twelveMoStart = startOfMonth(currYear, currMonth - 11);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const fourteenDaysAhead = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

  const [
    incomeRes,
    expenseRes,
    projectsRes,
    blogPubRes,
    blogDraftRes,
    portfolioCountRes,
    portfolioFeaturedRes,
    invoiceRes,
    contactCountRes,
    latestBlogRes,
    latestPortfolioRes,
    latestContactRes,
  ] = await Promise.all([
    supabase
      .from("income_entries")
      .select("amount, date, type")
      .gte("date", twelveMoStart.toISOString().slice(0, 10)),
    supabase
      .from("expense_entries")
      .select("amount, date, category")
      .gte("date", twelveMoStart.toISOString().slice(0, 10)),
    supabase.from("projects").select("phase, target_launch_date"),
    supabase.from("blog_posts").select("id", { count: "exact", head: true }).eq("published", true),
    supabase.from("blog_posts").select("id", { count: "exact", head: true }).eq("published", false),
    supabase.from("portfolio_items").select("id", { count: "exact", head: true }),
    supabase.from("portfolio_items").select("id", { count: "exact", head: true }).eq("featured", true),
    supabase
      .from("invoices")
      .select("id, invoice_number, amount, currency, status, created_at, due_date")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("contact_messages")
      .select("id", { count: "exact", head: true })
      .gte("created_at", weekAgo.toISOString()),
    supabase
      .from("blog_posts")
      .select("id, title, cover_image, created_at")
      .order("created_at", { ascending: false })
      .limit(2),
    supabase
      .from("portfolio_items")
      .select("id, title, images, created_at, featured")
      .order("created_at", { ascending: false })
      .limit(2),
    supabase
      .from("contact_messages")
      .select("name, message, intent, created_at")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const incomeRows: IncomeRow[] = (incomeRes.data ?? []) as IncomeRow[];
  const expenseRows: ExpenseRow[] = (expenseRes.data ?? []) as ExpenseRow[];
  const projectRows: ProjectRow[] = (projectsRes.data ?? []) as ProjectRow[];

  // ── PnL by month ──
  const pnlMap = new Map<string, { revenue: number; expenses: number }>();
  for (let i = 0; i < 12; i++) {
    const d = startOfMonth(currYear, currMonth - 11 + i);
    pnlMap.set(monthKey(d), { revenue: 0, expenses: 0 });
  }
  for (const row of incomeRows) {
    const k = monthKey(new Date(row.date));
    const bucket = pnlMap.get(k);
    if (bucket) bucket.revenue += Number(row.amount) || 0;
  }
  for (const row of expenseRows) {
    const k = monthKey(new Date(row.date));
    const bucket = pnlMap.get(k);
    if (bucket) bucket.expenses += Number(row.amount) || 0;
  }
  const pnl12mo: PnLMonth[] = Array.from(pnlMap.entries()).map(([month, v]) => {
    const [y, m] = month.split("-").map(Number);
    const d = new Date(Date.UTC(y, m - 1, 1));
    return {
      month,
      monthLabel: d.toLocaleDateString("en-US", { month: "short", timeZone: "UTC" }),
      revenue: v.revenue,
      expenses: v.expenses,
      profit: v.revenue - v.expenses,
    };
  });

  // ── MTD / previous month / YTD ──
  const currMonthKey = monthKey(monthStart);
  const prevMonthKey = monthKey(prevMonthStart);
  const mtd = pnlMap.get(currMonthKey) ?? { revenue: 0, expenses: 0 };
  const prevMo = pnlMap.get(prevMonthKey) ?? { revenue: 0, expenses: 0 };

  let ytdRevenue = 0;
  let ytdExpenses = 0;
  for (const row of incomeRows) {
    if (new Date(row.date) >= ytdStart) ytdRevenue += Number(row.amount) || 0;
  }
  for (const row of expenseRows) {
    if (new Date(row.date) >= ytdStart) ytdExpenses += Number(row.amount) || 0;
  }

  // ── 30-day daily sparkline (revenue + profit) ──
  const dailyRevenueMap = new Map<string, number>();
  const dailyExpenseMap = new Map<string, number>();
  for (let i = 0; i < 30; i++) {
    const d = new Date(thirtyDaysAgo.getTime() + i * 24 * 60 * 60 * 1000);
    dailyRevenueMap.set(dayKey(d), 0);
    dailyExpenseMap.set(dayKey(d), 0);
  }
  for (const row of incomeRows) {
    const k = dayKey(new Date(row.date));
    if (dailyRevenueMap.has(k)) {
      dailyRevenueMap.set(k, (dailyRevenueMap.get(k) ?? 0) + (Number(row.amount) || 0));
    }
  }
  for (const row of expenseRows) {
    const k = dayKey(new Date(row.date));
    if (dailyExpenseMap.has(k)) {
      dailyExpenseMap.set(k, (dailyExpenseMap.get(k) ?? 0) + (Number(row.amount) || 0));
    }
  }
  const revenueDaily30 = Array.from(dailyRevenueMap.values());
  const profitDaily30 = revenueDaily30.map((r, i) => r - (Array.from(dailyExpenseMap.values())[i] ?? 0));

  // ── Income mix (MTD) ──
  let recurringMtd = 0;
  let oneTimeMtd = 0;
  for (const row of incomeRows) {
    if (new Date(row.date) >= monthStart) {
      const amt = Number(row.amount) || 0;
      if (row.type === "recurring") recurringMtd += amt;
      else oneTimeMtd += amt;
    }
  }

  // ── Expenses by category (MTD) ──
  const expenseCatMap = new Map<ExpenseCategory, number>();
  for (const row of expenseRows) {
    if (new Date(row.date) >= monthStart) {
      const curr = expenseCatMap.get(row.category) ?? 0;
      expenseCatMap.set(row.category, curr + (Number(row.amount) || 0));
    }
  }
  const expensesByCategory = (Object.keys(EXPENSE_CATEGORY_LABELS) as ExpenseCategory[])
    .map((category) => ({
      category,
      label: EXPENSE_CATEGORY_LABELS[category],
      amount: expenseCatMap.get(category) ?? 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  // ── Project funnel ──
  const byPhase: Record<ProjectPhase, number> = {
    audit: 0,
    blueprint: 0,
    sprint: 0,
    launch: 0,
  };
  for (const row of projectRows) {
    if (row.phase in byPhase) byPhase[row.phase] += 1;
  }
  const active = PROJECT_PHASES.filter((p) => p.key !== "launch").reduce(
    (sum, p) => sum + byPhase[p.key],
    0,
  );
  const launchingSoon = projectRows.filter((p) => {
    if (!p.target_launch_date) return false;
    const t = new Date(p.target_launch_date);
    return t >= now && t <= fourteenDaysAhead;
  }).length;

  // ── Assemble ──
  const profitMtd = mtd.revenue - mtd.expenses;
  const marginMtd = mtd.revenue > 0 ? (profitMtd / mtd.revenue) * 100 : null;
  const ytdProfit = ytdRevenue - ytdExpenses;
  const ytdMargin = ytdRevenue > 0 ? (ytdProfit / ytdRevenue) * 100 : null;

  return {
    asOf: now.toISOString(),
    revenue: {
      mtd: mtd.revenue,
      previousMonth: prevMo.revenue,
      deltaPct: pctDelta(mtd.revenue, prevMo.revenue),
      daily30: revenueDaily30,
    },
    profit: {
      mtd: profitMtd,
      marginPct: marginMtd,
      daily30: profitDaily30,
    },
    expenses: { mtd: mtd.expenses },
    ytd: {
      revenue: ytdRevenue,
      expenses: ytdExpenses,
      profit: ytdProfit,
      marginPct: ytdMargin,
    },
    projects: {
      active,
      byPhase,
      launchingSoon,
      total: projectRows.length,
    },
    pnl12mo,
    incomeMix: {
      recurring: recurringMtd,
      oneTime: oneTimeMtd,
      total: recurringMtd + oneTimeMtd,
    },
    expensesByCategory,
    recentInvoices: (invoiceRes.data ?? []) as InvoiceSummary[],
    content: {
      blogPublished: blogPubRes.count ?? 0,
      blogDrafts: blogDraftRes.count ?? 0,
      portfolioTotal: portfolioCountRes.count ?? 0,
      portfolioFeatured: portfolioFeaturedRes.count ?? 0,
      latestBlog: (latestBlogRes.data ?? []) as DashboardOverview["content"]["latestBlog"],
      latestPortfolio: (latestPortfolioRes.data ?? []) as DashboardOverview["content"]["latestPortfolio"],
    },
    inbound: {
      lastWeek: contactCountRes.count ?? 0,
      latest: latestContactRes.data
        ? {
            name: latestContactRes.data.name as string,
            message: latestContactRes.data.message as string,
            intent: latestContactRes.data.intent as string,
            created_at: latestContactRes.data.created_at as string,
          }
        : null,
    },
  };
}

export function formatCurrency(amount: number, currency = "MYR"): string {
  return new Intl.NumberFormat("en-MY", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatCompact(amount: number): string {
  if (Math.abs(amount) >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(1)}M`;
  }
  if (Math.abs(amount) >= 1_000) {
    return `${(amount / 1_000).toFixed(1)}k`;
  }
  return amount.toFixed(0);
}
