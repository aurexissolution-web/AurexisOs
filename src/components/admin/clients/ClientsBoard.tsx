'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Plus, Search, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  CLIENT_STATUSES,
  STATUS_BY_KEY,
  followUpState,
  groupByLetter,
  letterOf,
  normalizePhone,
  sortClients,
  type Client,
  type ClientContact,
  type ClientStatus,
  type SortKey,
} from '@/lib/admin/clients';
import { Button, ButtonLink, Card, EmptyState, PageHeader, Pill, Segmented, timeAgo } from '../ui';
import { NewClientDialog } from './NewClientDialog';

const LETTERS = [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ', '#'];

export type ClientRow = Client & { primary: Pick<ClientContact, 'email' | 'phone' | 'name'> | null };

function Row({ c, now }: { c: ClientRow; now: number }) {
  const status = STATUS_BY_KEY[c.status];
  const fu = followUpState(c.next_followup_at, now);
  return (
    <Link
      href={`/admin/clients/${c.id}`}
      className="group flex items-center gap-3.5 border-b border-white/[0.08] px-4 py-3 outline-none transition-colors last:border-b-0 hover:bg-white/[0.035] focus-visible:bg-white/[0.05] sm:px-5"
    >
      <span
        className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-[14px] font-semibold text-[#02040A]"
        style={{ background: status.color }}
        aria-hidden
      >
        {letterOf(c.name) === '#' ? c.name.slice(0, 1) : letterOf(c.name)}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-baseline gap-2">
          <span className="truncate text-[14.5px] font-semibold text-white">{c.name}</span>
          {c.company && <span className="hidden truncate text-[12.5px] text-white/40 sm:inline">{c.company}</span>}
        </span>
        <span className="mt-0.5 block truncate text-[12.5px] text-white/50">
          {[c.primary?.name && c.primary.name !== c.name ? c.primary.name : '', c.primary?.email, c.primary?.phone]
            .filter(Boolean)
            .join(' · ') || 'No contact details yet'}
        </span>
      </span>
      <span className="hidden shrink-0 flex-col items-end gap-1 md:flex">
        {fu === 'overdue' && <Pill color="#F08F8F">Follow-up overdue</Pill>}
        {fu === 'today' && <Pill color="#F0C88F">Follow up today</Pill>}
        {fu !== 'overdue' && fu !== 'today' && (
          <span className="text-[11.5px] text-white/35">
            {c.last_contact_at ? `Last contact ${timeAgo(c.last_contact_at)}` : 'No contact yet'}
          </span>
        )}
      </span>
      <Pill color={status.color}>{status.label}</Pill>
    </Link>
  );
}

export function ClientsBoard({
  clients,
  owners,
  meId,
}: {
  clients: ClientRow[];
  owners: { id: string; name: string }[];
  meId: string;
}) {
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<ClientStatus | 'all'>('all');
  const [owner, setOwner] = useState<string>('all');
  const [sort, setSort] = useState<SortKey>('name');
  const [dueOnly, setDueOnly] = useState(false);
  const [creating, setCreating] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const search = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setNow(Date.now());
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      const typing = t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT');
      if (typing || e.metaKey || e.ctrlKey || e.altKey || document.querySelector('dialog[open]')) return;
      if (e.key === '/') { e.preventDefault(); search.current?.focus(); }
      else if (e.key.toLowerCase() === 'n') { e.preventDefault(); setCreating(true); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const counts = useMemo(() => {
    const m: Record<string, number> = { all: clients.length };
    for (const c of clients) m[c.status] = (m[c.status] ?? 0) + 1;
    return m;
  }, [clients]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    const phoneTerm = /^[\d+\s()-]{4,}$/.test(term) ? normalizePhone(term) : null;
    const rows = clients.filter((c) => {
      if (status !== 'all' && c.status !== status) return false;
      if (owner !== 'all' && c.owner_id !== owner) return false;
      if (dueOnly && !['overdue', 'today'].includes(followUpState(c.next_followup_at, now))) return false;
      if (!term) return true;
      const hay = [c.name, c.company, c.industry, c.primary?.email, c.primary?.name, c.tags.join(' ')].join(' ').toLowerCase();
      if (hay.includes(term)) return true;
      return Boolean(phoneTerm && normalizePhone(c.primary?.phone)?.includes(phoneTerm));
    });
    return sortClients(rows, sort);
  }, [clients, q, status, owner, sort, dueOnly, now]);

  const groups = useMemo(() => (sort === 'name' ? groupByLetter(filtered) : []), [filtered, sort]);
  const present = useMemo(() => new Set(groups.map((g) => g.letter)), [groups]);
  const dueCount = useMemo(
    () => clients.filter((c) => ['overdue', 'today'].includes(followUpState(c.next_followup_at, now))).length,
    [clients, now],
  );

  const jump = (l: string) =>
    document.getElementById(`letter-${l === '#' ? 'other' : l}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Every client, one place"
        title="Clients"
        accent="A–Z."
        description="Everyone you've talked to and worked with: what they asked, what you sent, what's next."
        actions={
          <>
            <ButtonLink href="/admin/clients/import">Import CSV</ButtonLink>
            <Button variant="primary" onClick={() => setCreating(true)}>
              <Plus className="h-4 w-4" /> New client
            </Button>
          </>
        }
      />
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
          <input
            ref={search}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name, company, email, phone…"
            aria-label="Search clients"
            className="h-10 w-full rounded-xl border border-white/[0.12] bg-white/[0.03] pl-10 pr-10 text-[14px] text-white outline-none placeholder:text-white/30 focus:border-[#5EE3DA]/50 focus:ring-2 focus:ring-[#5EE3DA]/15"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 rounded border border-white/15 px-1.5 font-mono text-[10px] text-white/35">/</kbd>
        </div>
        <Segmented
          value={sort}
          onChange={setSort}
          options={[{ value: 'name', label: 'A–Z' }, { value: 'recent', label: 'Recent' }, { value: 'newest', label: 'Newest' }]}
        />
        {owners.length > 1 && (
          <select
            value={owner}
            onChange={(e) => setOwner(e.target.value)}
            aria-label="Filter by owner"
            className="h-10 rounded-xl border border-white/[0.12] bg-white/[0.03] px-3 text-[13px] text-white/80 outline-none focus:border-[#5EE3DA]/50"
          >
            <option value="all" className="bg-[#070B12]">All owners</option>
            {owners.map((o) => (
              <option key={o.id} value={o.id} className="bg-[#070B12]">{o.id === meId ? `${o.name} (me)` : o.name}</option>
            ))}
          </select>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        {[{ key: 'all' as const, label: 'All', color: '#5EE3DA' }, ...CLIENT_STATUSES.map((s) => ({ key: s.key, label: s.label, color: s.color }))].map((s) => {
          const on = status === s.key;
          return (
            <button
              key={s.key}
              type="button"
              aria-pressed={on}
              onClick={() => setStatus(s.key)}
              className={cn(
                'inline-flex h-8 items-center gap-2 rounded-full border px-3.5 text-[12.5px] font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[#5EE3DA]/50',
                on ? 'border-white/30 bg-white/[0.09] text-white' : 'border-white/[0.12] text-white/55 hover:border-white/25 hover:text-white/85',
              )}
            >
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: s.color }} />
              {s.label}
              <span className="font-mono text-[10.5px] text-white/40">{counts[s.key] ?? 0}</span>
            </button>
          );
        })}
        {dueCount > 0 && (
          <button
            type="button"
            aria-pressed={dueOnly}
            onClick={() => setDueOnly((d) => !d)}
            className={cn(
              'inline-flex h-8 items-center gap-2 rounded-full border px-3.5 text-[12.5px] font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[#F0C88F]/50',
              dueOnly ? 'border-[#F0C88F]/60 bg-[#F0C88F]/15 text-[#F0C88F]' : 'border-[#F0C88F]/30 text-[#F0C88F]/80 hover:border-[#F0C88F]/60',
            )}
          >
            Follow-ups due <span className="font-mono text-[10.5px]">{dueCount}</span>
          </button>
        )}
      </div>

      {/* A–Z rail */}
      {sort === 'name' && clients.length > 0 && (
        <div className="flex flex-wrap gap-0.5 rounded-xl border border-white/[0.12] bg-white/[0.02] p-1.5" role="navigation" aria-label="Jump to letter">
          {LETTERS.map((l) => {
            const has = present.has(l);
            return (
              <button
                key={l}
                type="button"
                disabled={!has}
                onClick={() => jump(l)}
                className={cn(
                  'grid h-7 w-7 place-items-center rounded-md font-mono text-[11.5px] outline-none transition-colors focus-visible:ring-1 focus-visible:ring-[#5EE3DA]',
                  has ? 'text-white/85 hover:bg-[#5EE3DA]/15 hover:text-[#5EE3DA]' : 'text-white/20',
                )}
              >
                {l}
              </button>
            );
          })}
        </div>
      )}

      <Card className="overflow-hidden bg-[#070A10]/80 backdrop-blur-sm">
        {clients.length === 0 ? (
          <EmptyState
            icon={<Users className="h-5 w-5" />}
            title="No clients yet"
            body="Add your first client, or wait for the next website enquiry: enquiries turn into leads here automatically."
            action={<Button variant="primary" onClick={() => setCreating(true)}><Plus className="h-4 w-4" /> New client</Button>}
          />
        ) : filtered.length === 0 ? (
          <EmptyState icon={<Search className="h-5 w-5" />} title="No matches" body="Try a different search, or clear the filters." />
        ) : sort === 'name' ? (
          groups.map((g) => (
            <section key={g.letter} id={`letter-${g.letter === '#' ? 'other' : g.letter}`} className="scroll-mt-4">
              <h3 className="sticky top-0 z-10 border-b border-white/[0.08] bg-[#0A0E15]/95 px-5 py-1.5 font-mono text-[11px] tracking-[0.2em] text-[#5EE3DA] backdrop-blur">
                {g.letter}
                <span className="ml-2 text-white/30">{g.items.length}</span>
              </h3>
              {g.items.map((c) => <Row key={c.id} c={c} now={now} />)}
            </section>
          ))
        ) : (
          filtered.map((c) => <Row key={c.id} c={c} now={now} />)
        )}
      </Card>

      <p className="text-center font-mono text-[10.5px] uppercase tracking-[0.18em] text-white/30">
        {filtered.length} of {clients.length} · press <span className="text-white/50">/</span> to search · <span className="text-white/50">N</span> for new
      </p>

      {creating && <NewClientDialog owners={owners} meId={meId} onClose={() => setCreating(false)} />}
    </div>
  );
}
