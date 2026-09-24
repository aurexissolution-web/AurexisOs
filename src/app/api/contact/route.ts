// src/app/api/contact/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

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
    const body = await request.json();
    const { intent, name, email, phone, company, stage, message } = body as Record<string, unknown>;

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

    // Auto-create a "Reply to X" task in the admin planner for tomorrow (SLA).
    // Silent-fail — don't block the contact response if this insert errors.
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      await supabaseAdmin.from('planner_events').insert({
        title: `Reply to ${(name as string).trim()}`,
        event_date: tomorrow.toISOString().slice(0, 10),
        type: 'task',
        priority: 'high',
        notes: `Intent: ${intent}\n\n${(message as string).trim()}`,
        linked_entity_type: 'contact_message',
        linked_entity_id: insertData.id,
      });
    } catch (err) {
      console.error('[/api/contact] planner auto-create failed:', err);
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
        const res = await fetch(
          `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: TELEGRAM_CHAT_ID,
              text,
              parse_mode: 'Markdown',
            }),
          },
        );
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
