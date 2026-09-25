'use client';

// src/components/admin/AdminShell.tsx
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import {
  BriefcaseBusiness,
  CalendarDays,
  ExternalLink,
  Inbox,
  LayoutDashboard,
  LogOut,
  PenLine,
  Star,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { signOut } from '@/app/admin/actions';
import { ToastProvider } from './ui';
import { DarkGradientBg } from './DarkGradientBg';

const NAV = [
  {
    href: '/admin',
    label: 'Overview',
    short: 'Overview',
    icon: LayoutDashboard,
    badge: null,
    group: 'Run',
  },
  {
    href: '/admin/command',
    label: 'Command Center',
    short: 'Inbox',
    icon: Inbox,
    badge: 'newLeads',
    group: 'Run',
  },
  {
    href: '/admin/clients',
    label: 'Clients',
    short: 'Clients',
    icon: Users,
    badge: null,
    group: 'Run',
  },
  {
    href: '/admin/calendar',
    label: 'Calendar',
    short: 'Calendar',
    icon: CalendarDays,
    badge: null,
    group: 'Run',
  },
  {
    href: '/admin/insights',
    label: 'Insight Booster',
    short: 'Insights',
    icon: PenLine,
    badge: null,
    group: 'Publish',
  },
  {
    href: '/admin/work',
    label: 'The Work Files',
    short: 'Work',
    icon: BriefcaseBusiness,
    badge: null,
    group: 'Publish',
  },
  {
    href: '/admin/reviews',
    label: 'Reviews',
    short: 'Reviews',
    icon: Star,
    badge: 'pendingReviews',
    group: 'Publish',
  },
] as const;

export function AdminShell({
  user,
  counts,
  children,
}: {
  user: { name: string; email: string };
  counts: { newLeads: number; pendingReviews: number };
  children: ReactNode;
}) {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);
  const initials = user.name
    .split(/\s+/)
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <ToastProvider>
      <div className="relative min-h-screen bg-black text-white">
        {/* Ambient backdrop — same language as the sign-in page, dialled down */}
        <div aria-hidden className="pointer-events-none fixed inset-0 opacity-70">
          <DarkGradientBg />
        </div>

        {/* Sidebar (desktop) */}
        <aside className="fixed inset-y-0 left-0 z-40 hidden w-[248px] flex-col border-r border-white/[0.12] bg-[#04060A]/80 backdrop-blur-2xl lg:flex">
          <Link href="/admin" className="flex items-center gap-3 px-5 pb-6 pt-6">
            <Image
              src="/brand/aurexis-mark.png"
              alt=""
              width={30}
              height={28}
              className="h-7 w-auto"
            />
            <span>
              <span className="block text-[14px] font-bold tracking-[-0.01em]">Aurexis</span>
              <span className="block font-mono text-[9px] uppercase tracking-[0.28em] text-[#5EE3DA]">
                Control room
              </span>
            </span>
          </Link>

          <nav className="flex-1 space-y-5 px-3" aria-label="Admin">
            {(['Run', 'Publish'] as const).map((group) => (
              <div key={group}>
                <p className="mb-1.5 px-3 font-mono text-[9.5px] uppercase tracking-[0.24em] text-white/30">
                  {group}
                </p>
                <div className="space-y-1">
                  {NAV.filter((item) => item.group === group).map((item) => {
                    const active = isActive(item.href);
                    const n = item.badge ? counts[item.badge] : 0;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        aria-current={active ? 'page' : undefined}
                        className={cn(
                          'group relative flex h-10 items-center gap-3 rounded-xl px-3 text-[13.5px] font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[#5EE3DA]/50',
                          active
                            ? 'bg-white/[0.06] text-white'
                            : 'text-white/55 hover:bg-white/[0.03] hover:text-white/90',
                        )}
                      >
                        {active && (
                          <span className="absolute -left-3 top-2 h-6 w-[3px] rounded-r-full bg-[#5EE3DA] shadow-[0_0_12px_rgba(94,227,218,0.8)]" />
                        )}
                        <item.icon
                          className={cn(
                            'h-[18px] w-[18px]',
                            active ? 'text-[#5EE3DA]' : 'text-white/45 group-hover:text-white/70',
                          )}
                        />
                        <span className="flex-1">{item.label}</span>
                        {n > 0 && (
                          <span className="grid h-5 min-w-5 place-items-center rounded-full bg-[#5EE3DA] px-1.5 text-[10.5px] font-bold text-[#02040A]">
                            {n > 99 ? '99+' : n}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          <div className="space-y-1 border-t border-white/[0.12] p-3">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-9 items-center gap-3 rounded-xl px-3 text-[12.5px] text-white/45 transition-colors hover:bg-white/[0.03] hover:text-white/80"
            >
              <ExternalLink className="h-4 w-4" /> View website
            </a>
            <div className="flex items-center gap-3 rounded-xl px-3 py-2">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#5EE3DA]/40 to-[#8FA8F0]/30 text-[11px] font-bold">
                {initials}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[12.5px] font-semibold capitalize">
                  {user.name}
                </span>
                <span className="block truncate text-[11px] text-white/40">{user.email}</span>
              </span>
              <form action={signOut}>
                <button
                  type="submit"
                  aria-label="Sign out"
                  className="grid h-8 w-8 place-items-center rounded-lg text-white/40 transition-colors hover:bg-white/[0.06] hover:text-white"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </form>
            </div>
          </div>
        </aside>

        {/* Top bar (mobile) */}
        <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-white/[0.12] bg-[#05070C]/85 px-4 backdrop-blur-xl lg:hidden">
          <Link href="/admin" className="flex items-center gap-2.5">
            <Image
              src="/brand/aurexis-mark.png"
              alt=""
              width={26}
              height={24}
              className="h-6 w-auto"
            />
            <span className="text-[14px] font-bold">Aurexis</span>
          </Link>
          <form action={signOut}>
            <button
              type="submit"
              aria-label="Sign out"
              className="grid h-9 w-9 place-items-center rounded-lg text-white/50"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </form>
        </header>

        <main className="relative pb-24 lg:pb-0 lg:pl-[248px]">
          <div className="mx-auto max-w-[1360px] px-4 py-6 md:px-8 md:py-9">{children}</div>
        </main>

        {/* Tab bar (mobile) */}
        <nav
          aria-label="Admin"
          className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-7 border-t border-white/[0.14] bg-[#05070C]/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden"
        >
          {NAV.map((item) => {
            const active = isActive(item.href);
            const n = item.badge ? counts[item.badge] : 0;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'relative flex h-16 flex-col items-center justify-center gap-1 text-[10.5px]',
                  active ? 'text-[#5EE3DA]' : 'text-white/45',
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.short}
                {n > 0 && (
                  <span className="absolute right-[calc(50%-18px)] top-2 grid h-4 min-w-4 place-items-center rounded-full bg-[#5EE3DA] px-1 text-[9px] font-bold text-[#02040A]">
                    {n > 99 ? '99+' : n}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </ToastProvider>
  );
}
