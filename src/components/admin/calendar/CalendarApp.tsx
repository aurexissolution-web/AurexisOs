'use client';

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { BellRing, ChevronLeft, ChevronRight, Copy, Plus, Smartphone } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  KINDS,
  MONTH_NAMES,
  addDays,
  dateKeyOf,
  defaultEnd,
  fromMyt,
  minutesOf,
  parseKey,
  todayKey,
  weekStart,
  WEEKDAY_SHORT,
  weekdayIndex,
  type CalEvent,
  type EventKind,
} from '@/lib/admin/calendar';
import { Button, Card, Segmented, useToast } from '../ui';
import { TimeGrid } from './TimeGrid';
import { MonthView } from './MonthView';
import { AgendaView } from './AgendaView';
import { MiniMonth } from './MiniMonth';
import { EventDialog, type Draft } from './EventDialog';
import {
  deleteEvent,
  moveEvent,
  saveEvent,
  sendTestPush,
  setEventStatus,
  type EventInput,
} from '@/app/admin/(panel)/calendar/actions';

type View = 'month' | 'week' | 'day' | 'agenda';

const rangeTitle = (view: View, cursor: string): string => {
  const { y, m, d } = parseKey(cursor);
  if (view === 'month') return `${MONTH_NAMES[m]} ${y}`;
  if (view === 'day') return `${WEEKDAY_SHORT[weekdayIndex(cursor)]}, ${d} ${MONTH_NAMES[m].slice(0, 3)} ${y}`;
  if (view === 'agenda') return 'Upcoming';
  const a = parseKey(weekStart(cursor));
  const b = parseKey(addDays(weekStart(cursor), 6));
  return a.m === b.m
    ? `${a.d} – ${b.d} ${MONTH_NAMES[a.m]} ${a.y}`
    : `${a.d} ${MONTH_NAMES[a.m].slice(0, 3)} – ${b.d} ${MONTH_NAMES[b.m].slice(0, 3)} ${b.y}`;
};

function shiftCursor(view: View, cursor: string, dir: number): string {
  if (view === 'week') return addDays(cursor, 7 * dir);
  if (view === 'day') return addDays(cursor, dir);
  if (view === 'agenda') return addDays(cursor, 14 * dir);
  const { y, m } = parseKey(cursor);
  const t = new Date(Date.UTC(y, m + dir, 1));
  return `${t.getUTCFullYear()}-${String(t.getUTCMonth() + 1).padStart(2, '0')}-01`;
}

export function CalendarApp({
  initialEvents,
  inviteEmail,
  ntfyTopic,
  prefill,
  openId,
}: {
  initialEvents: CalEvent[];
  inviteEmail: string | null;
  ntfyTopic: string | null;
  prefill: { title?: string; attendee?: string; leadRef?: string | null; clientId?: string | null } | null;
  openId: string | null;
}) {
  const toast = useToast();
  const [events, setEvents] = useState(initialEvents);
  const [view, setView] = useState<View>('week');
  const [now, setNow] = useState(() => Date.now());
  const [cursor, setCursor] = useState(() => todayKey());
  const [hidden, setHidden] = useState<Set<EventKind>>(new Set());
  const [editId, setEditId] = useState<string | null>(openId);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [dialogKey, setDialogKey] = useState(0);
  const [pending, startTransition] = useTransition();
  const [showPhone, setShowPhone] = useState(false);
  const eventsRef = useRef(events);
  useEffect(() => {
    eventsRef.current = events;
  }, [events]);

  const today = todayKey(now);

  useEffect(() => {
    if (window.matchMedia('(max-width: 767px)').matches) setView('agenda');
    const t = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(t);
  }, []);

  // Arriving from a lead ("Book meeting"): open a prefilled new event once.
  const prefilled = useRef(false);
  useEffect(() => {
    if (!prefill || prefilled.current) return;
    prefilled.current = true;
    const start = Math.ceil((minutesOf(new Date().toISOString()) + 30) / 60) * 60;
    setDraft({
      startsAt: fromMyt(todayKey(), start),
      endsAt: fromMyt(todayKey(), defaultEnd('meeting', start)),
      ...prefill,
    });
    setDialogKey((k) => k + 1);
  }, [prefill]);

  const visible = useMemo(() => events.filter((e) => !hidden.has(e.kind)), [events, hidden]);
  const byDay = useMemo(() => {
    const map = new Map<string, CalEvent[]>();
    for (const ev of visible) {
      const k = dateKeyOf(ev.starts_at);
      map.set(k, [...(map.get(k) ?? []), ev].sort((a, b) => a.starts_at.localeCompare(b.starts_at)));
    }
    return map;
  }, [visible]);
  const busy = useMemo(() => new Set(byDay.keys()), [byDay]);

  const { y: cy, m: cm } = parseKey(cursor);
  const editing = editId ? (events.find((e) => e.id === editId) ?? null) : null;

  const openNew = useCallback((startsAt?: string, endsAt?: string) => {
    const start = Math.ceil((minutesOf(new Date().toISOString()) + 15) / 30) * 30;
    const dayKey = todayKey();
    setEditId(null);
    setDraft({
      startsAt: startsAt ?? fromMyt(dayKey, start),
      endsAt: endsAt ?? fromMyt(dayKey, defaultEnd('meeting', start)),
    });
    setDialogKey((k) => k + 1);
  }, []);
  const closeDialog = useCallback(() => {
    setEditId(null);
    setDraft(null);
  }, []);
  const openEvent = useCallback((id: string) => {
    setDraft(null);
    setEditId(id);
    setDialogKey((k) => k + 1);
  }, []);

  // ── Keyboard shortcuts (Google Calendar style) ──────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable)) return;
      if (document.querySelector('dialog[open]')) return;
      const k = e.key.toLowerCase();
      if (k === 't') setCursor(todayKey());
      else if (k === 'm') setView('month');
      else if (k === 'w') setView('week');
      else if (k === 'd') setView('day');
      else if (k === 'a') setView('agenda');
      else if (k === 'c') { e.preventDefault(); openNew(); }
      else if (e.key === 'ArrowLeft') setCursor((c) => shiftCursor(view, c, -1));
      else if (e.key === 'ArrowRight') setCursor((c) => shiftCursor(view, c, 1));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [view, openNew]);

  // ── Data changes: optimistic, reverted if the server refuses ────────────
  const upsert = (ev: CalEvent) =>
    setEvents((cur) => (cur.some((x) => x.id === ev.id) ? cur.map((x) => (x.id === ev.id ? ev : x)) : [...cur, ev]));

  const handleSave = (input: EventInput) => {
    startTransition(async () => {
      const res = await saveEvent(input);
      if (!res.ok) return toast('error', res.error);
      upsert(res.event);
      closeDialog();
      toast('ok', input.id ? 'Event updated' : 'Event created');
    });
  };

  const handleMove = (id: string, startsAt: string, endsAt: string) => {
    const before = eventsRef.current.find((e) => e.id === id);
    if (!before) return;
    setEvents((cur) => cur.map((e) => (e.id === id ? { ...e, starts_at: startsAt, ends_at: endsAt } : e)));
    startTransition(async () => {
      const res = await moveEvent(id, startsAt, endsAt);
      if (res.ok) {
        upsert(res.event);
        toast('ok', 'Event moved');
      } else {
        upsert(before);
        toast('error', res.error);
      }
    });
  };

  const handleDropOnDay = (id: string, key: string) => {
    const ev = eventsRef.current.find((e) => e.id === id);
    if (!ev) return;
    const len = new Date(ev.ends_at).getTime() - new Date(ev.starts_at).getTime();
    const s = fromMyt(key, minutesOf(ev.starts_at));
    handleMove(id, s, new Date(new Date(s).getTime() + len).toISOString());
  };

  const handleStatus = (id: string, status: 'scheduled' | 'done' | 'cancelled') => {
    startTransition(async () => {
      const res = await setEventStatus(id, status);
      if (!res.ok) return toast('error', res.error);
      upsert(res.event);
      closeDialog();
      toast('ok', status === 'done' ? 'Marked done' : status === 'cancelled' ? 'Event cancelled' : 'Event restored');
    });
  };

  const handleDelete = (id: string) => {
    if (!window.confirm('Delete this event? It will also be removed from Google Calendar.')) return;
    startTransition(async () => {
      const res = await deleteEvent(id);
      if (!res.ok) return toast('error', res.error);
      setEvents((cur) => cur.filter((e) => e.id !== id));
      closeDialog();
      toast('ok', 'Event deleted');
    });
  };

  const days = view === 'week' ? Array.from({ length: 7 }, (_, i) => addDays(weekStart(cursor), i)) : [cursor];
  const dialogOpen = Boolean(editing || draft);

  return (
    <div className="flex flex-col gap-4 lg:h-[calc(100vh-7.5rem)] lg:min-h-[620px] lg:flex-row">
      {/* Sidebar */}
      <aside className="hidden w-[248px] shrink-0 flex-col gap-4 lg:flex">
        <Button variant="primary" onClick={() => openNew()} className="h-11 justify-start px-5">
          <Plus className="h-4 w-4" /> Create
        </Button>
        <Card className="p-4">
          <MiniMonth
            year={cy}
            month={cm}
            cursor={cursor}
            today={today}
            busy={busy}
            onPick={(k) => setCursor(k)}
            onShift={(d) => setCursor(shiftCursor('month', cursor, d))}
          />
        </Card>
        <Card className="p-4">
          <p className="mb-2.5 font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">Show</p>
          <ul className="space-y-1.5">
            {KINDS.map((k) => {
              const on = !hidden.has(k.key);
              return (
                <li key={k.key}>
                  <button
                    type="button"
                    aria-pressed={on}
                    onClick={() => setHidden((h) => { const n = new Set(h); if (on) n.add(k.key); else n.delete(k.key); return n; })}
                    className="flex w-full items-center gap-2.5 rounded-lg px-1.5 py-1 text-left text-[13px] text-white/75 hover:bg-white/[0.04]"
                  >
                    <span className={cn('grid h-4 w-4 place-items-center rounded border', on ? 'border-transparent' : 'border-white/25')} style={{ background: on ? k.color : 'transparent' }}>
                      {on && <span className="h-1.5 w-1.5 rounded-sm bg-[#02040A]" />}
                    </span>
                    {k.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </Card>
        <PhonePanel topic={ntfyTopic} open={showPhone} onToggle={() => setShowPhone((s) => !s)} />
      </aside>

      {/* Main */}
      <Card className="flex min-h-[560px] min-w-0 flex-1 flex-col overflow-hidden bg-[#070A10]/80 backdrop-blur-sm">
        <div className="flex flex-wrap items-center gap-2 border-b border-white/[0.12] px-3 py-2.5 sm:px-4">
          <Button variant="secondary" size="sm" onClick={() => setCursor(todayKey())}>Today</Button>
          <div className="flex">
            <button type="button" aria-label="Previous" onClick={() => setCursor((c) => shiftCursor(view, c, -1))} className="grid h-8 w-8 place-items-center rounded-lg text-white/60 hover:bg-white/[0.06] hover:text-white">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button type="button" aria-label="Next" onClick={() => setCursor((c) => shiftCursor(view, c, 1))} className="grid h-8 w-8 place-items-center rounded-lg text-white/60 hover:bg-white/[0.06] hover:text-white">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <h2 className="min-w-0 flex-1 truncate text-[16px] font-semibold text-white sm:text-[18px]">{rangeTitle(view, cursor)}</h2>
          <Button variant="primary" size="sm" className="lg:hidden" onClick={() => openNew()} aria-label="Create event">
            <Plus className="h-4 w-4" />
          </Button>
          <Segmented
            size="sm"
            value={view}
            onChange={setView}
            options={[
              { value: 'day', label: 'Day' },
              { value: 'week', label: 'Week' },
              { value: 'month', label: 'Month' },
              { value: 'agenda', label: 'Agenda' },
            ]}
          />
        </div>

        {view === 'month' && (
          <MonthView
            year={cy}
            month={cm}
            byDay={byDay}
            today={today}
            onCreateDay={(k) => openNew(fromMyt(k, 9 * 60), fromMyt(k, 10 * 60))}
            onOpen={openEvent}
            onOpenDay={(k) => { setCursor(k); setView('day'); }}
            onDropOnDay={handleDropOnDay}
          />
        )}
        {(view === 'week' || view === 'day') && (
          <div className={cn('flex min-h-0 flex-1 flex-col', view === 'week' && 'overflow-x-auto')}>
            <div className={cn('flex min-h-0 flex-1 flex-col', view === 'week' && 'min-w-[640px]')}>
              <TimeGrid
                days={days}
                events={visible}
                nowMs={now}
                today={today}
                onCreate={(s, e) => openNew(s, e)}
                onOpen={openEvent}
                onMove={handleMove}
              />
            </div>
          </div>
        )}
        {view === 'agenda' && (
          <AgendaView from={cursor} days={30} events={visible} today={today} onOpen={openEvent} />
        )}
      </Card>

      {/* Phone panel on small screens */}
      <div className="lg:hidden">
        <PhonePanel topic={ntfyTopic} open={showPhone} onToggle={() => setShowPhone((s) => !s)} />
      </div>

      {dialogOpen && (
        <EventDialog
          key={dialogKey}
          event={editing}
          draft={draft}
          inviteEmail={inviteEmail}
          busy={pending}
          onClose={closeDialog}
          onSave={handleSave}
          onDelete={handleDelete}
          onStatus={handleStatus}
        />
      )}
    </div>
  );
}

function PhonePanel({ topic, open, onToggle }: { topic: string | null; open: boolean; onToggle: () => void }) {
  const toast = useToast();
  const [sending, setSending] = useState(false);
  return (
    <Card className="p-4">
      <button type="button" onClick={onToggle} className="flex w-full items-center gap-2.5 text-left">
        <span className="grid h-8 w-8 place-items-center rounded-lg border border-[#5EE3DA]/25 bg-[#5EE3DA]/10 text-[#5EE3DA]">
          <Smartphone className="h-4 w-4" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[13px] font-semibold text-white">Phone reminders</span>
          <span className="block text-[11px] text-white/40">{topic ? 'ntfy connected' : 'Not set up yet'}</span>
        </span>
      </button>
      {open && (
        <div className="mt-3 space-y-2.5 text-[12px] leading-[1.6] text-white/55">
          {topic ? (
            <>
              <p>1. Install the free <b className="text-white/80">ntfy</b> app (App Store / Google Play).</p>
              <p>2. Tap <b className="text-white/80">+</b> and subscribe to this topic:</p>
              <button
                type="button"
                onClick={() => { navigator.clipboard?.writeText(topic); toast('ok', 'Topic copied'); }}
                className="flex w-full items-center justify-between gap-2 rounded-lg border border-white/10 bg-black/40 px-3 py-2 font-mono text-[11.5px] text-[#5EE3DA]"
              >
                <span className="truncate">{topic}</span>
                <Copy className="h-3.5 w-3.5 shrink-0" />
              </button>
              <p>3. Keep the topic private: anyone who knows it can read your reminders.</p>
              <Button
                size="sm"
                variant="secondary"
                disabled={sending}
                onClick={async () => {
                  setSending(true);
                  const r = await sendTestPush();
                  setSending(false);
                  toast(r.ok ? 'ok' : 'error', r.ok ? 'Test sent. Check your phone.' : r.error);
                }}
              >
                <BellRing className="h-3.5 w-3.5" /> Send test notification
              </Button>
            </>
          ) : (
            <p>Add <code className="text-white/80">NTFY_TOPIC</code> to your environment settings to turn on phone notifications.</p>
          )}
        </div>
      )}
    </Card>
  );
}
