// src/app/admin/(panel)/work/[id]/page.tsx  ("new" = create)
import { notFound } from 'next/navigation';
import { requireAdmin } from '@/lib/auth/admin';
import { supabaseAdmin } from '@/lib/supabase/server';
import { WorkEditor, type WorkRow } from '@/components/admin/WorkEditor';

export const dynamic = 'force-dynamic';

export default async function WorkEditPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  if (id === 'new') return <WorkEditor row={null} />;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const { data } = await supabaseAdmin.from('case_studies').select('*').eq('id', id).maybeSingle();
  if (!data) notFound();
  return <WorkEditor row={data as WorkRow} />;
}
