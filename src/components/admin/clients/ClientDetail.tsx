'use client';

import Link from 'next/link';
import { useState, useTransition } from 'react';
import { ArrowLeft, CalendarPlus, CalendarClock, Mail, MessageCircle, Pencil, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  CLIENT_STATUSES,
  STATUS_BY_KEY,
  followUpState,
  letterOf,
  type Client,
  type ClientActivity,
  type ClientContact,
  type ClientStatus,
} from '@/lib/admin/clients';
import { dateKeyOf, formatRange, fromMyt, parseKey, MONTH_NAMES, WEEKDAY_SHORT, weekdayIndex } from '@/lib/admin/calendar';
import { whatsappLink } from '@/lib/admin/lead-sources';
import { Button, Card, Input, Pill, Segmented, useToast, timeAgo } from '../ui';
import { Timeline } from './Timeline';
import { FilesPanel } from './FilesPanel';
import { BillingPanel } from './BillingPanel';
import { DataTools } from './DataTools';
import type { ClientFile } from '@/app/admin/(panel)/clients/files-actions';
import type { ClientInvoice, ClientService } from '@/lib/admin/billing';
import { DetailsPanel } from './DetailsPanel';
import { setClientStatus, updateClient } from '@/app/admin/(panel)/clients/actions';
import { mergeClients } from '@/app/admin/(panel)/clients/data-actions';
import { useRouter } from 'next/navigation';

const SOURCE_LABEL: Record<string, string> = {
  presence: 'Presence enquiry',
  flow: 'Flow enquiry',
  core: 'Core enquiry',
  connect: 'Connect enquiry',
  audit: 'AI Audit enquiry',
  contact: 'Contact form',
  calculator: 'Calculator',
  manual: 'Added by hand',
};

function fmtDate(iso: string): string {
  const k = dateKeyOf(iso);
  const { y, m, d } = parseKey(k);
  return `${WEEKDAY_SHORT[weekdayIndex(k)]}, ${d} ${MONTH_NAMES[m].slice(0, 3)} ${y}`;
}

export function ClientDetail({
  client: initial,
  contacts,
  activity,
  owners,
  meetings,
  files,
  services,
  invoices,
  duplicates,
}: {
  client: Client;
  contacts: ClientContact[];
  activity: ClientActivity[];
  owners: { id: string; name: string }[];
  meetings: { id: string; title: string; starts_at: string; ends_at: string }[];
  files: ClientFile[];
  services: ClientService[];
  invoices: ClientInvoice[];
  duplicates: { id: string; name: string }[];
}) {
  const router = useRouter();
  const toast = useToast();
  const [client, setClient] = useState(initial);
  const [tab, setTab] = useState<'timeline' | 'billing' | 'files' | 'details'>('timeline');
  const [pending, start] = useTransition();
  const [fuEditing, setFuEditing] = useState(false);
  const [fuDate, setFuDate] = useState(client.next_followup_at ? dateKeyOf(client.next_followup_at) : '');
  const [fuNote, setFuNote] = useState(client.next_followup_note);
  const [extraActivity, setExtraActivity] = useState<ClientActivity[]>([]);
  const [nowMs] = useState(() => Date.now());

  const primary = contacts.find((c) => c.is_primary) ?? contacts[0];
  const status = STATUS_BY_KEY[client.status];
  const owner = owners.find((o) => o.id === client.owner_id);
  const fu = followUpState(client.next_followup_at, nowMs);
  const wa = primary?.phone ? whatsappLink(primary.phone, `Hi ${(primary.name || client.name).split(' ')[0]}, `) : null;

  const changeStatus = (next: ClientStatus) => {
    const before = client;
    setClient({ ...client, status: next });
    start(async () => {
      const res = await setClientStatus(client.id, next);
      if (!res.ok) {
        setClient(before);
        return toast('error', res.error);
      }
      setClient(res.client);
      setExtraActivity((a) => [res.activity, ...a]);
    });
  };

  const saveFollowUp = () => {
    start(async () => {
      const res = await updateClient(client.id, {
        nextFollowupAt: fuDate ? fromMyt(fuDate, 9 * 60) : null,
        nextFollowupNote: fuNote,
      });
      if (!res.ok) return toast('error', res.error);
      setClient(res.client);
      setFuEditing(false);
      toast('ok', fuDate ? 'Follow-up set' : 'Follow-up cleared');
    });
  };

  return (
    <div className="space-y-5">
      <Link href="/admin/clients" className="inline-flex items-center gap-1.5 text-[12.5px] text-white/50 hover:text-white">
        <ArrowLeft className="h-3.5 w-3.5" /> All clients
      </Link>

      {duplicates.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-[#F0C88F]/35 bg-[#F0C88F]/[0.06] px-5 py-3.5">
          <p className="min-w-0 flex-1 text-[13px] text-[#F0C88F]">
            Possible duplicate: <b>{duplicates.map((d) => d.name).join(', ')}</b> shares an email or phone with this client.
          </p>
          {duplicates.slice(0, 1).map((d) => (
            <Button key={d.id} size="sm" variant="secondary" disabled={pending} onClick={() => {
              if (!window.confirm(`Merge "${d.name}" into "${client.name}"? Everything moves here and "${d.name}" is deleted.`)) return;
              start(async () => { const r = await mergeClients(client.id, d.id); if (r.ok) { toast('ok', 'Merged'); router.refresh(); } else toast('error', r.error); });
            }}>Merge them</Button>
          ))}
        </div>
      )}

      <Card className="bg-[#070A10]/80 p-5 backdrop-blur-sm sm:p-6">
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <span
              className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl text-[22px] font-bold text-[#02040A]"
              style={{ background: status.color }}
              aria-hidden
            >
              {letterOf(client.name) === '#' ? client.name.slice(0, 1) : letterOf(client.name)}
            </span>
            <div className="min-w-0">
              <h1 className="truncate text-[26px] font-extrabold leading-tight tracking-[-0.03em] text-white md:text-[32px]">{client.name}</h1>
              <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-white/50">
                {client.company && <span>{client.company}</span>}
                {client.industry && <span>{client.industry}</span>}
                <span>{SOURCE_LABEL[client.source] ?? client.source}</span>
                <span>Client since {fmtDate(client.first_contact_at ?? client.created_at)}</span>
                {owner && <span>Owner: {owner.name}</span>}
              </p>
              {client.tags.length > 0 && (
                <p className="mt-2 flex flex-wrap gap-1.5">
                  {client.tags.map((t) => <span key={t} className="rounded-full border border-white/[0.14] px-2.5 py-0.5 text-[11px] text-white/55">{t}</span>)}
                </p>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {wa && (
              <a href={wa} target="_blank" rel="noopener noreferrer" className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#25D366] px-4 text-[13px] font-semibold text-[#02040A] hover:brightness-110">
                <MessageCircle className="h-4 w-4" /> WhatsApp
              </a>
            )}
            {primary?.email && (
              <a href={`mailto:${primary.email}`} className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/[0.16] bg-white/[0.04] px-4 text-[13px] font-semibold text-white/85 hover:border-white/30">
                <Mail className="h-4 w-4" /> Email
              </a>
            )}
            <a
              href={`/admin/calendar?new=1&title=${encodeURIComponent(`Meeting with ${client.name}`)}&with=${encodeURIComponent(client.name)}&client=${client.id}`}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/[0.16] bg-white/[0.04] px-4 text-[13px] font-semibold text-white/85 hover:border-white/30"
            >
              <CalendarPlus className="h-4 w-4" /> Book meeting
            </a>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-white/[0.12] pt-4">
          <div className="flex items-center gap-2.5">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">Status</span>
            <Segmented size="sm" value={client.status} onChange={changeStatus} options={CLIENT_STATUSES.map((s) => ({ value: s.key, label: s.label, color: s.color }))} />
          </div>
          <span className="text-[12.5px] text-white/45">
            {client.last_contact_at ? `Last contact ${timeAgo(client.last_contact_at)}` : 'No contact logged yet'}
          </span>
        </div>

        {/* Next follow-up */}
        <div className={cn('mt-4 rounded-xl border px-4 py-3', fu === 'overdue' ? 'border-red-400/30 bg-red-400/[0.05]' : fu === 'today' ? 'border-[#F0C88F]/35 bg-[#F0C88F]/[0.05]' : 'border-white/[0.12] bg-white/[0.02]')}>
          {fuEditing ? (
            <div className="flex flex-wrap items-end gap-2.5">
              <div>
                <label htmlFor="fu-date" className="mb-1 block font-mono text-[10px] uppercase tracking-[0.18em] text-white/45">Follow up on</label>
                <Input id="fu-date" type="date" value={fuDate} onChange={(e) => setFuDate(e.target.value)} className="w-[170px]" />
              </div>
              <div className="min-w-[200px] flex-1">
                <label htmlFor="fu-note" className="mb-1 block font-mono text-[10px] uppercase tracking-[0.18em] text-white/45">About</label>
                <Input id="fu-note" value={fuNote} onChange={(e) => setFuNote(e.target.value)} maxLength={300} placeholder="Send the revised quote" />
              </div>
              <Button variant="primary" size="sm" disabled={pending} onClick={saveFollowUp}>Save</Button>
              {client.next_followup_at && <Button variant="ghost" size="sm" disabled={pending} onClick={() => { setFuDate(''); setFuNote(''); start(async () => { const r = await updateClient(client.id, { nextFollowupAt: null }); if (r.ok) { setClient(r.client); setFuEditing(false); toast('ok', 'Follow-up cleared'); } else toast('error', r.error); }); }}>Clear</Button>}
              <button type="button" aria-label="Cancel" onClick={() => setFuEditing(false)} className="grid h-8 w-8 place-items-center rounded-lg text-white/40 hover:text-white"><X className="h-4 w-4" /></button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <CalendarClock className={cn('h-4 w-4 shrink-0', fu === 'overdue' ? 'text-red-300' : fu === 'today' ? 'text-[#F0C88F]' : 'text-white/40')} />
              <p className="min-w-0 flex-1 text-[13px]">
                {client.next_followup_at ? (
                  <>
                    <span className="font-semibold text-white">{fu === 'overdue' ? 'Overdue: ' : fu === 'today' ? 'Today: ' : 'Next follow-up: '}{fmtDate(client.next_followup_at)}</span>
                    {client.next_followup_note && <span className="text-white/55"> · {client.next_followup_note}</span>}
                  </>
                ) : (
                  <span className="text-white/45">No follow-up planned</span>
                )}
              </p>
              {fu === 'overdue' && <Pill color="#F08F8F">Overdue</Pill>}
              <Button variant="ghost" size="sm" onClick={() => setFuEditing(true)}><Pencil className="h-3.5 w-3.5" />{client.next_followup_at ? 'Change' : 'Set follow-up'}</Button>
            </div>
          )}
        </div>

        {meetings.length > 0 && (
          <div className="mt-3 rounded-xl border border-white/[0.12] bg-white/[0.02] px-4 py-3">
            <p className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">Upcoming meetings</p>
            <ul className="space-y-1">
              {meetings.map((m) => (
                <li key={m.id}>
                  <a href={`/admin/calendar?event=${m.id}`} className="flex flex-wrap items-baseline gap-x-3 text-[13px] text-white/85 hover:text-[#5EE3DA]">
                    <span className="font-medium">{m.title}</span>
                    <span className="text-white/45">{formatRange(m.starts_at, m.ends_at)}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Card>

      <div className="flex gap-1 border-b border-white/[0.14]" role="tablist">
        {([['timeline', 'Timeline'], ['billing', 'Services & billing'], ['files', `Files${files.length ? ` (${files.length})` : ''}`], ['details', 'Details & contacts']] as const).map(([k, label]) => (
          <button
            key={k}
            type="button"
            role="tab"
            aria-selected={tab === k}
            onClick={() => setTab(k)}
            className={cn('-mb-px border-b-2 px-4 py-2.5 text-[13px] font-medium outline-none transition-colors focus-visible:text-white', tab === k ? 'border-[#5EE3DA] text-white' : 'border-transparent text-white/45 hover:text-white/75')}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'timeline' ? (
        <Timeline clientId={client.id} initial={[...extraActivity, ...activity].sort((a, b) => b.occurred_at.localeCompare(a.occurred_at))} onClientChange={setClient} key={extraActivity.length} />
      ) : tab === 'billing' ? (
        <BillingPanel clientId={client.id} initialServices={services} initialInvoices={invoices} />
      ) : tab === 'files' ? (
        <FilesPanel clientId={client.id} initial={files} contacts={contacts} clientName={client.name} />
      ) : (
        <>
          <DetailsPanel client={client} contacts={contacts} owners={owners} onClientChange={setClient} />
          <DataTools clientId={client.id} clientName={client.name} />
        </>
      )}
    </div>
  );
}
