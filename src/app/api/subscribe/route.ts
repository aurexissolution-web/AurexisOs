// src/app/api/subscribe/route.ts
// The website pop-up and the footer box. Saves the person, sends the welcome
// email straight away, and the daily job (api/cron/drip) sends the rest.
import { after, NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { sendEmail, SITE_URL, TEAM_INBOX } from '@/lib/email/send';
import { teamLeadAlert } from '@/lib/email/templates';
import { cap, clientIp, isHoneypot, rateLimited } from '@/lib/spam';
import { SUBSCRIBER_COLS, sendNextDrip, type SubscriberRow } from '@/lib/subscribers/send';

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const SOURCES = new Set(['popup', 'footer']);

export async function POST(request: NextRequest) {
  if (rateLimited(`subscribe:${clientIp(request)}`, 5, 60 * 60_000)) {
    return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
  }
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }
  if (isHoneypot(body)) return NextResponse.json({ ok: true });

  const email = cap(body.email, 160).toLowerCase();
  const name = cap(body.name, 120);
  const business = cap(body.business, 160);
  const source = typeof body.source === 'string' && SOURCES.has(body.source) ? body.source : 'popup';
  if (!EMAIL_RE.test(email)) return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 422 });

  const now = new Date().toISOString();
  const { data: existing } = await supabaseAdmin.from('subscribers').select('id,status').eq('email', email).maybeSingle();

  let row: SubscriberRow | null = null;
  if (existing && existing.status === 'active') return NextResponse.json({ ok: true });
  if (existing) {
    // Re-subscribing restarts the welcome series; cap it so nobody can make us email a stranger repeatedly.
    if (rateLimited(`resubscribe:${email}`, 1, 24 * 60 * 60_000)) return NextResponse.json({ ok: true });
    const { data, error } = await supabaseAdmin
      .from('subscribers')
      .update({ status: 'active', unsubscribed_at: null, drip_step: 0, next_send_at: now, created_at: now, ...(name && { name }), ...(business && { business }) })
      .eq('id', existing.id)
      .select(SUBSCRIBER_COLS)
      .single();
    if (error) console.error('[/api/subscribe] resubscribe failed:', error.message);
    row = data as SubscriberRow | null;
  } else {
    const { data, error } = await supabaseAdmin
      .from('subscribers')
      .insert({ email, name, business, source, next_send_at: now })
      .select(SUBSCRIBER_COLS)
      .single();
    if (error?.code === '23505') return NextResponse.json({ ok: true });
    if (error) console.error('[/api/subscribe] insert failed:', error.message);
    row = data as SubscriberRow | null;
  }
  if (!row) return NextResponse.json({ error: 'Could not sign you up right now. Please try again later.' }, { status: 500 });

  const saved = row;
  after(async () => {
    await sendNextDrip(saved);
    await sendEmail(
      TEAM_INBOX,
      teamLeadAlert({
        source: 'Subscriber',
        name: name || email,
        email,
        rows: [
          { label: 'Business', value: business },
          { label: 'From', value: source === 'footer' ? 'Footer box' : 'Website pop-up' },
        ],
        adminUrl: `${SITE_URL}/admin/subscribers`,
      }),
      email,
    );
  });
  return NextResponse.json({ ok: true });
}
