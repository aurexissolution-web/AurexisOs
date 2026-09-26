'use server';

// Newsletter sending and subscriber removal. Every action checks requireAdmin() first.
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth/admin';
import { supabaseAdmin } from '@/lib/supabase/server';
import { sendBatch } from '@/lib/email/send';
import { broadcastEmail } from '@/lib/email/templates';
import { bodyToBlocks } from '@/lib/subscribers/drip';
import { unsubscribeHeaders, unsubscribePage } from '@/lib/subscribers/send';

type Result = { ok: true; sent: number } | { ok: false; error: string };
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_RECIPIENTS = 1000;

function clean(subject: unknown, body: unknown): { subject: string; paragraphs: string[] } | string {
  const s = typeof subject === 'string' ? subject.trim() : '';
  const b = typeof body === 'string' ? body : '';
  if (!s || s.length > 200) return 'Add a subject (up to 200 characters).';
  const paragraphs = bodyToBlocks(b);
  if (!paragraphs.length) return 'Write the message first.';
  if (b.length > 10_000) return 'The message is too long (10,000 characters at most).';
  return { subject: s, paragraphs };
}

/** Sends the newsletter to the signed-in admin only, so it can be checked first. */
export async function sendTestBroadcast(subject: string, body: string): Promise<Result> {
  const admin = await requireAdmin();
  const c = clean(subject, body);
  if (typeof c === 'string') return { ok: false, error: c };
  const email = broadcastEmail({ ...c, unsubUrl: `${unsubscribePage('00000000-0000-0000-0000-000000000000')}` });
  const sent = await sendBatch([{ to: admin.email, email: { ...email, subject: `[Test] ${email.subject}` } }]);
  return sent ? { ok: true, sent } : { ok: false, error: 'Could not send. Is RESEND_API_KEY set?' };
}

/** Sends the newsletter to every active subscriber. */
export async function sendBroadcast(subject: string, body: string): Promise<Result> {
  const admin = await requireAdmin();
  const c = clean(subject, body);
  if (typeof c === 'string') return { ok: false, error: c };

  const { data, error } = await supabaseAdmin
    .from('subscribers')
    .select('email,unsub_token')
    .eq('status', 'active')
    .order('created_at')
    .limit(MAX_RECIPIENTS);
  if (error) return { ok: false, error: 'Could not load subscribers.' };
  if (!data?.length) return { ok: false, error: 'There are no active subscribers yet.' };

  const sent = await sendBatch(
    data.map((s) => ({
      to: s.email as string,
      email: broadcastEmail({ ...c, unsubUrl: unsubscribePage(s.unsub_token as string) }),
      headers: unsubscribeHeaders(s.unsub_token as string),
    })),
  );
  if (!sent) return { ok: false, error: 'Nothing was sent. Is RESEND_API_KEY set?' };

  await supabaseAdmin.from('email_broadcasts').insert({ subject: c.subject, body: c.paragraphs.join('\n\n'), recipients: sent, sent_by: admin.id });
  revalidatePath('/admin/subscribers');
  return { ok: true, sent };
}

export async function removeSubscriber(id: string): Promise<{ ok: boolean }> {
  await requireAdmin();
  if (typeof id !== 'string' || !UUID_RE.test(id)) return { ok: false };
  const { error } = await supabaseAdmin.from('subscribers').delete().eq('id', id);
  revalidatePath('/admin/subscribers');
  return { ok: !error };
}
