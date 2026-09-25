// src/app/admin/(panel)/calendar/page.tsx
import { CalendarX } from 'lucide-react';
import { requireAdmin } from '@/lib/auth/admin';
import { supabaseAdmin } from '@/lib/supabase/server';
import { CalendarApp } from '@/components/admin/calendar/CalendarApp';
import { EmptyState, PageHeader } from '@/components/admin/ui';
import type { CalEvent } from '@/lib/admin/calendar';

export const dynamic = 'force-dynamic';

const DAY = 24 * 60 * 60_000;

// Events from 4 months back to 13 months ahead are loaded; the rest stay in the database.
function loadWindow() {
  const now = Date.now();
  return { from: new Date(now - 120 * DAY).toISOString(), to: new Date(now + 400 * DAY).toISOString() };
}

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ new?: string; title?: string; with?: string; lead?: string; client?: string; event?: string }>;
}) {
  await requireAdmin();
  const sp = await searchParams;
  const win = loadWindow();

  const { data, error } = await supabaseAdmin
    .from('calendar_events')
    .select(
      'id,title,kind,starts_at,ends_at,location,meeting_url,attendee,notes,lead_ref,client_id,reminders,reminders_sent,status,send_invite,invite_seq',
    )
    .gte('starts_at', win.from)
    .lte('starts_at', win.to)
    .order('starts_at', { ascending: true });

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader eyebrow="Schedule" title="Calendar" accent="." />
        <div className="rounded-2xl border border-white/[0.14] bg-white/[0.02]">
          <EmptyState
            icon={<CalendarX className="h-5 w-5" />}
            title="The calendar table isn't set up yet"
            body="Run supabase/migrations/033_calendar_events.sql in the Supabase SQL Editor, then reload this page."
          />
        </div>
      </div>
    );
  }

  const topic = process.env.NTFY_TOPIC ?? null;
  const prefill =
    sp.new === '1'
      ? { title: sp.title, attendee: sp.with, leadRef: sp.lead ?? null, clientId: sp.client ?? null }
      : null;

  return (
    <CalendarApp
      initialEvents={(data ?? []) as CalEvent[]}
      inviteEmail={process.env.CALENDAR_INVITE_EMAIL ?? null}
      ntfyTopic={topic}
      prefill={prefill}
      openId={sp.event ?? null}
    />
  );
}
