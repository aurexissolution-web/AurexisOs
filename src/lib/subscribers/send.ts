// Server-only: sending the follow-up series and newsletters to subscribers.
import 'server-only';
import { supabaseAdmin } from '@/lib/supabase/server';
import { sendEmail, SITE_URL } from '@/lib/email/send';
import { dripEmail } from '@/lib/email/templates';
import { DRIP_STEPS, nextDripAt } from './drip';

export interface SubscriberRow {
  id: string;
  email: string;
  name: string;
  unsub_token: string;
  drip_step: number;
  created_at: string;
}

export const SUBSCRIBER_COLS = 'id,email,name,unsub_token,drip_step,created_at';

export const unsubscribePage = (token: string) => `${SITE_URL}/unsubscribe?t=${token}`;

/** Headers that give mail apps a one-tap unsubscribe button. */
export function unsubscribeHeaders(token: string): Record<string, string> {
  return {
    'List-Unsubscribe': `<${SITE_URL}/api/unsubscribe?t=${token}>`,
    'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
  };
}

/** Sends the email that is next in line for this subscriber and schedules the one after. */
export async function sendNextDrip(sub: SubscriberRow): Promise<boolean> {
  const step = sub.drip_step;
  if (step >= DRIP_STEPS.length) {
    await supabaseAdmin.from('subscribers').update({ next_send_at: null }).eq('id', sub.id);
    return false;
  }
  const email = dripEmail(step, { name: sub.name, unsubUrl: unsubscribePage(sub.unsub_token) });
  const sent = await sendEmail(sub.email, email, undefined, undefined, unsubscribeHeaders(sub.unsub_token));
  if (!sent.ok) return false;
  await supabaseAdmin
    .from('subscribers')
    .update({ drip_step: step + 1, next_send_at: nextDripAt(sub.created_at, step + 1) })
    .eq('id', sub.id);
  return true;
}
