"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase/client";
import { ensureUserProfile, isAdminRole } from "@/lib/supabase/profile";
import type { ClientProfile } from "@/types/portal";
import {
  LayoutDashboard,
  User,
  PenTool,
  Image as ImageIcon,
  Users,
  DollarSign,
  TrendingUp,
  BarChart3,
  FlaskConical,
  Star,
  Inbox,
  CalendarDays,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import type { LucideProps } from "lucide-react";

type IconComp = React.ComponentType<LucideProps>;

interface NavItem {
  label: string;
  href: string;
  icon: IconComp;
}

const adminNav: NavItem[] = [
  { label: "Dashboard", href: "/portal/admin", icon: LayoutDashboard },
  { label: "Customers", href: "/portal/admin/customers", icon: Users },
  { label: "Income", href: "/portal/admin/income", icon: DollarSign },
  { label: "Expenses", href: "/portal/admin/expenses", icon: TrendingUp },
  { label: "Net Profit", href: "/portal/admin/profit", icon: BarChart3 },
  { label: "Inbox", href: "/portal/admin/messages", icon: Inbox },
  { label: "Planner", href: "/portal/admin/planner", icon: CalendarDays },
  { label: "Reviews", href: "/portal/admin/reviews", icon: Star },
  { label: "Blog Engine", href: "/portal/admin/blog", icon: PenTool },
  { label: "Portfolio", href: "/portal/admin/portfolio", icon: ImageIcon },
  { label: "The Lab", href: "/portal/admin/lab", icon: FlaskConical },
];

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [_profile, setProfile] = useState<ClientProfile | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.push(`/login?redirect=${pathname}`);
        return;
      }

      try {
        const ensured = await ensureUserProfile(data.user);
        if (cancelled) return;

        if (!isAdminRole(ensured.role)) {
          router.replace("/contact");
          return;
        }

        setProfile(ensured);
        setUserEmail(ensured.contact_email || data.user.email || null);
        setAuthChecked(true);
      } catch (error) {
        console.error(error);
        router.push("/login?error=profile");
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [pathname, router]);

  if (!authChecked) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#09090B]">
        <div className="text-white/30 text-[13px]">Loading...</div>
      </div>
    );
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const activeLabel =
    adminNav.find((n) => n.href === pathname)?.label ?? "Admin Portal";

  return (
    <div className="flex h-screen bg-[#09090B] overflow-hidden" data-lenis-prevent>
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-50 w-[260px] bg-[#0A0A0C] flex flex-col transition-transform duration-300",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="px-5 pt-6 pb-5">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
              <Image src="/brand/aurexis-mark.png" alt="Aurexis logo" width={20} height={20} className="object-contain" />
            </div>
            <div>
              <span className="text-white font-semibold text-[14px] tracking-tight block leading-tight">AurexisOS</span>
              <span className="text-white/30 text-[10px] font-medium uppercase tracking-[0.15em]">Admin Portal</span>
            </div>
          </Link>
        </div>

        <div className="mx-4 my-2 h-px bg-white/[0.06]" />

        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5">
          {adminNav.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200",
                  isActive
                    ? "bg-white/[0.08] text-white"
                    : "text-white/40 hover:text-white/70 hover:bg-white/[0.04]"
                )}
              >
                <Icon className={cn("w-[18px] h-[18px] shrink-0", isActive ? "text-white" : "text-white/30")} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3">
          <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-white/[0.08] border border-white/[0.06] flex items-center justify-center">
                <User className="w-3.5 h-3.5 text-white/50" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] text-white/80 truncate font-medium">{userEmail ?? "Loading..."}</p>
                <p className="text-[10px] text-white/25 uppercase tracking-wider font-medium">admin</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-[12px] font-medium text-white/40 hover:text-red-400 hover:bg-red-400/[0.06] border border-white/[0.06] transition-all duration-200"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 border-b border-white/[0.06] flex items-center justify-between px-4 lg:px-8 bg-[#09090B] shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-white/40 hover:text-white rounded-lg hover:bg-white/[0.04] transition-colors"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="text-[14px] font-semibold text-white">{activeLabel}</div>
          </div>
          <div className="text-[10px] text-white/20 font-mono uppercase tracking-[0.2em]">v1.0</div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-8 bg-[#09090B]">
          {children}
        </main>
      </div>
    </div>
  );
}
