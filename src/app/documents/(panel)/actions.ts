'use server';

import { revalidatePath } from 'next/cache';
import { requireDocsAccess } from '@/lib/documents/access';
import { supabaseAdmin } from '@/lib/supabase/server';
import { isId } from '@/lib/admin/validate';
import { formatRMDoc } from '@/lib/documents/model';
import { buildDocument } from '@/lib/documents/build';

type Fail = { ok: false; error: string };

export async function saveDocument(input: {
  kind: 'invoice' | 'receipt' | 'proposal';
  data: unknown;
  clientId: string | null;
  sourceId: string | null;
}): Promise<{ ok: true; id: string } | Fail> {
  await requireDocsAccess();
  if (input.clientId !== null && !isId(input.clientId)) return { ok: false, error: 'Invalid client.' };
  if (input.sourceId !== null && !isId(input.sourceId)) return { ok: false, error: 'Invalid source document.' };

  const built = buildDocument(input.kind, input.data);
  if (!built.ok) return built;
  const { number, date, total, title } = built;
  const stored = built.data;

  const { data: row, error } = await supabaseAdmin
    .from('documents')
    .insert({
      kind: input.kind, number, client_id: input.clientId, title, data: stored,
      total_myr: total, doc_date: date, source_id: input.sourceId, created_by: null,
    })
    .select('id')
    .single();
  if (error) {
    if (error.code === '23505') return { ok: false, error: `${number} already exists. Use the next number.` };
    console.error('[documents] save failed:', error);
    return { ok: false, error: 'Could not save the document.' };
  }

  if (input.clientId) {
    await supabaseAdmin.from('client_activity').insert({
      client_id: input.clientId,
      kind: 'invoice',
      title: `${input.kind === 'invoice' ? 'Invoice' : input.kind === 'receipt' ? 'Receipt' : 'Proposal'} ${number} issued`,
      body: total ? formatRMDoc(total) : '',
      actor_id: null,
      ref: `doc:${row.id}`,
    });
  }
  revalidatePath('/documents', 'layout');
  return { ok: true, id: row.id as string };
}

export async function setDocumentVoid(id: string, isVoid: boolean): Promise<{ ok: true } | Fail> {
  await requireDocsAccess();
  if (!isId(id)) return { ok: false, error: 'Invalid document.' };
  const { error } = await supabaseAdmin
    .from('documents')
    .update({ status: isVoid ? 'void' : 'issued', updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) return { ok: false, error: 'Could not update the document.' };
  revalidatePath('/documents', 'layout');
  return { ok: true };
}
