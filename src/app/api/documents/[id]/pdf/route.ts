// Re-download an issued document exactly as it was saved.
import { NextResponse } from 'next/server';
import { docsAuthed } from '@/lib/documents/access';
import { supabaseAdmin } from '@/lib/supabase/server';
import { isId } from '@/lib/admin/validate';
import { buildDocument } from '@/lib/documents/build';

export const runtime = 'nodejs';

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!(await docsAuthed())) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });
  const { id } = await ctx.params;
  if (!isId(id)) return NextResponse.json({ error: 'Not found.' }, { status: 404 });

  const { data: row } = await supabaseAdmin.from('documents').select('kind,data').eq('id', id).maybeSingle();
  if (!row) return NextResponse.json({ error: 'Not found.' }, { status: 404 });

  const built = buildDocument(row.kind as string, row.data);
  if (!built.ok) return NextResponse.json({ error: 'This document cannot be rebuilt.' }, { status: 422 });

  return new NextResponse(new Uint8Array(await built.pdf()), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${built.filename}"`,
      'Cache-Control': 'private, no-store',
    },
  });
}
