'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import { CLIENT_STATUSES, type ClientKind, type ClientStatus } from '@/lib/admin/clients';
import { Button, Input, Label, Segmented, Textarea, useToast } from '../ui';
import { createClient } from '@/app/admin/(panel)/clients/actions';

export function NewClientDialog({
  owners,
  meId,
  onClose,
}: {
  owners: { id: string; name: string }[];
  meId: string;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const router = useRouter();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const [dupe, setDupe] = useState<string | null>(null);
  const [kind, setKind] = useState<ClientKind>('business');
  const [status, setStatus] = useState<ClientStatus>('lead');
  const [ownerId, setOwnerId] = useState(meId);
  const [f, setF] = useState({ name: '', company: '', contactName: '', email: '', phone: '', industry: '', notes: '' });
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setF((cur) => ({ ...cur, [k]: e.target.value }));

  useEffect(() => {
    const d = ref.current;
    if (d && !d.open) d.showModal();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setDupe(null);
    const res = await createClient({
      name: f.name,
      company: f.company,
      kind,
      status,
      ownerId,
      industry: f.industry,
      website: '',
      address: '',
      tags: [],
      notes: f.notes,
      contactName: f.contactName,
      email: f.email,
      phone: f.phone,
    });
    setBusy(false);
    if (res.ok) {
      toast('ok', 'Client added');
      router.push(`/admin/clients/${res.client.id}`);
      return;
    }
    if ('duplicateId' in res) setDupe(res.duplicateId);
    toast('error', res.error);
  };

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === e.currentTarget && onClose()}
      data-lenis-prevent
      aria-labelledby="nc-title"
      className="m-auto max-h-[94vh] w-[min(540px,calc(100%-1.5rem))] overflow-y-auto rounded-3xl border border-white/10 bg-[#070B12] p-0 text-white shadow-[0_40px_120px_-30px_rgba(0,0,0,0.9)] backdrop:bg-black/70 backdrop:backdrop-blur-sm"
    >
      <form onSubmit={submit} className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <h2 id="nc-title" className="text-[20px] font-semibold tracking-[-0.02em]">
            New client
          </h2>
          <button type="button" onClick={onClose} aria-label="Close" className="grid h-9 w-9 place-items-center rounded-full text-white/50 hover:bg-white/[0.06] hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <Segmented value={kind} onChange={setKind} options={[{ value: 'business', label: 'Business' }, { value: 'individual', label: 'Individual' }]} />
          <Segmented value={status} onChange={setStatus} options={CLIENT_STATUSES.map((s) => ({ value: s.key, label: s.label, color: s.color }))} />
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label htmlFor="nc-name">{kind === 'business' ? 'Business name' : 'Full name'} *</Label>
            <Input id="nc-name" autoFocus required value={f.name} onChange={set('name')} maxLength={160} placeholder={kind === 'business' ? 'Ayurveda Wellness Centre' : 'Aisyah Rahman'} />
          </div>
          {kind === 'business' && (
            <div>
              <Label htmlFor="nc-contact">Contact person</Label>
              <Input id="nc-contact" value={f.contactName} onChange={set('contactName')} maxLength={160} placeholder="Dr. Priya" />
            </div>
          )}
          <div>
            <Label htmlFor="nc-industry">Industry</Label>
            <Input id="nc-industry" value={f.industry} onChange={set('industry')} maxLength={120} placeholder="Wellness clinic" />
          </div>
          <div>
            <Label htmlFor="nc-email">Email</Label>
            <Input id="nc-email" type="email" value={f.email} onChange={set('email')} maxLength={200} placeholder="name@business.my" />
          </div>
          <div>
            <Label htmlFor="nc-phone">Phone / WhatsApp</Label>
            <Input id="nc-phone" value={f.phone} onChange={set('phone')} maxLength={40} placeholder="012-345 6789" />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="nc-owner">Owner</Label>
            <select
              id="nc-owner"
              value={ownerId}
              onChange={(e) => setOwnerId(e.target.value)}
              className="h-10 w-full rounded-xl border border-white/[0.1] bg-white/[0.03] px-3 text-[14px] text-white outline-none focus:border-[#5EE3DA]/50"
            >
              {owners.map((o) => (
                <option key={o.id} value={o.id} className="bg-[#070B12]">
                  {o.name}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="nc-notes">Notes</Label>
            <Textarea id="nc-notes" rows={3} value={f.notes} onChange={set('notes')} maxLength={5000} placeholder="How you met, what they need…" />
          </div>
        </div>

        {dupe && (
          <p className="mt-4 rounded-xl border border-amber-300/25 bg-amber-300/[0.06] px-3.5 py-2.5 text-[13px] text-amber-200">
            This looks like an existing client.{' '}
            <a className="font-semibold underline" href={`/admin/clients/${dupe}`}>
              Open them instead
            </a>
          </p>
        )}

        <div className="mt-6 flex gap-2">
          <Button type="submit" variant="primary" disabled={busy || !f.name.trim()}>
            Add client
          </Button>
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </dialog>
  );
}
