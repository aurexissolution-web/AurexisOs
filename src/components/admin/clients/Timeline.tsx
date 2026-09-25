'use client';

import { useState, useTransition } from 'react';
import {
  ArrowRightLeft,
  CalendarDays,
  Inbox,
  Mail,
  MessageCircle,
  Package,
  Paperclip,
  Phone,
  Receipt,
  StickyNote,
  Trash2,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  MANUAL_KEYS,
  MANUAL_KINDS,
  type ActivityKind,
  type Client,
  type ClientActivity,
} from '@/lib/admin/clients';
import { MONTH_NAMES, WEEKDAY_SHORT, dateKeyOf, formatClock, fromMyt, minutesOf, parseKey, weekdayIndex, todayKey } from '@/lib/admin/calendar';
import { Button, Segmented, Textarea, useToast } from '../ui';
import { addActivity, deleteActivity } from '@/app/admin/(panel)/clients/actions';

const KIND_UI: Record<ActivityKind, { icon: LucideIcon; color: string; label: string }> = {
  enquiry: { icon: Inbox, color: '#5EE3DA', label: 'Enquiry' },
  email_sent: { icon: Mail, color: '#8FA8F0', label: 'Email' },
  meeting: { icon: CalendarDays, color: '#B08FF0', label: 'Meeting' },
  call: { icon: Phone, color: '#7FE8C4', label: 'Call' },
  whatsapp: { icon: MessageCircle, color: '#25D366', label: 'WhatsApp' },
  note: { icon: StickyNote, color: '#F0C88F', label: 'Note' },
  file: { icon: Paperclip, color: '#8FA8F0', label: 'File' },
  status_change: { icon: ArrowRightLeft, color: '#9CA3AF', label: 'Status' },
  invoice: { icon: Receipt, color: '#F0C88F', label: 'Invoice' },
  service: { icon: Package, color: '#7FE8C4', label: 'Service' },
};

function dayLabel(key: string, today: string): string {
  if (key === today) return 'Today';
  const { y, m, d } = parseKey(key);
  return `${WEEKDAY_SHORT[weekdayIndex(key)]}, ${d} ${MONTH_NAMES[m].slice(0, 3)}${y === parseKey(today).y ? '' : ` ${y}`}`;
}

export function Timeline({
  clientId,
  initial,
  onClientChange,
}: {
  clientId: string;
  initial: ClientActivity[];
  onClientChange: (c: Client) => void;
}) {
  const toast = useToast();
  const [items, setItems] = useState(initial);
  const [kind, setKind] = useState<ActivityKind>('note');
  const [text, setText] = useState('');
  const [when, setWhen] = useState('');
  const [pending, start] = useTransition();
  const [maxWhen] = useState(() => new Date(Date.now() + 8 * 3600_000).toISOString().slice(0, 16));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    const occurredAt = when ? fromMyt(when.slice(0, 10), Number(when.slice(11, 13)) * 60 + Number(when.slice(14, 16))) : undefined;
    start(async () => {
      const res = await addActivity(clientId, { kind, title: '', body: text, occurredAt });
      if (!res.ok) return toast('error', res.error);
      setItems((cur) => [res.activity, ...cur].sort((a, b) => b.occurred_at.localeCompare(a.occurred_at)));
      onClientChange(res.client);
      setText('');
      setWhen('');
      toast('ok', 'Added to timeline');
    });
  };

  const remove = (id: string) => {
    const before = items;
    setItems((cur) => cur.filter((x) => x.id !== id));
    start(async () => {
      const res = await deleteActivity(id);
      if (!res.ok) {
        setItems(before);
        toast('error', res.error);
      }
    });
  };

  const today = todayKey();
  const groups: { key: string; list: ClientActivity[] }[] = [];
  for (const it of items) {
    const k = dateKeyOf(it.occurred_at);
    const last = groups[groups.length - 1];
    if (last && last.key === k) last.list.push(it);
    else groups.push({ key: k, list: [it] });
  }

  return (
    <div>
      <form onSubmit={submit} className="rounded-2xl border border-white/[0.14] bg-white/[0.025] p-4">
        <Segmented
          size="sm"
          value={kind}
          onChange={setKind}
          options={MANUAL_KINDS.map((k) => ({ value: k.key, label: k.label, color: KIND_UI[k.key].color }))}
        />
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={2}
          maxLength={4000}
          aria-label="Log activity"
          placeholder={
            kind === 'note'
              ? 'Write a private note…'
              : kind === 'call'
                ? 'What was discussed on the call?'
                : kind === 'whatsapp'
                  ? 'What did you chat about on WhatsApp?'
                  : kind === 'meeting'
                    ? 'What happened in the meeting?'
                    : 'What did the email say?'
          }
          className="mt-3"
        />
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <Button type="submit" variant="primary" size="sm" disabled={pending || !text.trim()}>
            Add to timeline
          </Button>
          <label className="flex items-center gap-2 text-[12px] text-white/45">
            When
            <input
              type="datetime-local"
              value={when}
              max={maxWhen}
              onChange={(e) => setWhen(e.target.value)}
              className="h-8 rounded-lg border border-white/[0.12] bg-white/[0.03] px-2 text-[12px] text-white/80 outline-none focus:border-[#5EE3DA]/50"
            />
            <span className="text-white/30">{when ? 'Malaysia time' : 'now'}</span>
          </label>
        </div>
      </form>

      {groups.length === 0 ? (
        <p className="px-2 py-12 text-center text-[13px] text-white/40">Nothing here yet. Log a call, a note or a message above.</p>
      ) : (
        <div className="mt-5">
          {groups.map((g) => (
            <section key={g.key} className="mb-5">
              <h3 className="mb-2 font-mono text-[10.5px] uppercase tracking-[0.2em] text-white/40">{dayLabel(g.key, today)}</h3>
              <ol className="relative space-y-2.5 border-l border-white/[0.14] pl-5">
                {g.list.map((it) => {
                  const ui = KIND_UI[it.kind];
                  const Icon = ui.icon;
                  const manual = MANUAL_KEYS.includes(it.kind);
                  return (
                    <li key={it.id} className="group relative">
                      <span
                        className="absolute -left-[33px] top-1 grid h-6 w-6 place-items-center rounded-full border border-white/[0.14] bg-[#0A0E15]"
                        style={{ color: ui.color }}
                      >
                        <Icon className="h-3 w-3" />
                      </span>
                      <div className="rounded-xl border border-white/[0.1] bg-white/[0.025] px-3.5 py-2.5">
                        <div className="flex items-baseline justify-between gap-3">
                          <p className="text-[13px] font-medium text-white">
                            <span style={{ color: ui.color }}>{ui.label}</span>
                            {it.title && <span className="text-white/80"> · {it.title}</span>}
                          </p>
                          <span className="flex shrink-0 items-center gap-2 font-mono text-[10.5px] text-white/35">
                            {formatClock(minutesOf(it.occurred_at))}
                            {manual && (
                              <button
                                type="button"
                                onClick={() => remove(it.id)}
                                aria-label="Delete entry"
                                className={cn('text-white/30 opacity-0 transition hover:text-red-300 focus:opacity-100 group-hover:opacity-100')}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </span>
                        </div>
                        {it.body && <p className="mt-1 whitespace-pre-wrap text-[13px] leading-[1.55] text-white/65">{it.body}</p>}
                      </div>
                    </li>
                  );
                })}
              </ol>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
