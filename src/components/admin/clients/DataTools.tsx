'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { Download, GitMerge, ShieldAlert } from 'lucide-react';
import { Button, Card, CardHeader, Input, Label, useToast } from '../ui';
import { deleteClient, mergeClients, searchClients } from '@/app/admin/(panel)/clients/data-actions';

export function DataTools({ clientId, clientName }: { clientId: string; clientName: string }) {
  const router = useRouter();
  const toast = useToast();
  const [pending, start] = useTransition();
  const [q, setQ] = useState('');
  const [hits, setHits] = useState<{ id: string; name: string; company: string }[]>([]);
  const [confirm, setConfirm] = useState('');
  const [alsoEnquiries, setAlsoEnquiries] = useState(true);

  const search = async (v: string) => {
    setQ(v);
    setHits(v.trim().length >= 2 ? await searchClients(v, clientId) : []);
  };

  const merge = (id: string, name: string) => {
    if (!window.confirm(`Merge "${name}" into "${clientName}"?\n\nTheir contacts, timeline, files, services and meetings move here, and "${name}" is deleted. This can't be undone.`)) return;
    start(async () => {
      const r = await mergeClients(clientId, id);
      if (!r.ok) return toast('error', r.error);
      toast('ok', 'Merged');
      setQ(''); setHits([]);
      router.refresh();
    });
  };

  const erase = () => start(async () => {
    const r = await deleteClient(clientId, { confirmName: confirm, alsoEnquiries });
    if (!r.ok) return toast('error', r.error);
    toast('ok', 'Client erased');
    router.push('/admin/clients');
  });

  return (
    <div className="mt-5 grid gap-5 lg:grid-cols-2">
      <Card className="bg-[#070A10]/80">
        <CardHeader title="Merge a duplicate" />
        <div className="space-y-3 p-5">
          <p className="text-[12.5px] leading-[1.6] text-white/50">Found the same person twice? Search for the other record and merge it into this one.</p>
          <div>
            <Label htmlFor="merge-q">Find the other client</Label>
            <Input id="merge-q" value={q} onChange={(e) => search(e.target.value)} placeholder="Type at least 2 letters" />
          </div>
          {hits.map((h) => (
            <div key={h.id} className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.12] px-3.5 py-2.5">
              <span className="min-w-0 truncate text-[13px] text-white">{h.name}{h.company && <span className="text-white/40"> · {h.company}</span>}</span>
              <Button size="sm" variant="secondary" disabled={pending} onClick={() => merge(h.id, h.name)}><GitMerge className="h-3.5 w-3.5" /> Merge in</Button>
            </div>
          ))}
        </div>
      </Card>

      <Card className="bg-[#070A10]/80">
        <CardHeader title="Privacy (PDPA)" />
        <div className="space-y-4 p-5">
          <div>
            <p className="text-[12.5px] leading-[1.6] text-white/50">Someone asked what you hold about them? Download all of it as a file.</p>
            <a href={`/api/admin/clients/${clientId}/export`} className="mt-2 inline-flex h-9 items-center gap-2 rounded-xl border border-white/[0.16] bg-white/[0.04] px-4 text-[13px] font-semibold text-white/85 hover:border-white/30">
              <Download className="h-4 w-4" /> Export their data
            </a>
          </div>
          <div className="border-t border-white/[0.12] pt-4">
            <p className="flex items-center gap-2 text-[13px] font-semibold text-red-300"><ShieldAlert className="h-4 w-4" /> Erase this client</p>
            <p className="mt-1 text-[12.5px] leading-[1.6] text-white/50">Deletes the client, contacts, timeline, files, services, invoices and linked meetings. This can&apos;t be undone.</p>
            <label className="mt-3 flex items-center gap-2 text-[12.5px] text-white/65">
              <input type="checkbox" checked={alsoEnquiries} onChange={(e) => setAlsoEnquiries(e.target.checked)} className="accent-[#5EE3DA]" />
              Also delete their original website enquiries
            </label>
            <div className="mt-3">
              <Label htmlFor="erase-confirm">Type <b className="text-white/80">{clientName}</b> to confirm</Label>
              <Input id="erase-confirm" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="off" />
            </div>
            <Button className="mt-3" variant="danger" disabled={pending || confirm !== clientName} onClick={erase}>Erase permanently</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
