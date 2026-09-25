// src/app/api/cron/reminders/route.ts
// Called every minute by a free scheduler (cron-job.org or Supabase pg_cron).
// Sends a phone notification through ntfy for every reminder that has come due.
import { timingSafeEqual } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { pushNotification } from '@/lib/admin/ntfy';
import { SITE_URL } from '@/lib/email/send';
import {
  KIND_BY_KEY,
  dueReminders,
  formatRange,
  type CalEvent,
} from '@/lib/admin/calendar';

export const dynamic = 'force-dynamic';

const SECRET = process.env.CRON_SECRET;

function authorised(req: NextRequest): boolean {
  if (!SECRET) return false;
  const given =
    req.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ??
    req.nextUrl.searchParams.get('key') ??
    '';
  const a = Buffer.from(given);
  const b = Buffer.from(SECRET);
  return a.length === b.length && timingSafeEqual(a, b);
}

const pgArray = (xs: number[]) => `{${xs.join(',')}}`;

function leadTime(minutes: number): string {
  if (minutes <= 1) return 'starting now';
  if (minutes < 60) return `in ${minutes} min`;
  const h = Math.round(minutes / 6) / 10;
  return minutes < 1440 ? `in ${h} h` : `in ${Math.round(minutes / 144) / 10} days`;
}

export async function GET(req: NextRequest) {
  if (!authorised(req)) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });

  if (req.nextUrl.searchParams.get('test')) {
    const ok = await pushNotification({
      title: 'Aurexis calendar is connected',
      message: 'Phone reminders for your meetings will arrive here.',
      click: `${SITE_URL}/admin/calendar`,
      tags: ['white_check_mark'],
    });
    return NextResponse.json({ test: true, sent: ok });
  }

  const now = Date.now();
  const { data, error } = await supabaseAdmin
    .from('calendar_events')
    .select(
      'id,title,kind,starts_at,ends_at,location,meeting_url,attendee,notes,lead_ref,reminders,reminders_sent,status,send_invite,invite_seq',
    )
    .eq('status', 'scheduled')
    .gte('starts_at', new Date(now - 20 * 60_000).toISOString())
    .lte('starts_at', new Date(now + 3 * 24 * 60 * 60_000).toISOString());
  if (error) {
    console.error('[cron/reminders] query failed:', error.message);
    return NextResponse.json({ error: 'query failed' }, { status: 500 });
  }

  let sent = 0;
  for (const due of dueReminders((data ?? []) as CalEvent[], now)) {
    const ev = due.event;
    // Claim first: only the run that flips reminders_sent may send, so two
    // overlapping runs can never notify twice.
    const { data: claimed } = await supabaseAdmin
      .from('calendar_events')
      .update({ reminders_sent: [...new Set([...ev.reminders_sent, ...due.offsets])] })
      .eq('id', ev.id)
      .eq('reminders_sent', pgArray(ev.reminders_sent))
      .select('id');
    if (!claimed?.length) continue;

    const where = [ev.location, ev.meeting_url].filter(Boolean).join(' · ');
    await pushNotification({
      title: `${ev.title} ${leadTime(due.minutesLeft)}`,
      message: [
        formatRange(ev.starts_at, ev.ends_at),
        where,
        ev.attendee && `With ${ev.attendee}`,
      ]
        .filter(Boolean)
        .join('\n'),
      click: ev.meeting_url || `${SITE_URL}/admin/calendar?event=${ev.id}`,
      priority: due.minutesLeft <= 1 ? 5 : 4,
      tags: [KIND_BY_KEY[ev.kind].key === 'call' ? 'telephone_receiver' : 'calendar'],
    });
    sent++;
  }
  // Client follow-ups: one phone notification on the morning (9:00 Malaysia time)
  // of the follow-up day, or the next run if it is already past.
  let followups = 0;
  const mytHour = new Date(now + 8 * 3_600_000).getUTCHours();
  if (mytHour >= 9) {
    const endOfToday = new Date(`${new Date(now + 8 * 3_600_000).toISOString().slice(0, 10)}T23:59:59+08:00`).toISOString();
    const { data: due, error: fuError } = await supabaseAdmin
      .from('clients')
      .select('id,name,next_followup_at,next_followup_note')
      .not('next_followup_at', 'is', null)
      .is('followup_notified_at', null)
      .lte('next_followup_at', endOfToday)
      .limit(20);
    if (!fuError) {
      for (const c of (due ?? []) as { id: string; name: string; next_followup_note: string }[]) {
        const { data: claimed } = await supabaseAdmin
          .from('clients')
          .update({ followup_notified_at: new Date(now).toISOString() })
          .eq('id', c.id)
          .is('followup_notified_at', null)
          .select('id');
        if (!claimed?.length) continue;
        await pushNotification({
          title: `Follow up: ${c.name}`,
          message: c.next_followup_note || 'Planned follow-up is due today.',
          click: `${SITE_URL}/admin/clients/${c.id}`,
          tags: ['handshake'],
        });
        followups++;
      }
    }
  }
  return NextResponse.json({ checked: data?.length ?? 0, sent, followups });
}
