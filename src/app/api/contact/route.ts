// src/app/api/contact/route.ts
import { after, NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { sendEmail, SITE_URL, TEAM_INBOX } from '@/lib/email/send';
import { linkEnquiry, logEmailSent } from '@/lib/admin/client-link';
import { contactConfirmation, teamLeadAlert } from '@/lib/email/templates';
import { cap, clientIp, isHoneypot, rateLimited } from '@/lib/spam';
import { telegramBody } from '@/lib/telegram';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

const VALID_INTENTS = new Set([
  'new-project',
  'ai-agent',
  'existing-client',
  'press-partnerships',
  'careers',
]);

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

interface Errors {
  intent?: string;
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
}

// Accept anything that looks like a phone — digits, spaces, dashes, parens,
// optional leading +. We sanitize to digits-only when generating wa.me links
// in the admin, so storage can keep the user's original formatting.
const PHONE_RE = /^[+\d][\d\s\-().]{6,24}$/;

export async function POST(request: NextRequest) {
  try {
    if (rateLimited(`contact:${clientIp(request)}`, 5, 60 * 60_000)) {
      return NextResponse.json({ error: 'Too many messages from here. Please try again later, or WhatsApp us directly.' }, { status: 429 });
    }
    const body = (await request.json()) as Record<string, unknown>;
    if (isHoneypot(body)) return NextResponse.json({ ok: true });
    const intent = body.intent;
    const name = cap(body.name, 120);
    const email = cap(body.email, 160);
    const phone = cap(body.phone, 32);
    const company = cap(body.company, 160);
    const stage = cap(body.stage, 80);
    const message = cap(body.message, 4000);
    if (email && rateLimited(`contact-email:${email.toLowerCase()}`, 2, 60 * 60_000)) {
      return NextResponse.json({ ok: true });
    }

    const errors: Errors = {};
    if (typeof intent !== 'string' || !VALID_INTENTS.has(intent)) {
      errors.intent = 'Please pick a valid topic.';
    }
    if (typeof name !== 'string' || name.trim().length === 0) {
      errors.name = 'Please tell us your name.';
    }
    if (typeof email !== 'string' || !EMAIL_RE.test(email.trim())) {
      errors.email = 'Please give us a working email address.';
    }
    if (typeof phone !== 'string' || !PHONE_RE.test(phone.trim())) {
      errors.phone = 'Please give us a phone number we can WhatsApp.';
    }
    if (typeof message !== 'string' || message.trim().length === 0) {
      errors.message = 'Please write a short message.';
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ errors }, { status: 422 });
    }

    const { data: insertData, error: insertError } = await supabaseAdmin
      .from('contact_messages')
      .insert({
        intent,
        name: (name as string).trim(),
        email: (email as string).trim(),
        phone: (phone as string).trim(),
        company: typeof company === 'string' && company.trim() ? company.trim() : null,
        stage: typeof stage === 'string' && stage.trim() ? stage.trim() : null,
        message: (message as string).trim(),
      })
      .select('id')
      .single();

    if (insertError || !insertData) {
      console.error('[/api/contact] insert error:', insertError);
      return NextResponse.json(
        { error: 'Could not save your message. Try again, or email us directly.' },
        { status: 500 },
      );
    }

    const clean = {
      name: (name as string).trim(),
      email: (email as string).trim(),
      phone: (phone as string).trim(),
      message: (message as string).trim(),
    };
    after(async () => {
      const clientId = await linkEnquiry({
        source: 'contact',
        leadId: insertData.id,
        name: clean.name,
        email: clean.email,
        phone: clean.phone,
        headline: clean.message,
      });
      const confirmation = contactConfirmation({
        name: clean.name,
        intent: intent as string,
        message: clean.message,
      });
      const [sent] = await Promise.all([
        sendEmail(clean.email, confirmation),
        sendEmail(
          TEAM_INBOX,
          teamLeadAlert({
            source: 'Contact',
            name: clean.name,
            email: clean.email,
            phone: clean.phone,
            rows: [
              { label: 'Topic', value: intent as string },
              { label: 'Company', value: typeof company === 'string' ? company.trim() : '' },
              { label: 'Stage', value: typeof stage === 'string' ? stage.trim() : '' },
              { label: 'Message', value: clean.message },
            ],
            adminUrl: clientId
              ? `${SITE_URL}/admin/clients/${clientId}`
              : `${SITE_URL}/admin/command?lead=${encodeURIComponent(`contact:${insertData.id}`)}`,
          }),
          clean.email,
        ),
      ]);
      if (clientId && sent.ok) await logEmailSent(clientId, confirmation.subject, clean.email, sent.id);
    });

    // Put a "Reply to X" task on the admin calendar for tomorrow 10:00 Malaysia time
    // (the reply SLA), with a phone reminder. Never blocks the response.
    try {
      const day = new Date(Date.now() + 8 * 3_600_000 + 24 * 3_600_000).toISOString().slice(0, 10);
      const start = new Date(`${day}T10:00:00+08:00`);
      await supabaseAdmin.from('calendar_events').insert({
        title: `Reply to ${(name as string).trim()}`,
        kind: 'task',
        starts_at: start.toISOString(),
        ends_at: new Date(start.getTime() + 30 * 60_000).toISOString(),
        attendee: (name as string).trim(),
        notes: `Intent: ${intent}\n\n${(message as string).trim()}`.slice(0, 2000),
        lead_ref: `contact:${insertData.id}`,
        reminders: [15],
        send_invite: false,
      });
    } catch (err) {
      console.error('[/api/contact] calendar task failed:', err);
    }

    // Fire-and-forget Telegram notification if configured
    if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
      const text = [
        `📨 *New contact message*`,
        ``,
        `*Intent:* ${intent}`,
        `*Name:* ${(name as string).trim()}`,
        `*Email:* ${(email as string).trim()}`,
        `*Phone:* ${(phone as string).trim()}`,
        `*Company:* ${(company as string)?.trim?.() || '—'}`,
        `*Stage:* ${(stage as string)?.trim?.() || '—'}`,
        ``,
        `*Message:*`,
        (message as string).trim(),
        ``,
        `_via /contact form_`,
      ].join('\n');

      try {
        const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: telegramBody(TELEGRAM_CHAT_ID, text),
        });
        if (res.ok) {
          await supabaseAdmin
            .from('contact_messages')
            .update({ notified_at: new Date().toISOString() })
            .eq('id', insertData.id);
        } else {
          console.error('[/api/contact] telegram non-ok:', await res.text());
        }
      } catch (err) {
        console.error('[/api/contact] telegram fetch failed:', err);
      }
    }

    return NextResponse.json({ ok: true, id: insertData.id });
  } catch (err) {
    console.error('[/api/contact] unexpected error:', err);
    return NextResponse.json(
      { error: 'Something went wrong. Try emailing us directly.' },
      { status: 500 },
    );
  }
}
