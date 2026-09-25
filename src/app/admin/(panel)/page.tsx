// src/app/admin/(panel)/page.tsx — Overview
import Link from 'next/link';
import {
  ArrowRight,
  ArrowUpRight,
  BriefcaseBusiness,
  Inbox,
  PenLine,
  Plus,
  Star,
  Trophy,
  TrendingUp,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { requireAdmin } from '@/lib/auth/admin';
import { getOverview } from '@/lib/admin/stats';
import { getClientOverview } from '@/lib/admin/client-stats';
import { formatRM } from '@/lib/admin/billing';
import { SOURCE_BY_KEY } from '@/lib/admin/lead-sources';
import { ButtonLink, Card, CardHeader } from '@/components/admin/ui';
import { LeadsChart } from '@/components/admin/LeadsChart';
import { RelativeTime } from '@/components/admin/RelativeTime';

function greeting() {
  const h = Number(
    new Date().toLocaleString('en-MY', {
      hour: 'numeric',
      hour12: false,
      timeZone: 'Asia/Kuala_Lumpur',
    }),
  );
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
}

function Kpi({
  label,
  value,
  sub,
  href,
  icon,
  accent,
  spark,
}: {
  label: string;
  value: number;
  sub: ReactNode;
  href: string;
  icon: ReactNode;
  accent: string;
  spark?: number[];
}) {
  const max = Math.max(1, ...(spark ?? [0]));
  return (
    <Link
      href={href}
      className="group relative flex min-w-0 flex-col overflow-hidden rounded-2xl border border-white/[0.14] bg-[#070A10]/80 p-5 backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-white/20 max-sm:p-4"
    >
      <span
        aria-hidden
        className="absolute inset-x-5 top-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-[0.12] blur-2xl transition-opacity group-hover:opacity-25"
        style={{ background: accent }}
      />
      <div className="relative flex items-center justify-between">
        <span className="truncate font-mono text-[10px] uppercase tracking-[0.2em] text-white/45 max-sm:text-[9px] max-sm:tracking-[0.14em]">
          {label}
        </span>
        <span
          className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border max-sm:hidden"
          style={{ color: accent, borderColor: `${accent}40`, background: `${accent}12` }}
        >
          {icon}
        </span>
      </div>
      <div className="relative mt-4 flex items-end justify-between gap-3">
        <p className="text-[32px] sm:text-[40px] font-extrabold leading-none tracking-[-0.04em] text-white">
          {value}
        </p>
        {spark && (
          <span aria-hidden className="hidden h-9 items-end gap-[3px] min-[420px]:flex">
            {spark.map((v, i) => (
              <span
                key={i}
                className="w-[5px] rounded-t-[2px]"
                style={{
                  height: `${Math.max(8, (v / max) * 100)}%`,
                  background: v ? accent : 'rgba(255,255,255,0.08)',
                  opacity: v ? 0.35 + (i / spark.length) * 0.65 : 1,
                }}
              />
            ))}
          </span>
        )}
      </div>
      <p className="relative mt-3 flex items-center gap-1 text-[12px] text-white/50 max-sm:text-[11px]">
        {sub}
        <ArrowUpRight className="ml-auto h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
      </p>
    </Link>
  );
}

export default async function OverviewPage() {
  const user = await requireAdmin();
  const [o, cl] = await Promise.all([getOverview(), getClientOverview()]);
  const delta = o.thisWeek - o.lastWeek;
  const total30 = o.days.reduce((s, d) => s + d.total, 0);
  const maxSource = Math.max(1, ...o.bySource.map((s) => s.total));
  const today = new Date().toLocaleDateString('en-MY', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: 'Asia/Kuala_Lumpur',
  });
  const funnel = [
    { label: 'New', n: o.funnel.new, color: '#5EE3DA' },
    { label: 'Contacted', n: o.funnel.contacted, color: '#8FA8F0' },
    { label: 'Qualified', n: o.funnel.qualified, color: '#B08FF0' },
    { label: 'Won', n: o.funnel.won, color: '#7FE8C4' },
  ];
  const funnelMax = Math.max(1, ...funnel.map((f) => f.n));
  const pipelineTotal = funnel.reduce((s, f) => s + f.n, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0">
          <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.28em] text-[#5EE3DA]">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inset-0 animate-ping rounded-full bg-[#5EE3DA] opacity-60 motion-reduce:animate-none" />
              <span className="relative h-1.5 w-1.5 rounded-full bg-[#5EE3DA]" />
            </span>
            {today}
          </p>
          <h1 className="mt-3 text-[32px] font-extrabold leading-[1.05] tracking-[-0.035em] text-white md:text-[44px]">
            {greeting()},{' '}
            <span className="font-serif font-normal italic text-[#5EE3DA]">
              {user.name.split(' ')[0]}.
            </span>
          </h1>
          <p className="mt-2 max-w-xl text-[14px] leading-[1.6] text-white/55">
            {o.newLeads > 0 ? (
              <>
                <span className="font-semibold text-white">
                  {o.newLeads} lead{o.newLeads === 1 ? '' : 's'}
                </span>{' '}
                waiting for a first reply
                {o.pendingReviews > 0 && (
                  <>
                    {' '}
                    and{' '}
                    <span className="font-semibold text-white">
                      {o.pendingReviews} review{o.pendingReviews === 1 ? '' : 's'}
                    </span>{' '}
                    to approve
                  </>
                )}
                .
              </>
            ) : (
              'Inbox zero. Nothing is waiting on you right now.'
            )}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ButtonLink href="/admin/insights/new">
            <Plus className="h-4 w-4" /> Post
          </ButtonLink>
          <ButtonLink href="/admin/work/new">
            <Plus className="h-4 w-4" /> Case study
          </ButtonLink>
          <ButtonLink href="/admin/command?status=new" variant="primary">
            <Inbox className="h-4 w-4" /> Open inbox
          </ButtonLink>
        </div>
      </header>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <Kpi
          label="Awaiting reply"
          value={o.newLeads}
          sub={o.today ? `${o.today} arrived today` : 'none today yet'}
          href="/admin/command?status=new"
          icon={<Inbox className="h-4 w-4" />}
          accent="#5EE3DA"
        />
        <Kpi
          label="Leads this week"
          value={o.thisWeek}
          sub={
            <span className={delta > 0 ? 'text-[#7FE8C4]' : delta < 0 ? 'text-[#F08F8F]' : ''}>
              {delta > 0 ? '▲' : delta < 0 ? '▼' : '•'} {Math.abs(delta)} vs last week
            </span>
          }
          href="/admin/command?status=all"
          icon={<TrendingUp className="h-4 w-4" />}
          accent="#8FA8F0"
          spark={o.days.slice(-14).map((d) => d.total)}
        />
        <Kpi
          label="Won this month"
          value={o.wonThisMonth}
          sub="deals marked won"
          href="/admin/command?status=won"
          icon={<Trophy className="h-4 w-4" />}
          accent="#7FE8C4"
        />
        <Kpi
          label="Pending reviews"
          value={o.pendingReviews}
          sub={o.pendingReviews ? 'waiting for your approval' : 'nothing to approve'}
          href="/admin/reviews"
          icon={<Star className="h-4 w-4" />}
          accent="#F0C88F"
        />
      </div>

      {/* Chart + sources */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)]">
        <Card className="min-w-0 bg-[#070A10]/80 backdrop-blur-sm">
          <div className="flex flex-wrap items-end justify-between gap-3 border-b border-white/[0.12] px-5 py-4">
            <div>
              <h2 className="text-[13.5px] font-semibold text-white">Leads per day</h2>
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/35">
                last 30 days
              </p>
            </div>
            <div className="flex gap-6 text-right">
              <div>
                <p className="text-[22px] font-bold leading-none text-white">{total30}</p>
                <p className="mt-1 text-[11px] text-white/40">total</p>
              </div>
              <div>
                <p className="text-[22px] font-bold leading-none text-white">
                  {(total30 / 30).toFixed(1)}
                </p>
                <p className="mt-1 text-[11px] text-white/40">per day</p>
              </div>
            </div>
          </div>
          <div className="p-5">
            <LeadsChart days={o.days} height={210} />
          </div>
        </Card>

        <Card className="min-w-0 bg-[#070A10]/80 backdrop-blur-sm">
          <CardHeader title="Where they came from" meta="last 30 days" />
          <ul className="space-y-3.5 p-5">
            {o.bySource
              .slice()
              .sort((a, b) => b.total - a.total)
              .map((s) => (
                <li key={s.key}>
                  <Link href={`/admin/command?source=${s.key}&status=all`} className="group block">
                    <div className="flex items-center justify-between text-[12.5px]">
                      <span className="flex items-center gap-2 text-white/75 group-hover:text-white">
                        <span className="h-2 w-2 rounded-full" style={{ background: s.accent }} />
                        {s.label}
                      </span>
                      <span className="font-mono text-white/80">
                        {s.total}
                        <span className="ml-1.5 text-white/30">
                          {total30 ? Math.round((s.total / total30) * 100) : 0}%
                        </span>
                      </span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/[0.05]">
                      <div
                        className="h-full rounded-full bg-[#5EE3DA]/70 transition-all group-hover:bg-[#5EE3DA]"
                        style={{ width: `${(s.total / maxSource) * 100}%` }}
                      />
                    </div>
                  </Link>
                </li>
              ))}
          </ul>
        </Card>
      </div>

      {/* Needs you + pipeline/publishing */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)]">
        <Card className="min-w-0 bg-[#070A10]/80 backdrop-blur-sm">
          <CardHeader
            title="Needs you"
            meta={`${o.newLeads} new`}
            action={
              <Link
                href="/admin/command?status=new"
                className="flex items-center gap-1 text-[12px] text-[#5EE3DA] hover:underline"
              >
                Open inbox <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            }
          />
          {o.needsYou.length === 0 ? (
            <p className="px-5 py-12 text-center text-[13px] text-white/40">
              No unanswered leads. Nice.
            </p>
          ) : (
            <ul className="divide-y divide-white/[0.05]">
              {o.needsYou.map((l) => {
                const s = SOURCE_BY_KEY[l.source];
                return (
                  <li key={`${l.source}-${l.id}`}>
                    <Link
                      href={`/admin/command?lead=${l.source}:${l.id}`}
                      className="group flex items-center gap-3.5 px-5 py-3.5 transition-colors hover:bg-white/[0.03]"
                    >
                      <span
                        className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-[12px] font-bold text-[#02040A]"
                        style={{ background: s.accent }}
                      >
                        {(l.name || l.email).slice(0, 1).toUpperCase()}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex min-w-0 items-center gap-2">
                          <span className="truncate text-[13.5px] font-semibold text-white">
                            {l.name || l.email}
                          </span>
                          <span
                            className="shrink-0 rounded-full px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.12em]"
                            style={{ color: s.accent, background: `${s.accent}14` }}
                          >
                            {s.label}
                          </span>
                        </span>
                        <span className="mt-0.5 block truncate text-[12.5px] text-white/45">
                          {l.headline}
                        </span>
                      </span>
                      <span className="flex shrink-0 flex-col items-end gap-1">
                        <RelativeTime iso={l.createdAt} className="text-[11.5px] text-white/35" />
                        <ArrowRight className="h-3.5 w-3.5 text-white/20 transition-all group-hover:translate-x-0.5 group-hover:text-[#5EE3DA]" />
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <div className="grid min-w-0 gap-4">
          <Card className="min-w-0 bg-[#070A10]/80 backdrop-blur-sm">
            <CardHeader title="Pipeline" meta={`${pipelineTotal} active`} />
            <ul className="space-y-3 p-5">
              {funnel.map((f, i) => {
                const prev = i > 0 ? funnel[i - 1].n : null;
                return (
                  <li key={f.label}>
                    <Link
                      href={`/admin/command?status=${f.label.toLowerCase()}`}
                      className="group block"
                    >
                      <div className="flex items-center justify-between text-[12.5px]">
                        <span className="text-white/75 group-hover:text-white">{f.label}</span>
                        <span className="font-mono text-white">
                          {f.n}
                          {prev !== null && prev > 0 && (
                            <span className="ml-1.5 text-white/30">
                              {Math.round((f.n / prev) * 100)}%
                            </span>
                          )}
                        </span>
                      </div>
                      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/[0.05]">
                        <div
                          className="h-full rounded-full transition-opacity group-hover:opacity-100"
                          style={{
                            width: `${(f.n / funnelMax) * 100}%`,
                            background: f.color,
                            opacity: 0.75,
                          }}
                        />
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </Card>

          <Card className="min-w-0 bg-[#070A10]/80 backdrop-blur-sm">
            <CardHeader title="On the website" />
            <ul className="divide-y divide-white/[0.05]">
              {[
                {
                  href: '/admin/insights',
                  icon: <PenLine className="h-4 w-4" />,
                  label: 'Insights',
                  live: o.publishedInsights,
                  draft: o.draftInsights,
                  create: '/admin/insights/new',
                },
                {
                  href: '/admin/work',
                  icon: <BriefcaseBusiness className="h-4 w-4" />,
                  label: 'Case studies',
                  live: o.liveWork,
                  draft: o.draftWork,
                  create: '/admin/work/new',
                },
              ].map((r) => (
                <li key={r.label} className="flex items-center gap-3 px-5 py-3.5">
                  <span className="grid h-9 w-9 place-items-center rounded-xl border border-white/[0.14] bg-white/[0.03] text-white/50">
                    {r.icon}
                  </span>
                  <Link href={r.href} className="min-w-0 flex-1 hover:text-white">
                    <span className="block text-[13.5px] font-semibold text-white">{r.label}</span>
                    <span className="block text-[12px] text-white/45">
                      {r.live} live{r.draft ? ` · ${r.draft} draft` : ''}
                    </span>
                  </Link>
                  <Link
                    href={r.create}
                    aria-label={`New ${r.label.toLowerCase()}`}
                    className="grid h-8 w-8 place-items-center rounded-lg border border-white/[0.1] text-white/50 transition-colors hover:border-[#5EE3DA]/50 hover:text-[#5EE3DA]"
                  >
                    <Plus className="h-4 w-4" />
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>

      {/* Clients: what needs attention */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[15px] font-semibold text-white">
            Clients <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/35">{cl.active} active · {cl.leads} leads</span>
          </h2>
          <Link href="/admin/clients" className="inline-flex items-center gap-1 text-[12.5px] text-[#5EE3DA] hover:underline">Open clients <ArrowRight className="h-3.5 w-3.5" /></Link>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card className="min-w-0 bg-[#070A10]/80 backdrop-blur-sm">
            <CardHeader title="Follow-ups due" meta={`${cl.followups.length}`} />
            <ul className="divide-y divide-white/[0.1]">
              {cl.followups.length === 0 && <li className="px-5 py-6 text-center text-[12.5px] text-white/40">Nothing to follow up. Nice.</li>}
              {cl.followups.map((f) => (
                <li key={f.id}>
                  <Link href={`/admin/clients/${f.id}`} className="block px-5 py-3 hover:bg-white/[0.03]">
                    <span className="block truncate text-[13px] font-semibold text-white">{f.name}</span>
                    <span className={`block truncate text-[12px] ${f.overdue ? 'text-red-300' : 'text-[#F0C88F]'}`}>{f.overdue ? 'Overdue' : 'Today'}{f.note && ` · ${f.note}`}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
          <Card className="min-w-0 bg-[#070A10]/80 backdrop-blur-sm">
            <CardHeader title="Renewals (30 days)" meta={`${cl.renewals.length}`} />
            <ul className="divide-y divide-white/[0.1]">
              {cl.renewals.length === 0 && <li className="px-5 py-6 text-center text-[12.5px] text-white/40">No care plans renewing soon.</li>}
              {cl.renewals.map((r, i) => (
                <li key={`${r.clientId}-${i}`}>
                  <Link href={`/admin/clients/${r.clientId}`} className="block px-5 py-3 hover:bg-white/[0.03]">
                    <span className="block truncate text-[13px] font-semibold text-white">{r.client}</span>
                    <span className={`block truncate text-[12px] ${r.overdue ? 'text-red-300' : 'text-white/50'}`}>{r.service} · {r.overdue ? 'was due ' : ''}{r.date}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
          <Card className="min-w-0 bg-[#070A10]/80 backdrop-blur-sm">
            <CardHeader title="Unpaid invoices" meta={formatRM(cl.unpaid.total)} />
            <ul className="divide-y divide-white/[0.1]">
              {cl.unpaid.items.length === 0 && <li className="px-5 py-6 text-center text-[12.5px] text-white/40">Everything is paid.</li>}
              {cl.unpaid.items.map((u, i) => (
                <li key={`${u.clientId}-${i}`}>
                  <Link href={`/admin/clients/${u.clientId}`} className="flex items-baseline justify-between gap-3 px-5 py-3 hover:bg-white/[0.03]">
                    <span className="min-w-0 truncate text-[13px] font-semibold text-white">{u.client}</span>
                    <span className={`shrink-0 text-[12px] ${u.overdue ? 'text-red-300' : 'text-white/55'}`}>{formatRM(u.amount)}{u.overdue && ' overdue'}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
          <Card className="min-w-0 bg-[#070A10]/80 backdrop-blur-sm">
            <CardHeader title="Gone quiet (30+ days)" meta={`${cl.quiet.length}`} />
            <ul className="divide-y divide-white/[0.1]">
              {cl.quiet.length === 0 && <li className="px-5 py-6 text-center text-[12.5px] text-white/40">Everyone active has been in touch lately.</li>}
              {cl.quiet.map((q) => (
                <li key={q.id}>
                  <Link href={`/admin/clients/${q.id}`} className="block px-5 py-3 hover:bg-white/[0.03]">
                    <span className="block truncate text-[13px] font-semibold text-white">{q.name}</span>
                    <span className="block text-[12px] text-white/45">{q.last ? <RelativeTime iso={q.last} /> : 'No contact logged'}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
