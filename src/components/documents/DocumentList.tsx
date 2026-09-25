// Server component: the table of issued documents for one page of the dashboard.
import type { ReactNode } from 'react';
import { FileText } from 'lucide-react';
import { supabaseAdmin } from '@/lib/supabase/server';
import { Card, EmptyState, PageHeader } from '@/components/admin/ui';
import { DocumentRowActions } from './DocumentRowActions';
import { formatDocDate, formatRMDoc } from '@/lib/documents/model';

export async function DocumentList({
  kinds,
  eyebrow,
  title,
  accent,
  description,
  actions,
  emptyBody,
}: {
  kinds: ('proposal' | 'invoice' | 'receipt')[];
  eyebrow: string;
  title: string;
  accent: string;
  description: string;
  actions: ReactNode;
  emptyBody: string;
}) {
  const { data, error } = await supabaseAdmin
    .from('documents')
    .select('id,kind,number,title,status,total_myr,doc_date')
    .in('kind', kinds)
    .order('doc_date', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(500);

  const header = <PageHeader eyebrow={eyebrow} title={title} accent={accent} description={description} actions={actions} />;
  const showAmount = !(kinds.length === 1 && kinds[0] === 'proposal');

  if (error) {
    return (
      <div className="space-y-6">
        {header}
        <Card>
          <EmptyState
            icon={<FileText className="h-5 w-5" />}
            title="The documents table isn't set up yet"
            body="Run supabase/migrations/037_documents.sql in the Supabase SQL Editor, then reload this page."
          />
        </Card>
      </div>
    );
  }

  const rows = data ?? [];
  return (
    <div className="space-y-6">
      {header}
      <Card>
        {rows.length === 0 ? (
          <EmptyState icon={<FileText className="h-5 w-5" />} title="Nothing here yet" body={emptyBody} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead className="border-b border-white/[0.12] font-mono text-[10px] uppercase tracking-[0.16em] text-white/40">
                <tr>
                  <th className="px-5 py-3">Number</th>
                  <th className="px-3 py-3">Client</th>
                  <th className="px-3 py-3">Date</th>
                  {showAmount && <th className="px-3 py-3 text-right">Amount</th>}
                  <th className="px-3 py-3">Status</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-b border-white/[0.06] last:border-0">
                    <td className="px-5 py-3 font-semibold text-white">
                      {r.number}
                      {kinds.length > 1 && (
                        <span className="ml-2 font-mono text-[10px] uppercase tracking-wider text-white/35">{r.kind}</span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-white/70">{r.title}</td>
                    <td className="px-3 py-3 text-white/60">{formatDocDate(r.doc_date)}</td>
                    {showAmount && (
                      <td className="px-3 py-3 text-right tabular-nums text-white/80">{formatRMDoc(Number(r.total_myr))}</td>
                    )}
                    <td className="px-3 py-3 text-white/50">{r.status === 'void' ? 'Void' : 'Issued'}</td>
                    <td className="px-5 py-3">
                      <DocumentRowActions id={r.id} kind={r.kind} isVoid={r.status === 'void'} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
