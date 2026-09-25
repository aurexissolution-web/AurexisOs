// src/app/admin/(panel)/insights/[id]/page.tsx  ("new" = create)
import { notFound } from 'next/navigation';
import { requireAdmin } from '@/lib/auth/admin';
import { supabaseAdmin } from '@/lib/supabase/server';
import type { InsightPost } from '@/types/insights';
import { InsightEditor } from '@/components/admin/InsightEditor';

export const dynamic = 'force-dynamic';

export default async function InsightEditPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  if (id === 'new') return <InsightEditor post={null} />;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const { data } = await supabaseAdmin.from('insights_posts').select('*').eq('id', id).maybeSingle();
  if (!data) notFound();
  return <InsightEditor post={data as InsightPost} />;
}
