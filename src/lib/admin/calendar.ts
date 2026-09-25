// src/lib/admin/calendar.ts
// Pure calendar logic: Malaysia-time date maths, grid layout and reminder
// scheduling. Malaysia is UTC+8 all year (no daylight saving), so plain
// arithmetic is exact. No aliases/imports, so node:test can load it.

export const MYT_OFFSET_MIN = 8 * 60;
const MIN = 60_000;
const DAY_MIN = 24 * 60;

export type EventKind = 'meeting' | 'call' | 'task' | 'deadline';
export type EventStatus = 'scheduled' | 'done' | 'cancelled';

export const KINDS: { key: EventKind; label: string; color: string }[] = [
  { key: 'meeting', label: 'Meeting', color: '#5EE3DA' },
  { key: 'call', label: 'Call', color: '#8FA8F0' },
  { key: 'task', label: 'Task', color: '#F0C88F' },
  { key: 'deadline', label: 'Deadline', color: '#F08F8F' },
];
export const KIND_BY_KEY = Object.fromEntries(KINDS.map((k) => [k.key, k])) as Record<
  EventKind,
  (typeof KINDS)[number]
>;

export const REMINDER_OPTIONS: { minutes: number; label: string }[] = [
  { minutes: 0, label: 'At start' },
  { minutes: 5, label: '5 min' },
  { minutes: 10, label: '10 min' },
  { minutes: 15, label: '15 min' },
  { minutes: 30, label: '30 min' },
  { minutes: 60, label: '1 hour' },
  { minutes: 120, label: '2 hours' },
  { minutes: 1440, label: '1 day' },
  { minutes: 2880, label: '2 days' },
];
export const ALLOWED_REMINDERS = REMINDER_OPTIONS.map((r) => r.minutes);

export interface CalEvent {
  id: string;
  title: string;
  kind: EventKind;
  starts_at: string;
  ends_at: string;
  location: string;
  meeting_url: string | null;
  attendee: string;
  notes: string;
  lead_ref: string | null;
  client_id?: string | null;
  reminders: number[];
  reminders_sent: number[];
  status: EventStatus;
  send_invite: boolean;
  invite_seq: number;
}

// ── Malaysia-time helpers ─────────────────────────────────────────────────────

const shifted = (iso: string) => new Date(new Date(iso).getTime() + MYT_OFFSET_MIN * MIN);
const pad = (n: number) => String(n).padStart(2, '0');

/** "YYYY-MM-DD" of an instant, as seen in Malaysia. */
export function dateKeyOf(iso: string): string {
  const d = shifted(iso);
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

/** Minutes since midnight in Malaysia. */
export function minutesOf(iso: string): number {
  const d = shifted(iso);
  return d.getUTCHours() * 60 + d.getUTCMinutes();
}

/** A Malaysia date + minutes-since-midnight as a UTC ISO string. */
export function fromMyt(dateKey: string, minutes: number): string {
  const [y, m, d] = dateKey.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d) + (minutes - MYT_OFFSET_MIN) * MIN).toISOString();
}

export function addDays(dateKey: string, n: number): string {
  const [y, m, d] = dateKey.split('-').map(Number);
  const t = new Date(Date.UTC(y, m - 1, d + n));
  return `${t.getUTCFullYear()}-${pad(t.getUTCMonth() + 1)}-${pad(t.getUTCDate())}`;
}

/** 0 = Monday … 6 = Sunday. */
export function weekdayIndex(dateKey: string): number {
  const [y, m, d] = dateKey.split('-').map(Number);
  return (new Date(Date.UTC(y, m - 1, d)).getUTCDay() + 6) % 7;
}

export const weekStart = (dateKey: string) => addDays(dateKey, -weekdayIndex(dateKey));

export function todayKey(now = Date.now()): string {
  return dateKeyOf(new Date(now).toISOString());
}

/** 42 date keys (6 weeks, Monday first) covering a month. `month` is 0-based. */
export function monthGrid(year: number, month: number): string[] {
  const first = `${year}-${pad(month + 1)}-01`;
  const start = weekStart(first);
  return Array.from({ length: 42 }, (_, i) => addDays(start, i));
}

export const snap = (minutes: number, step = 15) => Math.round(minutes / step) * step;

export const defaultEnd = (kind: EventKind, startMin: number) =>
  startMin + (kind === 'task' || kind === 'deadline' ? 30 : 60);

// ── Time-grid layout ─────────────────────────────────────────────────────────

/**
 * Side-by-side columns for events that overlap in time (Google Calendar style).
 * Input: minutes since midnight. Output: each event's column and the number of
 * columns in its overlap cluster.
 */
export function layoutDay<T extends { id: string; s: number; e: number }>(
  events: T[],
): (T & { col: number; cols: number })[] {
  const sorted = [...events].sort((a, b) => a.s - b.s || b.e - a.e);
  const out: (T & { col: number; cols: number })[] = [];
  let cluster: (T & { col: number; cols: number })[] = [];
  let clusterEnd = -1;
  let colEnds: number[] = [];

  const flush = () => {
    for (const c of cluster) c.cols = colEnds.length;
    out.push(...cluster);
    cluster = [];
    colEnds = [];
  };

  for (const ev of sorted) {
    if (cluster.length && ev.s >= clusterEnd) flush();
    let col = colEnds.findIndex((end) => end <= ev.s);
    if (col === -1) col = colEnds.length;
    colEnds[col] = ev.e;
    cluster.push({ ...ev, col, cols: 1 });
    clusterEnd = Math.max(clusterEnd, ev.e);
  }
  flush();
  return out;
}

// ── Reminders ────────────────────────────────────────────────────────────────

const STALE_AFTER_START_MS = 15 * MIN;

type ReminderInput = Pick<CalEvent, 'status' | 'reminders' | 'reminders_sent' | 'starts_at'>;

export interface DueReminder<T> {
  event: T;
  /** Every offset now due; all are marked sent together so one message goes out. */
  offsets: number[];
  minutesLeft: number;
}

/**
 * Events with a reminder whose time has arrived. Several due offsets for one
 * event collapse into one notification. A reminder more than 15 minutes past
 * the event's start is stale and never sent.
 */
export function dueReminders<T extends ReminderInput>(events: T[], nowMs: number): DueReminder<T>[] {
  const out: DueReminder<T>[] = [];
  for (const event of events) {
    if (event.status !== 'scheduled') continue;
    const start = new Date(event.starts_at).getTime();
    if (nowMs > start + STALE_AFTER_START_MS) continue;
    const offsets = event.reminders.filter(
      (m) => !event.reminders_sent.includes(m) && nowMs >= start - m * MIN,
    );
    if (!offsets.length) continue;
    out.push({ event, offsets, minutesLeft: Math.max(0, Math.round((start - nowMs) / MIN)) });
  }
  return out;
}

/** Offsets whose send time has already passed when an event is first saved. */
export function alreadyPast(startsAtIso: string, reminders: number[], nowMs: number): number[] {
  const start = new Date(startsAtIso).getTime();
  return reminders.filter((m) => nowMs >= start - m * MIN);
}

export function reminderLabel(minutes: number): string {
  return REMINDER_OPTIONS.find((r) => r.minutes === minutes)?.label ?? `${minutes} min`;
}

// ── Display ──────────────────────────────────────────────────────────────────

export function formatClock(minutes: number): string {
  const h = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}${m ? `:${pad(m)}` : ''} ${h < 12 ? 'am' : 'pm'}`;
}

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
export const WEEKDAY_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const parseKey = (k: string) => {
  const [y, m, d] = k.split('-').map(Number);
  return { y, m: m - 1, d };
};

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/** "Fri, 25 Sep 2026 · 10 am – 11 am (Malaysia time)" */
export function formatRange(startIso: string, endIso: string): string {
  const key = dateKeyOf(startIso);
  const { y, m, d } = parseKey(key);
  const day = `${DAY_NAMES[weekdayIndex(key)]}, ${d} ${MONTH_NAMES[m].slice(0, 3)} ${y}`;
  const end =
    dateKeyOf(endIso) === key ? formatClock(minutesOf(endIso)) : `${dateKeyOf(endIso)} ${formatClock(minutesOf(endIso))}`;
  return `${day} · ${formatClock(minutesOf(startIso))} – ${end} (Malaysia time)`;
}

export { DAY_MIN };
