'use client';

import { useRef, useState } from 'react';
import { Download, FileText, Image as ImageIcon, Loader2, Mail, Send, Trash2, Upload, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase/client';
import type { ClientContact } from '@/lib/admin/clients';
import { Button, Card, CardHeader, Label, Segmented, Textarea, timeAgo, useToast } from '../ui';
import {
  deleteFile,
  emailFileToClient,
  getFileUrl,
  prepareUpload,
  registerFile,
  setFileKind,
  type ClientFile,
} from '@/app/admin/(panel)/clients/files-actions';

type Kind = ClientFile['kind'];
const KIND_LABEL: Record<Kind, string> = { quote: 'Quote', invoice: 'Invoice', contract: 'Contract', other: 'Other' };
const MAX = 20 * 1024 * 1024;

const guessKind = (name: string): Kind =>
  /quot/i.test(name) ? 'quote' : /invoice|inv[-_ ]?\d/i.test(name) ? 'invoice' : /contract|agreement|nda|sla/i.test(name) ? 'contract' : 'other';

const size = (b: number) => (b < 1024 * 1024 ? `${Math.max(1, Math.round(b / 1024))} KB` : `${(b / 1024 / 1024).toFixed(1)} MB`);

export function FilesPanel({
  clientId,
  initial,
  contacts,
  clientName,
}: {
  clientId: string;
  initial: ClientFile[];
  contacts: ClientContact[];
  clientName: string;
}) {
  const toast = useToast();
  const input = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState(initial);
  const [busy, setBusy] = useState<string | null>(null);
  const [over, setOver] = useState(false);
  const [sending, setSending] = useState<ClientFile | null>(null);
  const emails = contacts.filter((c) => c.email);

  const upload = async (list: FileList | File[]) => {
    for (const file of Array.from(list)) {
      if (file.size > MAX) { toast('error', `${file.name} is over 20 MB`); continue; }
      setBusy(`Uploading ${file.name}…`);
      const prep = await prepareUpload(clientId, { name: file.name, size: file.size, mime: file.type });
      if (!prep.ok) { toast('error', prep.error); continue; }
      const up = await supabase.storage.from('client-files').uploadToSignedUrl(prep.path, prep.token, file, { contentType: file.type });
      if (up.error) { toast('error', `Upload failed: ${up.error.message}`); continue; }
      const reg = await registerFile(clientId, { path: prep.path, name: file.name, kind: guessKind(file.name), size: file.size, mime: file.type });
      if (!reg.ok) { toast('error', reg.error); continue; }
      setFiles((cur) => [reg.file, ...cur]);
      toast('ok', `${file.name} added`);
    }
    setBusy(null);
  };

  const open = async (f: ClientFile) => {
    const r = await getFileUrl(f.id);
    if (!r.ok) return toast('error', r.error);
    // The link is an attachment, so this downloads without leaving the page (and no popup blocker applies).
    window.location.assign(r.url);
  };

  const remove = async (f: ClientFile) => {
    if (!window.confirm(`Delete ${f.name}? This can't be undone.`)) return;
    const r = await deleteFile(f.id);
    if (!r.ok) return toast('error', r.error);
    setFiles((cur) => cur.filter((x) => x.id !== f.id));
  };

  const setKind = async (id: string, kind: Kind) => {
    const before = files;
    setFiles((cur) => cur.map((f) => (f.id === id ? { ...f, kind } : f)));
    const r = await setFileKind(id, kind);
    if (!r.ok) { setFiles(before); toast('error', r.error); }
  };

  return (
    <div className="space-y-5">
      <div
        onDragOver={(e) => { e.preventDefault(); setOver(true); }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => { e.preventDefault(); setOver(false); if (e.dataTransfer.files.length) upload(e.dataTransfer.files); }}
        className={cn('flex flex-col items-center justify-center rounded-2xl border border-dashed px-6 py-9 text-center transition-colors', over ? 'border-[#5EE3DA]/70 bg-[#5EE3DA]/[0.06]' : 'border-white/[0.2] bg-white/[0.02]')}
      >
        {busy ? (
          <p className="flex items-center gap-2 text-[13px] text-white/70"><Loader2 className="h-4 w-4 animate-spin" /> {busy}</p>
        ) : (
          <>
            <Upload className="h-6 w-6 text-white/40" />
            <p className="mt-3 text-[14px] text-white/80">Drop quotes, contracts or invoices here</p>
            <p className="mt-1 text-[12px] text-white/40">PDF, Word, Excel, images, CSV, zip · up to 20 MB · stored privately</p>
            <Button className="mt-4" variant="secondary" size="sm" onClick={() => input.current?.click()}>Choose files</Button>
          </>
        )}
        <input ref={input} type="file" multiple hidden onChange={(e) => e.target.files && upload(e.target.files)} />
      </div>

      <Card className="bg-[#070A10]/80">
        <CardHeader title="Files" meta={`${files.length}`} />
        {files.length === 0 ? (
          <p className="px-6 py-10 text-center text-[13px] text-white/40">No files yet.</p>
        ) : (
          <ul>
            {files.map((f) => {
              const Icon = f.mime_type.startsWith('image/') ? ImageIcon : FileText;
              return (
                <li key={f.id} className="flex flex-wrap items-center gap-3 border-b border-white/[0.1] px-5 py-3.5 last:border-b-0">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-white/[0.14] bg-white/[0.03] text-white/55"><Icon className="h-4 w-4" /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13.5px] font-medium text-white">{f.name}</span>
                    <span className="mt-0.5 block text-[11.5px] text-white/40">
                      {size(f.size_bytes)} · added {timeAgo(f.created_at)}
                      {f.sent_at && <span className="text-[#7FE8C4]"> · emailed to {f.sent_to} {timeAgo(f.sent_at)}</span>}
                    </span>
                  </span>
                  <Segmented size="sm" value={f.kind} onChange={(k) => setKind(f.id, k)} options={(Object.keys(KIND_LABEL) as Kind[]).map((k) => ({ value: k, label: KIND_LABEL[k] }))} />
                  <span className="flex gap-1">
                    <button type="button" aria-label={`Download ${f.name}`} onClick={() => open(f)} className="grid h-8 w-8 place-items-center rounded-lg text-white/55 hover:bg-white/[0.07] hover:text-white"><Download className="h-4 w-4" /></button>
                    <button type="button" aria-label={`Email ${f.name}`} disabled={emails.length === 0} title={emails.length === 0 ? 'Add an email contact first' : 'Email to client'} onClick={() => setSending(f)} className="grid h-8 w-8 place-items-center rounded-lg text-white/55 hover:bg-white/[0.07] hover:text-[#5EE3DA] disabled:opacity-30"><Mail className="h-4 w-4" /></button>
                    <button type="button" aria-label={`Delete ${f.name}`} onClick={() => remove(f)} className="grid h-8 w-8 place-items-center rounded-lg text-white/55 hover:bg-red-400/10 hover:text-red-300"><Trash2 className="h-4 w-4" /></button>
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      {sending && (
        <SendDialog
          file={sending}
          contacts={emails}
          clientName={clientName}
          onClose={() => setSending(null)}
          onSent={(f) => { setFiles((cur) => cur.map((x) => (x.id === f.id ? f : x))); setSending(null); }}
        />
      )}
    </div>
  );
}

function SendDialog({
  file, contacts, clientName, onClose, onSent,
}: {
  file: ClientFile;
  contacts: ClientContact[];
  clientName: string;
  onClose: () => void;
  onSent: (f: ClientFile) => void;
}) {
  const toast = useToast();
  const [to, setTo] = useState(contacts.find((c) => c.is_primary)?.email ?? contacts[0].email);
  const [msg, setMsg] = useState(`Hi, please find our ${KIND_LABEL[file.kind].toLowerCase()} attached. Let us know if you have any questions.`);
  const [busy, setBusy] = useState(false);
  const who = contacts.find((c) => c.email === to);

  const send = async () => {
    setBusy(true);
    const r = await emailFileToClient(file.id, { to, recipientName: who?.name || clientName, message: msg });
    setBusy(false);
    if (!r.ok) return toast('error', r.error);
    toast('ok', `Sent to ${to}`);
    onSent(r.file);
  };

  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-black/70 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Email file" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#070B12] p-6 text-white shadow-2xl">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-[18px] font-semibold">Email this file</h2>
            <p className="mt-0.5 truncate text-[12.5px] text-white/45">{file.name}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="text-white/40 hover:text-white"><X className="h-4 w-4" /></button>
        </div>
        <div className="mt-4">
          <Label htmlFor="send-to">To</Label>
          <select id="send-to" value={to} onChange={(e) => setTo(e.target.value)} className="h-10 w-full rounded-xl border border-white/[0.1] bg-white/[0.03] px-3 text-[14px] text-white outline-none focus:border-[#5EE3DA]/50">
            {contacts.map((c) => <option key={c.id} value={c.email} className="bg-[#070B12]">{c.name ? `${c.name} · ` : ''}{c.email}</option>)}
          </select>
        </div>
        <div className="mt-4">
          <Label htmlFor="send-msg">Message</Label>
          <Textarea id="send-msg" rows={4} value={msg} onChange={(e) => setMsg(e.target.value)} maxLength={2000} />
        </div>
        <p className="mt-2 text-[11.5px] text-white/35">Sent from hello@aurexissolution.com. Replies come to your inbox. It is logged on the timeline.</p>
        <div className="mt-5 flex gap-2">
          <Button variant="primary" onClick={send} disabled={busy}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Send</Button>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
        </div>
      </div>
    </div>
  );
}
