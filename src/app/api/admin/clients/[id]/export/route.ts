// PDPA data export: everything held about one client, as a JSON download.
import { NextResponse } from 'next/server';
import { getAdminUser } from '@/lib/auth/admin';
import { supabaseAdmin } from '@/lib/supabase/server';
import { isId } from '@/lib/admin/validate';

export const dynamic = 'force-dynamic';

const LEAD_TABLES = [
  'presence_quote_requests', 'flow_quote_requests', 'core_quote_requests', 'connect_quote_requests',
  'ai_readiness_audit_quote_requests', 'contact_messages', 'calculator_leads',
];

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getAdminUser())) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  const { id } = await params;
  if (!isId(id)) return NextResponse.json({ error: 'Invalid client' }, { status: 400 });

  const { data: client } = await supabaseAdmin.from('clients').select('*').eq('id', id).maybeSingle();
  if (!client) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const [contacts, activity, files, services, invoices, events, ...enquiries] = await Promise.all([
    supabaseAdmin.from('client_contacts').select('*').eq('client_id', id),
    supabaseAdmin.from('client_activity').select('*').eq('client_id', id).order('occurred_at'),
    supabaseAdmin.from('client_files').select('id,name,kind,size_bytes,mime_type,sent_at,sent_to,created_at').eq('client_id', id),
    supabaseAdmin.from('client_services').select('*').eq('client_id', id),
    supabaseAdmin.from('client_invoices').select('*').eq('client_id', id),
    supabaseAdmin.from('calendar_events').select('id,title,kind,starts_at,ends_at,location,notes,status').eq('client_id', id),
    ...LEAD_TABLES.map((t) => supabaseAdmin.from(t).select('*').eq('client_id', id)),
  ]);

  const body = {
    exportedAt: new Date().toISOString(),
    note: 'All personal data held about this client by Aurexis Solution. File contents are not included, only their details.',
    client,
    contacts: contacts.data ?? [],
    timeline: activity.data ?? [],
    files: files.data ?? [],
    services: services.data ?? [],
    invoices: invoices.data ?? [],
    meetings: events.data ?? [],
    websiteEnquiries: Object.fromEntries(LEAD_TABLES.map((t, i) => [t, enquiries[i].data ?? []])),
  };
  const safe = String(client.name).replace(/[^\w-]+/g, '-').slice(0, 40).toLowerCase() || 'client';
  return new NextResponse(JSON.stringify(body, null, 2), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Disposition': `attachment; filename="aurexis-${safe}-data.json"`,
      'Cache-Control': 'no-store',
    },
  });
}
