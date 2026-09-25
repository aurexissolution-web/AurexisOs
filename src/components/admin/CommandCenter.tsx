'use client';

// src/components/admin/CommandCenter.tsx
// Every form on the site in one inbox. List on the left, the lead on the
// right (full-screen sheet on phones). J/K to move, E contacted, W won.
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft,
  Check,
  CalendarPlus,
  Users,
  Copy,
  Inbox,
  Keyboard,
  Mail,
  MapPin,
  MessageCircle,
  Search,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  LEAD_SOURCES,
  LEAD_STATUSES,
  SOURCE_BY_KEY,
  whatsappLink,
  type Lead,
  type LeadSourceKey,
  type LeadStatus,
} from '@/lib/admin/lead-sources';
import { saveLeadNotes, updateLeadStatus } from '@/app/admin/actions';
import { EmptyState, PageHeader, Pill, Segmented, Textarea, useToast } from './ui';
import { RelativeTime } from './RelativeTime';

type StatusFilter = 'open' | 'all' | LeadStatus;
const OPEN: LeadStatus[] = ['new', 'contacted', 'qualified'];
const STATUS_BY_KEY = Object.fromEntries(LEAD_STATUSES.map((s) => [s.key, s]));
const keyOf = (l: Pick<Lead, 'source' | 'id'>) => `${l.source}:${l.id}`;

function matchesStatus(l: Lead, f: StatusFilter) {
  if (f === 'all') return true;
  if (f === 'open') return OPEN.includes(l.status);
  return l.status === f;
}

export function CommandCenter({
  leads: initial,
  adminName,
  initialSource,
  initialStatus,
  initialLead,
}: {
  leads: Lead[];
  adminName: string;
  initialSource: LeadSourceKey | 'all';
  initialStatus: string;
  initialLead: string | null;
}) {
  const router = useRouter();
  const toast = useToast();
  const [leads, setLeads] = useState(initial);
  const [source, setSource] = useState<LeadSourceKey | 'all'>(initialSource);
  const [status, setStatus] = useState<StatusFilter>(
    (['open', 'all', ...LEAD_STATUSES.map((s) => s.key)] as string[]).includes(initialStatus)
      ? (initialStatus as StatusFilter)
      : 'open',
  );
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<string | null>(initialLead);
  const [mobileOpen, setMobileOpen] = useState(Boolean(initialLead));
  const searchRef = useRef<HTMLInputElement>(null);
  const [, startTransition] = useTransition();

  useEffect(() => setLeads(initial), [initial]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return leads.filter(
      (l) =>
        (source === 'all' || l.source === source) &&
        matchesStatus(l, status) &&
        (!q ||
          [l.name, l.email, l.phone ?? '', l.headline].some((v) => v.toLowerCase().includes(q))),
    );
  }, [leads, source, status, query]);

  const countFor = (k: LeadSourceKey | 'all') =>
    leads.filter((l) => (k === 'all' || l.source === k) && matchesStatus(l, status)).length;

  // Keep a selection on desktop; drop it if the filter hid the lead.
  useEffect(() => {
    if (selected && !visible.some((l) => keyOf(l) === selected)) {
      if (!leads.some((l) => keyOf(l) === selected))
        setSelected(visible[0] ? keyOf(visible[0]) : null);
    } else if (!selected && visible[0] && window.matchMedia('(min-width: 1024px)').matches) {
      setSelected(keyOf(visible[0]));
    }
  }, [visible, selected, leads]);

  const current = leads.find((l) => keyOf(l) === selected) ?? null;

  const setLeadStatus = useCallback(
    (lead: Lead, next: LeadStatus) => {
      if (lead.status === next) return;
      const prev = lead.status;
      setLeads((ls) =>
        ls.map((l) =>
          keyOf(l) === keyOf(lead)
            ? {
                ...l,
                status: next,
                contactedAt: next === 'contacted' ? new Date().toISOString() : l.contactedAt,
              }
            : l,
        ),
      );
      startTransition(async () => {
        const res = await updateLeadStatus(lead.source, lead.id, next);
        if (!res.ok) {
          setLeads((ls) => ls.map((l) => (keyOf(l) === keyOf(lead) ? { ...l, status: prev } : l)));
          toast('error', 'Couldn’t update status');
        } else {
          toast('ok', `Marked ${STATUS_BY_KEY[next].label.toLowerCase()}`);
          router.refresh();
        }
      });
    },
    [router, toast],
  );

  // Keyboard shortcuts
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const t = e.target as HTMLElement;
      if (t.closest('input, textarea, [contenteditable]')) {
        if (e.key === 'Escape') (t as HTMLElement).blur();
        return;
      }
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const i = visible.findIndex((l) => keyOf(l) === selected);
      if (e.key === 'j' || e.key === 'ArrowDown') {
        e.preventDefault();
        const n = visible[Math.min(visible.length - 1, i + 1)];
        if (n) setSelected(keyOf(n));
      } else if (e.key === 'k' || e.key === 'ArrowUp') {
        e.preventDefault();
        const n = visible[Math.max(0, i - 1)];
        if (n) setSelected(keyOf(n));
      } else if (e.key === '/') {
        e.preventDefault();
        searchRef.current?.focus();
      } else if (current && e.key === 'e') {
        setLeadStatus(current, 'contacted');
      } else if (current && e.key === 'w') {
        setLeadStatus(current, 'won');
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [visible, selected, current, setLeadStatus]);

  // Scroll the selected row into view when moving with J/K.
  useEffect(() => {
    if (selected) document.getElementById(`lead-${selected}`)?.scrollIntoView({ block: 'nearest' });
  }, [selected]);

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Every form, one inbox"
        title="Command"
        accent="Center."
        actions={
          <div className="relative w-full md:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
            <input
              ref={searchRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, email, phone…"
              className="h-10 w-full rounded-xl border border-white/[0.1] bg-white/[0.03] pl-9 pr-10 text-[13.5px] text-white outline-none placeholder:text-white/30 focus:border-[#5EE3DA]/50"
            />
            <kbd className="pointer-events-none absolute right-2.5 top-1/2 hidden -translate-y-1/2 rounded border border-white/15 px-1.5 font-mono text-[10px] text-white/35 md:block">
              /
            </kbd>
          </div>
        }
      />

      {/* Source tabs */}
      <div className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none] md:mx-0 md:px-0">
        <div className="flex w-max gap-1.5">
          {(['all', ...LEAD_SOURCES.map((s) => s.key)] as const).map((k) => {
            const active = source === k;
            const s = k === 'all' ? null : SOURCE_BY_KEY[k];
            const n = countFor(k);
            return (
              <button
                key={k}
                type="button"
                onClick={() => setSource(k)}
                className={cn(
                  'flex h-9 items-center gap-2 rounded-full border px-3.5 text-[12.5px] font-medium transition-colors',
                  active
                    ? 'border-white/25 bg-white/[0.08] text-white'
                    : 'border-white/[0.07] text-white/50 hover:text-white/80',
                )}
              >
                {s && <span className="h-2 w-2 rounded-full" style={{ background: s.accent }} />}
                {s ? s.label : 'All forms'}
                <span
                  className={cn(
                    'font-mono text-[11px]',
                    active ? 'text-[#5EE3DA]' : 'text-white/30',
                  )}
                >
                  {n}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none] md:mx-0 md:px-0">
        <Segmented<StatusFilter>
          size="sm"
          value={status}
          onChange={setStatus}
          options={[
            { value: 'open', label: 'Open' },
            ...LEAD_STATUSES.map((s) => ({
              value: s.key as StatusFilter,
              label: s.label,
              color: s.color,
            })),
            { value: 'all', label: 'All' },
          ]}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(320px,420px)_1fr]">
        {/* List */}
        <div className="overflow-hidden rounded-2xl border border-white/[0.14] bg-white/[0.02]">
          {visible.length === 0 ? (
            <EmptyState
              icon={<Inbox className="h-5 w-5" />}
              title={leads.length === 0 ? 'No leads yet' : 'Nothing matches'}
              body={
                leads.length === 0
                  ? 'When someone submits a quote, contact or calculator form, it lands here instantly.'
                  : 'Try another form, status or search.'
              }
            />
          ) : (
            <ul className="max-h-[calc(100vh-300px)] min-h-[420px] divide-y divide-white/[0.05] overflow-y-auto">
              {visible.map((l) => {
                const s = SOURCE_BY_KEY[l.source];
                const active = keyOf(l) === selected;
                return (
                  <li key={keyOf(l)} id={`lead-${keyOf(l)}`}>
                    <button
                      type="button"
                      onClick={() => {
                        setSelected(keyOf(l));
                        setMobileOpen(true);
                      }}
                      className={cn(
                        'relative flex w-full gap-3 px-4 py-3.5 text-left transition-colors',
                        active ? 'bg-white/[0.06]' : 'hover:bg-white/[0.03]',
                      )}
                    >
                      {active && (
                        <span className="absolute inset-y-2 left-0 w-[3px] rounded-r-full bg-[#5EE3DA]" />
                      )}
                      <span
                        className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full text-[12px] font-bold text-[#02040A]"
                        style={{ background: s.accent }}
                      >
                        {(l.name || l.email).slice(0, 1).toUpperCase()}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2">
                          <span
                            className={cn(
                              'truncate text-[13.5px]',
                              l.status === 'new'
                                ? 'font-bold text-white'
                                : 'font-medium text-white/80',
                            )}
                          >
                            {l.name || l.email}
                          </span>
                          {l.status === 'new' && (
                            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#5EE3DA]" />
                          )}
                          <RelativeTime
                            iso={l.createdAt}
                            className="ml-auto shrink-0 text-[11px] text-white/35"
                          />
                        </span>
                        <span className="mt-0.5 block truncate text-[12.5px] text-white/45">
                          {l.headline || '—'}
                        </span>
                        <span className="mt-1.5 flex items-center gap-2">
                          <span
                            className="font-mono text-[9.5px] uppercase tracking-[0.14em]"
                            style={{ color: s.accent }}
                          >
                            {s.label}
                          </span>
                          {l.status !== 'new' && (
                            <span
                              className="text-[10.5px]"
                              style={{ color: STATUS_BY_KEY[l.status].color }}
                            >
                              · {STATUS_BY_KEY[l.status].label}
                            </span>
                          )}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Detail (desktop) */}
        <div className="hidden lg:block">
          {current ? (
            <LeadDetail
              key={keyOf(current)}
              lead={current}
              adminName={adminName}
              onStatus={setLeadStatus}
            />
          ) : (
            <div className="grid h-full min-h-[420px] place-items-center rounded-2xl border border-dashed border-white/[0.14] text-[13px] text-white/35">
              Select a lead
            </div>
          )}
          <p className="mt-3 flex items-center gap-2 text-[11px] text-white/30">
            <Keyboard className="h-3.5 w-3.5" />
            <kbd className="font-mono">J</kbd>/<kbd className="font-mono">K</kbd> move ·{' '}
            <kbd className="font-mono">E</kbd> contacted · <kbd className="font-mono">W</kbd> won ·{' '}
            <kbd className="font-mono">/</kbd> search
          </p>
        </div>
      </div>

      {/* Detail (mobile sheet) */}
      <AnimatePresence>
        {mobileOpen && current && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 320 }}
            className="fixed inset-0 z-50 overflow-y-auto bg-[#03050A] lg:hidden"
          >
            <div className="sticky top-0 z-10 flex h-14 items-center gap-2 border-b border-white/[0.12] bg-[#03050A]/90 px-3 backdrop-blur-xl">
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="grid h-10 w-10 place-items-center rounded-lg text-white/70"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <span className="text-[14px] font-semibold">Lead</span>
            </div>
            <div className="p-4 pb-10">
              <LeadDetail
                key={keyOf(current)}
                lead={current}
                adminName={adminName}
                onStatus={setLeadStatus}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function LeadDetail({
  lead,
  adminName,
  onStatus,
}: {
  lead: Lead;
  adminName: string;
  onStatus: (lead: Lead, s: LeadStatus) => void;
}) {
  const toast = useToast();
  const s = SOURCE_BY_KEY[lead.source];
  const [notes, setNotes] = useState(lead.adminNotes);
  const [savedNotes, setSavedNotes] = useState(lead.adminNotes);
  const [saved, setSaved] = useState<'idle' | 'saving' | 'saved'>('idle');
  const first = (lead.name || '').split(' ')[0];
  const greeting = `Hi ${first || 'there'}, this is ${adminName} from Aurexis Solution — thanks for your ${s.label === 'Contact' ? '' : `${s.label} `}enquiry! `;
  const wa = whatsappLink(lead.phone, greeting);
  const mail = `mailto:${lead.email}?subject=${encodeURIComponent(`Your ${s.label === 'Contact' ? '' : `${s.label} `}enquiry — Aurexis Solution`)}&body=${encodeURIComponent(greeting)}`;
  const address = lead.raw.meeting_address as string | undefined;

  async function persistNotes() {
    if (notes === savedNotes) return;
    setSaved('saving');
    const res = await saveLeadNotes(lead.source, lead.id, notes);
    if (res.ok) {
      setSavedNotes(notes);
      setSaved('saved');
      setTimeout(() => setSaved('idle'), 1600);
    } else {
      setSaved('idle');
      toast('error', 'Couldn’t save notes');
    }
  }

  const fields = s.fields
    .map(([col, label]) => [label, lead.raw[col]] as const)
    .filter(([, v]) => v !== null && v !== undefined && String(v).trim() !== '');

  return (
    <article className="overflow-hidden rounded-2xl border border-white/[0.14] bg-white/[0.025]">
      <div
        className="border-b border-white/[0.12] p-5 md:p-6"
        style={{ background: `radial-gradient(80% 120% at 0% 0%, ${s.accent}14, transparent 60%)` }}
      >
        <div className="flex items-start gap-4">
          <span
            className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-[17px] font-bold text-[#02040A]"
            style={{ background: s.accent }}
          >
            {(lead.name || lead.email).slice(0, 1).toUpperCase()}
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-[20px] font-bold tracking-[-0.02em] text-white">
              {lead.name || lead.email}
            </h2>
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              <Pill color={s.accent}>{s.label}</Pill>
              <span className="text-[12px] text-white/40">
                {new Date(lead.createdAt).toLocaleString('en-MY', {
                  day: 'numeric',
                  month: 'short',
                  hour: 'numeric',
                  minute: '2-digit',
                })}{' '}
                · <RelativeTime iso={lead.createdAt} />
              </span>
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {wa && (
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => lead.status === 'new' && onStatus(lead, 'contacted')}
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#25D366] px-4 text-[13px] font-semibold text-[#02040A] transition hover:brightness-110"
            >
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </a>
          )}
          <a
            href={mail}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/[0.12] bg-white/[0.04] px-4 text-[13px] font-semibold text-white/85 transition hover:border-white/25"
          >
            <Mail className="h-4 w-4" /> Email
          </a>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(
                [lead.name, lead.email, lead.phone].filter(Boolean).join('\n'),
              );
              toast('ok', 'Contact copied');
            }}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/[0.12] bg-white/[0.04] px-4 text-[13px] font-semibold text-white/85 transition hover:border-white/25"
          >
            <Copy className="h-4 w-4" /> Copy
          </button>
          <a
            href={`/admin/calendar?new=1&title=${encodeURIComponent(`Call with ${lead.name || lead.email}`)}&with=${encodeURIComponent(lead.name || lead.email)}&lead=${encodeURIComponent(`${lead.source}:${lead.id}`)}${lead.clientId ? `&client=${lead.clientId}` : ''}`}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/[0.12] bg-white/[0.04] px-4 text-[13px] font-semibold text-white/85 transition hover:border-white/25"
          >
            <CalendarPlus className="h-4 w-4" /> Book meeting
          </a>
          {lead.clientId && (
            <a
              href={`/admin/clients/${lead.clientId}`}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#5EE3DA]/35 bg-[#5EE3DA]/[0.07] px-4 text-[13px] font-semibold text-[#5EE3DA] transition hover:bg-[#5EE3DA]/[0.12]"
            >
              <Users className="h-4 w-4" /> Open client
            </a>
          )}
        </div>
        <dl className="mt-4 grid gap-x-6 gap-y-1 text-[13px] sm:grid-cols-2">
          <div className="flex gap-2">
            <dt className="text-white/40">Email</dt>
            <dd className="truncate text-white/85">{lead.email}</dd>
          </div>
          {lead.phone && (
            <div className="flex gap-2">
              <dt className="text-white/40">Phone</dt>
              <dd className="text-white/85">{lead.phone}</dd>
            </div>
          )}
        </dl>
      </div>

      <div className="border-b border-white/[0.12] px-5 py-4 md:px-6">
        <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">
          Status
        </p>
        <Segmented<LeadStatus>
          size="sm"
          value={lead.status}
          onChange={(v) => onStatus(lead, v)}
          options={LEAD_STATUSES.map((st) => ({ value: st.key, label: st.label, color: st.color }))}
        />
        {lead.contactedAt && (
          <p className="mt-2 flex items-center gap-1.5 text-[11.5px] text-white/35">
            <Check className="h-3.5 w-3.5 text-[#8FA8F0]" /> First contacted{' '}
            <RelativeTime iso={lead.contactedAt} />
          </p>
        )}
      </div>

      <div className="px-5 py-5 md:px-6">
        <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">
          What they told us
        </p>
        <dl className="grid gap-3 sm:grid-cols-2">
          {fields.map(([label, v]) => {
            const long = String(v).length > 60;
            return (
              <div
                key={label}
                className={cn(
                  'rounded-xl border border-white/[0.12] bg-white/[0.02] px-3.5 py-2.5',
                  long && 'sm:col-span-2',
                )}
              >
                <dt className="text-[11px] text-white/40">{label}</dt>
                <dd className="mt-0.5 whitespace-pre-wrap text-[13.5px] leading-[1.55] text-white/90">
                  {typeof v === 'number' ? v.toLocaleString('en-MY') : String(v)}
                </dd>
              </div>
            );
          })}
        </dl>
        {address && (
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-1.5 text-[12.5px] text-[#5EE3DA] hover:underline"
          >
            <MapPin className="h-3.5 w-3.5" /> Open meeting address in Google Maps
          </a>
        )}

        <div className="mt-6">
          <div className="mb-1.5 flex items-center justify-between">
            <label
              htmlFor="notes"
              className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/40"
            >
              Private notes
            </label>
            <span className="text-[11px] text-white/35">
              {saved === 'saving'
                ? 'Saving…'
                : saved === 'saved'
                  ? 'Saved ✓'
                  : 'Saves when you click away'}
            </span>
          </div>
          <Textarea
            id="notes"
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={persistNotes}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) persistNotes();
            }}
            placeholder="Call notes, quoted price, next step…"
          />
        </div>
      </div>
    </article>
  );
}
