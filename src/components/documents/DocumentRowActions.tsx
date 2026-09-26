'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Ban, FileDown, Pencil, Receipt, Undo2 } from 'lucide-react';
import { Button, useToast } from '@/components/admin/ui';
import { setDocumentVoid } from '@/app/documents/(panel)/actions';

export function DocumentRowActions({ id, kind, isVoid }: { id: string; kind: string; isVoid: boolean }) {
  const router = useRouter();
  const toast = useToast();
  const [busy, setBusy] = useState(false);

  const toggle = async () => {
    if (!isVoid && !window.confirm('Void this document? It stays in the list, marked void.')) return;
    setBusy(true);
    const r = await setDocumentVoid(id, !isVoid);
    setBusy(false);
    if (!r.ok) return toast('error', r.error);
    router.refresh();
  };

  return (
    <div className="flex items-center justify-end gap-1.5">
      <a
        href={`/api/documents/${id}/pdf`}
        target="_blank"
        rel="noreferrer"
        className="inline-flex h-8 items-center gap-1.5 rounded-xl px-3 text-[12px] font-semibold text-white/70 hover:bg-white/[0.05] hover:text-white"
      >
        <FileDown className="h-4 w-4" /> PDF
      </a>
      {!isVoid && (
        <Link
          href={kind === 'proposal' ? `/documents/proposals/${id}/edit` : `/documents/billing/${id}/edit`}
          className="inline-flex h-8 items-center gap-1.5 rounded-xl px-3 text-[12px] font-semibold text-white/70 hover:bg-white/[0.05] hover:text-white"
        >
          <Pencil className="h-4 w-4" /> Edit
        </Link>
      )}
      {kind === 'invoice' && !isVoid && (
        <Link
          href={`/documents/billing/new?kind=receipt&from=${id}`}
          className="inline-flex h-8 items-center gap-1.5 rounded-xl px-3 text-[12px] font-semibold text-[#5EE3DA] hover:bg-white/[0.05]"
        >
          <Receipt className="h-4 w-4" /> Receipt
        </Link>
      )}
      <Button variant="ghost" size="sm" onClick={toggle} disabled={busy} aria-label={isVoid ? 'Restore' : 'Void'}>
        {isVoid ? <Undo2 className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
      </Button>
    </div>
  );
}
