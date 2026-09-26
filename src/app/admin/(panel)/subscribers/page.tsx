// src/app/admin/(panel)/subscribers/page.tsx
import { requireAdmin } from '@/lib/auth/admin';
import { supabaseAdmin } from '@/lib/supabase/server';
import { SubscribersBoard, type SubscriberItem, type BroadcastItem } from '@/components/admin/SubscribersBoard';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const sevenDaysAgo = () => Date.now() - 7 * 86_400_000;

export default async function SubscribersPage() {
  await requireAdmin();
  const [subs, sent] = await Promise.all([
    supabaseAdmin.from('subscribers').select('id,email,name,business,source,status,drip_step,created_at').order('created_at', { ascending: false }).limit(1000),
    supabaseAdmin.from('email_broadcasts').select('id,subject,recipients,created_at').order('created_at', { ascending: false }).limit(20),
  ]);
  const weekAgo = sevenDaysAgo();
  const list = (subs.data ?? []) as SubscriberItem[];
  return (
    <SubscribersBoard
      subscribers={list}
      thisWeek={list.filter((s) => new Date(s.created_at).getTime() > weekAgo).length}
      broadcasts={(sent.data ?? []) as BroadcastItem[]}
      missingTable={Boolean(subs.error)}
    />
  );
}
