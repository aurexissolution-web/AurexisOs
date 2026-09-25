'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, Trash2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  KINDS,
  REMINDER_OPTIONS,
  addDays,
  dateKeyOf,
  fromMyt,
  minutesOf,
  type CalEvent,
  type EventKind,
} from '@/lib/admin/calendar';
import { Button, Input, Label, Segmented, Switch, Textarea } from '../ui';
import type { EventInput } from '@/app/admin/(panel)/calendar/actions';

export interface Draft {
  startsAt: string;
  endsAt: string;
  title?: string;
  attendee?: string;
  leadRef?: string | null;
  clientId?: string | null;
}

const toTime = (min: number) =>
  `${String(Math.floor(min / 60) % 24).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`;
const fromTime = (v: string) => {
  const [h, m] = v.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
};

export function EventDialog({
  event,
  draft,
  inviteEmail,
  busy,
  onClose,
  onSave,
  onDelete,
  onStatus,
}: {
  event: CalEvent | null;
  draft: Draft | null;
  inviteEmail: string | null;
  busy: boolean;
  onClose: () => void;
  onSave: (input: EventInput) => void;
  onDelete: (id: string) => void;
  onStatus: (id: string, status: 'scheduled' | 'done' | 'cancelled') => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const src = event ?? draft;
  const startIso = event?.starts_at ?? draft?.startsAt ?? new Date().toISOString();
  const endIso = event?.ends_at ?? draft?.endsAt ?? startIso;

  const [title, setTitle] = useState(event?.title ?? draft?.title ?? '');
  const [kind, setKind] = useState<EventKind>(event?.kind ?? 'meeting');
  const [date, setDate] = useState(dateKeyOf(startIso));
  const [endDate, setEndDate] = useState(dateKeyOf(endIso));
  const [start, setStart] = useState(minutesOf(startIso));
  const [end, setEnd] = useState(minutesOf(endIso));
  const [location, setLocation] = useState(event?.location ?? '');
  const [url, setUrl] = useState(event?.meeting_url ?? '');
  const [attendee, setAttendee] = useState(event?.attendee ?? draft?.attendee ?? '');
  const [notes, setNotes] = useState(event?.notes ?? '');
  const [reminders, setReminders] = useState<number[]>(event?.reminders ?? [15]);
  const [invite, setInvite] = useState(event?.send_invite ?? Boolean(inviteEmail));

  useEffect(() => {
    const d = ref.current;
    if (d && !d.open && src) d.showModal();
  }, [src]);

  const changeStart = (v: string) => {
    const next = fromTime(v);
    const len = end - start;
    setStart(next);
    if (endDate === date) setEnd(Math.min(24 * 60 - 1, next + Math.max(15, len)));
  };
  const changeDate = (v: string) => {
    if (!v) return;
    const shift = endDate === date ? 0 : 1;
    setDate(v);
    setEndDate(shift ? addDays(v, 1) : v);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: event?.id,
      title,
      kind,
      startsAt: fromMyt(date, start),
      endsAt: fromMyt(endDate, end),
      location,
      meetingUrl: url,
      attendee,
      notes,
      leadRef: event?.lead_ref ?? draft?.leadRef ?? null,
      clientId: event?.client_id ?? draft?.clientId ?? null,
      reminders,
      sendInvite: invite,
    });
  };

  const done = event?.status === 'done';
  const cancelled = event?.status === 'cancelled';

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === e.currentTarget && onClose()}
      data-lenis-prevent
      aria-labelledby="event-title"
      className="m-auto max-h-[94vh] w-[min(560px,calc(100%-1.5rem))] overflow-y-auto rounded-3xl border border-white/10 bg-[#070B12] p-0 text-white shadow-[0_40px_120px_-30px_rgba(0,0,0,0.9)] backdrop:bg-black/70 backdrop:backdrop-blur-sm"
    >
      <form onSubmit={submit} className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <input
            id="event-title"
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={160}
            placeholder="Add title"
            className="min-w-0 flex-1 border-b border-white/10 bg-transparent pb-2 text-[22px] font-semibold tracking-[-0.02em] outline-none placeholder:text-white/25 focus:border-[#5EE3DA]/60"
          />
          <button type="button" onClick={onClose} aria-label="Close" className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-white/50 hover:bg-white/[0.06] hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4">
          <Segmented
            value={kind}
            onChange={setKind}
            options={KINDS.map((k) => ({ value: k.key, label: k.label, color: k.color }))}
          />
        </div>

        <div className="mt-5 grid grid-cols-2 items-end gap-2 sm:grid-cols-[1fr_auto_auto]">
          <div className="col-span-2 sm:col-span-1">
            <Label htmlFor="ev-date">Date</Label>
            <Input id="ev-date" type="date" value={date} onChange={(e) => changeDate(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="ev-start">Start</Label>
            <Input id="ev-start" type="time" step={900} value={toTime(start)} onChange={(e) => changeStart(e.target.value)} required className="w-[136px]" />
          </div>
          <div>
            <Label htmlFor="ev-end">End</Label>
            <Input id="ev-end" type="time" step={900} value={toTime(end)} onChange={(e) => setEnd(fromTime(e.target.value))} required className="w-[136px]" />
          </div>
        </div>
        {endDate !== date && (
          <div className="mt-2">
            <Label htmlFor="ev-end-date">Ends on</Label>
            <Input id="ev-end-date" type="date" value={endDate} min={date} onChange={(e) => setEndDate(e.target.value || date)} />
          </div>
        )}
        <p className="mt-1.5 text-[11px] text-white/35">Malaysia time (GMT+8)</p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="ev-with">With</Label>
            <Input id="ev-with" value={attendee} onChange={(e) => setAttendee(e.target.value)} placeholder="Aisyah, Dental Clinic" maxLength={160} />
          </div>
          <div>
            <Label htmlFor="ev-loc">Location</Label>
            <Input id="ev-loc" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Office, cafe, address" maxLength={200} />
          </div>
        </div>
        <div className="mt-4">
          <Label htmlFor="ev-url">Meeting link</Label>
          <Input id="ev-url" type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://meet.google.com/…" maxLength={500} />
        </div>
        <div className="mt-4">
          <Label htmlFor="ev-notes">Notes</Label>
          <Textarea id="ev-notes" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={2000} placeholder="What to prepare, what they asked for…" />
        </div>

        <div className="mt-5">
          <Label hint="Phone notification">Remind me</Label>
          <div className="flex flex-wrap gap-1.5">
            {REMINDER_OPTIONS.map((r) => {
              const on = reminders.includes(r.minutes);
              return (
                <button
                  key={r.minutes}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setReminders((cur) => (on ? cur.filter((m) => m !== r.minutes) : [...cur, r.minutes]))}
                  className={cn(
                    'h-7 rounded-full border px-3 text-[12px] font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[#5EE3DA]/50',
                    on ? 'border-[#5EE3DA]/50 bg-[#5EE3DA]/15 text-[#5EE3DA]' : 'border-white/10 text-white/50 hover:border-white/25 hover:text-white/80',
                  )}
                >
                  {r.label}
                </button>
              );
            })}
          </div>
        </div>

        {(event?.client_id ?? draft?.clientId) && (
          <a
            href={`/admin/clients/${event?.client_id ?? draft?.clientId}`}
            className="mt-4 inline-flex items-center gap-1.5 text-[12.5px] text-[#5EE3DA] hover:underline"
          >
            Linked to a client. Open their page
          </a>
        )}

        {inviteEmail && (
          <div className="mt-4 flex items-center justify-between gap-4 rounded-xl border border-white/[0.14] bg-white/[0.02] px-4 py-3">
            <div className="min-w-0">
              <p className="text-[13px] font-medium text-white">Add to Google Calendar</p>
              <p className="truncate text-[11.5px] text-white/40">Invite sent to {inviteEmail}</p>
            </div>
            <Switch checked={invite} onChange={setInvite} label={invite ? "On" : "Off"} />
          </div>
        )}

        <div className="mt-6 flex flex-wrap items-center gap-2">
          <Button type="submit" variant="primary" disabled={busy || !title.trim()}>
            {event ? 'Save changes' : 'Create event'}
          </Button>
          {event && (
            <>
              <Button type="button" variant="secondary" disabled={busy} onClick={() => onStatus(event.id, done ? 'scheduled' : 'done')}>
                <Check className="h-4 w-4" />
                {done ? 'Reopen' : 'Mark done'}
              </Button>
              <Button type="button" variant="ghost" disabled={busy} onClick={() => onStatus(event.id, cancelled ? 'scheduled' : 'cancelled')}>
                {cancelled ? 'Restore' : 'Cancel event'}
              </Button>
              <Button type="button" variant="danger" size="sm" disabled={busy} className="ml-auto" onClick={() => onDelete(event.id)} aria-label="Delete event">
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </form>
    </dialog>
  );
}
