'use client';

import { useState, useTransition } from 'react';
import { Pencil, Plus, Star, Trash2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Client, ClientContact, ClientKind } from '@/lib/admin/clients';
import { Button, Card, CardHeader, Input, Label, Segmented, Textarea, useToast } from '../ui';
import { deleteContact, saveContact, updateClient } from '@/app/admin/(panel)/clients/actions';

const blank = { id: undefined as string | undefined, name: '', role: '', email: '', phone: '', isPrimary: false };

export function DetailsPanel({
  client,
  contacts: initial,
  owners,
  onClientChange,
}: {
  client: Client;
  contacts: ClientContact[];
  owners: { id: string; name: string }[];
  onClientChange: (c: Client) => void;
}) {
  const toast = useToast();
  const [pending, start] = useTransition();
  const [contacts, setContacts] = useState(initial);
  const [editing, setEditing] = useState<typeof blank | null>(null);
  const [f, setF] = useState({
    name: client.name,
    company: client.company,
    industry: client.industry,
    website: client.website,
    address: client.address,
    tags: client.tags.join(', '),
    notes: client.notes,
  });
  const [kind, setKind] = useState<ClientKind>(client.kind);
  const [ownerId, setOwnerId] = useState(client.owner_id ?? '');
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setF((cur) => ({ ...cur, [k]: e.target.value }));

  const saveDetails = (e: React.FormEvent) => {
    e.preventDefault();
    start(async () => {
      const res = await updateClient(client.id, {
        name: f.name,
        company: f.company,
        kind,
        industry: f.industry,
        website: f.website,
        address: f.address,
        notes: f.notes,
        ownerId: ownerId || null,
        tags: f.tags.split(',').map((t) => t.trim()).filter(Boolean),
      });
      if (!res.ok) return toast('error', res.error);
      onClientChange(res.client);
      toast('ok', 'Details saved');
    });
  };

  const submitContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    start(async () => {
      const res = await saveContact(client.id, { ...editing, isPrimary: editing.isPrimary || contacts.length === 0 });
      if (!res.ok) return toast('error', res.error);
      setContacts(res.contacts);
      setEditing(null);
      toast('ok', 'Contact saved');
    });
  };

  const removeContact = (id: string) => {
    if (!window.confirm('Remove this contact?')) return;
    start(async () => {
      const res = await deleteContact(client.id, id);
      if (!res.ok) return toast('error', res.error);
      setContacts(res.contacts);
    });
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
      <Card className="bg-[#070A10]/80">
        <CardHeader title="Details" />
        <form onSubmit={saveDetails} className="space-y-4 p-5">
          <Segmented value={kind} onChange={setKind} options={[{ value: 'business', label: 'Business' }, { value: 'individual', label: 'Individual' }]} />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="d-name">Name</Label>
              <Input id="d-name" value={f.name} onChange={set('name')} maxLength={160} required />
            </div>
            <div>
              <Label htmlFor="d-company">Company</Label>
              <Input id="d-company" value={f.company} onChange={set('company')} maxLength={160} />
            </div>
            <div>
              <Label htmlFor="d-industry">Industry</Label>
              <Input id="d-industry" value={f.industry} onChange={set('industry')} maxLength={120} />
            </div>
            <div>
              <Label htmlFor="d-web">Website</Label>
              <Input id="d-web" type="url" value={f.website} onChange={set('website')} maxLength={300} placeholder="https://" />
            </div>
            <div>
              <Label htmlFor="d-owner">Owner</Label>
              <select
                id="d-owner"
                value={ownerId}
                onChange={(e) => setOwnerId(e.target.value)}
                className="h-10 w-full rounded-xl border border-white/[0.1] bg-white/[0.03] px-3 text-[14px] text-white outline-none focus:border-[#5EE3DA]/50"
              >
                <option value="" className="bg-[#070B12]">Unassigned</option>
                {owners.map((o) => <option key={o.id} value={o.id} className="bg-[#070B12]">{o.name}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="d-addr">Address</Label>
              <Input id="d-addr" value={f.address} onChange={set('address')} maxLength={300} />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="d-tags" hint="comma separated">Tags</Label>
              <Input id="d-tags" value={f.tags} onChange={set('tags')} placeholder="clinic, referral, care-plan" />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="d-notes">Notes</Label>
              <Textarea id="d-notes" rows={5} value={f.notes} onChange={set('notes')} maxLength={5000} />
            </div>
          </div>
          <Button type="submit" variant="primary" disabled={pending || !f.name.trim()}>Save details</Button>
        </form>
      </Card>

      <Card className="h-fit bg-[#070A10]/80">
        <CardHeader
          title="Contacts"
          meta={`${contacts.length}`}
          action={<Button size="sm" variant="secondary" onClick={() => setEditing({ ...blank })}><Plus className="h-3.5 w-3.5" /> Add</Button>}
        />
        <ul>
          {contacts.map((c) => (
            <li key={c.id} className="group flex items-start gap-3 border-b border-white/[0.1] px-5 py-3.5 last:border-b-0">
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2 text-[14px] font-semibold text-white">
                  {c.name || c.email || c.phone}
                  {c.is_primary && <Star className="h-3 w-3 fill-[#F0C88F] text-[#F0C88F]" aria-label="Primary contact" />}
                </span>
                {c.role && <span className="block text-[12px] text-white/45">{c.role}</span>}
                <span className="mt-1 block space-y-0.5 text-[12.5px] text-white/60">
                  {c.email && <a className="block truncate hover:text-[#5EE3DA]" href={`mailto:${c.email}`}>{c.email}</a>}
                  {c.phone && <span className="block">{c.phone}</span>}
                </span>
              </span>
              <span className={cn('flex gap-1 opacity-0 transition group-hover:opacity-100 focus-within:opacity-100')}>
                <button type="button" aria-label="Edit contact" onClick={() => setEditing({ id: c.id, name: c.name, role: c.role, email: c.email, phone: c.phone, isPrimary: c.is_primary })} className="grid h-7 w-7 place-items-center rounded-lg text-white/50 hover:bg-white/[0.07] hover:text-white"><Pencil className="h-3.5 w-3.5" /></button>
                <button type="button" aria-label="Remove contact" onClick={() => removeContact(c.id)} className="grid h-7 w-7 place-items-center rounded-lg text-white/50 hover:bg-red-400/10 hover:text-red-300"><Trash2 className="h-3.5 w-3.5" /></button>
              </span>
            </li>
          ))}
          {contacts.length === 0 && !editing && (
            <li className="px-5 py-8 text-center text-[13px] text-white/40">No contact details yet.</li>
          )}
        </ul>

        {editing && (
          <form onSubmit={submitContact} className="space-y-3 border-t border-white/[0.14] bg-white/[0.02] p-5">
            <div className="flex items-center justify-between">
              <p className="text-[13px] font-semibold text-white">{editing.id ? 'Edit contact' : 'New contact'}</p>
              <button type="button" onClick={() => setEditing(null)} aria-label="Cancel" className="text-white/40 hover:text-white"><X className="h-4 w-4" /></button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div><Label htmlFor="c-name">Name</Label><Input id="c-name" autoFocus value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} maxLength={160} /></div>
              <div><Label htmlFor="c-role">Role</Label><Input id="c-role" value={editing.role} onChange={(e) => setEditing({ ...editing, role: e.target.value })} maxLength={120} placeholder="Owner, Manager…" /></div>
              <div><Label htmlFor="c-email">Email</Label><Input id="c-email" type="email" value={editing.email} onChange={(e) => setEditing({ ...editing, email: e.target.value })} maxLength={200} /></div>
              <div><Label htmlFor="c-phone">Phone / WhatsApp</Label><Input id="c-phone" value={editing.phone} onChange={(e) => setEditing({ ...editing, phone: e.target.value })} maxLength={40} /></div>
            </div>
            <label className="flex items-center gap-2 text-[12.5px] text-white/60">
              <input type="checkbox" checked={editing.isPrimary} onChange={(e) => setEditing({ ...editing, isPrimary: e.target.checked })} className="accent-[#5EE3DA]" />
              Primary contact
            </label>
            <Button type="submit" variant="primary" size="sm" disabled={pending}>Save contact</Button>
          </form>
        )}
      </Card>
    </div>
  );
}
