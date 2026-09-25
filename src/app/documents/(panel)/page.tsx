// src/app/documents/(panel)/page.tsx
import Link from 'next/link';
import { FileText } from 'lucide-react';
import { docsAuthed } from '@/lib/documents/access';
import { supabaseAdmin } from '@/lib/supabase/server';
import { dateKeyOf } from '@/lib/admin/calendar';
import { ButtonLink, Card, CardHeader, EmptyState, PageHeader } from '@/components/admin/ui';
import { daysBetween, summarize, type DocRow } from '@/lib/documents/stats';
import { formatDocDate, formatRMDoc } from '@/lib/documents/model';

export const dynamic = 'force-dynamic';

const HREF = { proposal: '/documents/proposals', invoice: '/documents/billing', receipt: '/documents/billing' } as const;

function Stat({ label, value, sub, accent }: { label: string; value: string; sub: string; accent?: boolean }) {
  return (
    <Card className="p-5">
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/45">{label}</p>
      <p className={`mt-3 text-[28px] font-extrabold leading-none tracking-[-0.03em] ${accent ? 'text-[#5EE3DA]' : 'text-white'}`}>{value}</p>
      <p className="mt-2 text-[12px] text-white/40">{sub}</p>
    </Card>
  );
}

export default async function DocumentsOverview() {
  if (!(await docsAuthed())) return null;
  const { data, error } = await supabaseAdmin
    .from('documents')
    .select('id,kind,number,title,status,total_myr,doc_date,source_id')
    .order('doc_date', { ascending: false })
    .limit(5000);

  const header = (
    <PageHeader
      eyebrow="Documents"
      title="Overview"
      accent="at a glance."
      description="What you have sent, what has been paid, and what is still waiting."
      actions={
        <>
          <ButtonLink href="/documents/proposals/new" variant="primary">New proposal</ButtonLink>
          <ButtonLink href="/documents/billing/new?kind=invoice">New invoice</ButtonLink>
          <ButtonLink href="/documents/billing/new?kind=receipt">New receipt</ButtonLink>
        </>
      }
    />
  );

  if (error) {
    return (
      <div className="space-y-6">
        {header}
        <Card>
          <EmptyState
            icon={<FileText className="h-5 w-5" />}
            title="The documents table isn't set up yet"
            body="Run supabase/migrations/037_documents.sql in the Supabase SQL Editor, then reload this page."
          />
        </Card>
      </div>
    );
  }

  const today = dateKeyOf(new Date().toISOString());
  const rows = (data ?? []).map((r) => ({ ...r, total_myr: Number(r.total_myr) })) as DocRow[];
  const s = summarize(rows, today);
  const monthName = new Date(`${today}T00:00:00Z`).toLocaleString('en-MY', { month: 'long', timeZone: 'UTC' });

  return (
    <div className="space-y-6">
      {header}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label={`Invoiced in ${monthName}`} value={formatRMDoc(s.invoicedMonth)} sub={`${s.counts.invoice} invoice${s.counts.invoice === 1 ? '' : 's'} in total`} />
        <Stat label={`Collected in ${monthName}`} value={formatRMDoc(s.collectedMonth)} sub={`${s.counts.receipt} receipt${s.counts.receipt === 1 ? '' : 's'} in total`} accent />
        <Stat label="Still to collect" value={formatRMDoc(s.outstanding)} sub={`${s.unpaid.length} unpaid invoice${s.unpaid.length === 1 ? '' : 's'}`} />
        <Stat label="Proposals" value={String(s.proposalsTotal)} sub={`${s.proposalsMonth} this month · ${formatRMDoc(s.proposalValue)} quoted`} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader title="Waiting for payment" meta={`${s.unpaid.length}`} />
          {s.unpaid.length === 0 ? (
            <p className="px-5 py-8 text-center text-[13px] text-white/45">Nothing outstanding. Every invoice has a receipt.</p>
          ) : (
            <ul>
              {s.unpaid.slice(0, 8).map((u) => {
                const age = daysBetween(u.doc_date, today);
                return (
                  <li key={u.id} className="flex items-center justify-between gap-3 border-b border-white/[0.06] px-5 py-3 last:border-0">
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-semibold text-white">{u.number} <span className="font-normal text-white/50">· {u.title}</span></p>
                      <p className={`text-[11.5px] ${age > 14 ? 'text-amber-300/90' : 'text-white/40'}`}>{age === 0 ? 'Issued today' : `${age} day${age === 1 ? '' : 's'} old`}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <span className="text-[13px] tabular-nums text-white/85">{formatRMDoc(u.balance)}</span>
                      <Link href={`/documents/billing/new?kind=receipt&from=${u.id}`} className="text-[12px] font-semibold text-[#5EE3DA] hover:underline">Receipt</Link>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <Card>
          <CardHeader title="Latest documents" meta={`${rows.length} total`} />
          {s.recent.length === 0 ? (
            <p className="px-5 py-8 text-center text-[13px] text-white/45">Nothing created yet. Start with a proposal or an invoice.</p>
          ) : (
            <ul>
              {s.recent.map((r) => (
                <li key={r.id} className="border-b border-white/[0.06] last:border-0">
                  <Link href={HREF[r.kind]} className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-white/[0.03]">
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-semibold text-white">
                        {r.number} <span className="ml-1 font-mono text-[10px] uppercase tracking-wider text-white/35">{r.kind}</span>
                      </p>
                      <p className="truncate text-[11.5px] text-white/45">{r.title} · {formatDocDate(r.doc_date)}</p>
                    </div>
                    <span className="shrink-0 text-[12px] text-white/50">
                      {r.status === 'void' ? 'Void' : r.kind === 'proposal' ? (r.total_myr ? formatRMDoc(r.total_myr) : '') : formatRMDoc(r.total_myr)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
