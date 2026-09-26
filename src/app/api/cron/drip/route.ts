// src/app/api/cron/drip/route.ts
// Called once a day (see vercel.json). Sends the next follow-up email to every
// active subscriber whose next email has come due.
import { timingSafeEqual } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { SUBSCRIBER_COLS, sendNextDrip, type SubscriberRow } from '@/lib/subscribers/send';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

function authorised(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const given = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ?? req.nextUrl.searchParams.get('key') ?? '';
  const a = Buffer.from(given);
  const b = Buffer.from(secret);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function GET(req: NextRequest) {
  if (!authorised(req)) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  const { data, error } = await supabaseAdmin
    .from('subscribers')
    .select(SUBSCRIBER_COLS)
    .eq('status', 'active')
    .lte('next_send_at', new Date().toISOString())
    .order('next_send_at')
    .limit(100);
  if (error) return NextResponse.json({ error: 'Query failed' }, { status: 500 });
  let sent = 0;
  for (const sub of (data ?? []) as SubscriberRow[]) if (await sendNextDrip(sub)) sent++;
  return NextResponse.json({ due: data?.length ?? 0, sent });
}
