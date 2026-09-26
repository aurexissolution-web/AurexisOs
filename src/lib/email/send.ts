// src/lib/email/send.ts
import 'server-only';
import { Resend } from 'resend';
import type { Email } from './templates';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM = process.env.LEAD_FROM_EMAIL || 'Aurexis Solution <onboarding@resend.dev>';
export const TEAM_INBOX = process.env.LEAD_NOTIFICATION_EMAIL || 'contact@aurexissolution.com';
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://aurexissolution.com').replace(
  /\/$/,
  '',
);

const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

export type EmailAttachment = { filename: string; content: string; contentType: string };

// Never throws: a failed email must not fail the form submission.
export async function sendEmail(
  to: string,
  email: Email,
  replyTo: string = TEAM_INBOX,
  attachments?: EmailAttachment[],
  headers?: Record<string, string>,
): Promise<{ ok: boolean; id?: string }> {
  if (!resend) {
    console.warn(`[email] RESEND_API_KEY not set, skipped "${email.subject}"`);
    return { ok: false };
  }
  try {
    const { data, error } = await resend.emails.send({
      from: FROM,
      to,
      replyTo,
      subject: email.subject,
      html: email.html,
      text: email.text,
      ...(attachments && { attachments }),
      ...(headers && { headers }),
    });
    if (error) {
      console.error(`[email] Resend error for "${email.subject}":`, error);
      return { ok: false };
    }
    return { ok: true, id: data?.id };
  } catch (err) {
    console.error(`[email] Resend exception for "${email.subject}":`, err);
    return { ok: false };
  }
}

/** Sends up to 100 emails per Resend call. Returns how many were accepted. */
export async function sendBatch(
  items: { to: string; email: Email; headers?: Record<string, string> }[],
): Promise<number> {
  if (!resend) {
    console.warn('[email] RESEND_API_KEY not set, skipped batch');
    return 0;
  }
  let accepted = 0;
  for (let i = 0; i < items.length; i += 100) {
    const chunk = items.slice(i, i + 100);
    try {
      const { error } = await resend.batch.send(
        chunk.map((c) => ({
          from: FROM,
          to: c.to,
          replyTo: TEAM_INBOX,
          subject: c.email.subject,
          html: c.email.html,
          text: c.email.text,
          ...(c.headers && { headers: c.headers }),
        })),
      );
      if (error) console.error('[email] Resend batch error:', error);
      else accepted += chunk.length;
    } catch (err) {
      console.error('[email] Resend batch exception:', err);
    }
  }
  return accepted;
}
