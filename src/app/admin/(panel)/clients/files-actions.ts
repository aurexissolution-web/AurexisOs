'use server';

// Client files. The browser uploads straight to private storage with a
// one-time signed token (so big files never pass through our server), then
// registers the file here. Every action re-checks admin access.
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth/admin';
import { supabaseAdmin } from '@/lib/supabase/server';
import { sendEmail } from '@/lib/email/send';
import { clientFileEmail } from '@/lib/email/templates';
import { clean, isId } from '@/lib/admin/validate';

const BUCKET = 'client-files';
const MAX_FILE_BYTES = 20 * 1024 * 1024;
const ALLOWED_MIME = new Set([
  'application/pdf', 'image/png', 'image/jpeg', 'image/webp',
  'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain', 'text/csv', 'application/zip',
]);
const KINDS = ['quote', 'invoice', 'contract', 'other'] as const;
type Kind = (typeof KINDS)[number];

export interface ClientFile {
  id: string;
  client_id: string;
  name: string;
  kind: Kind;
  size_bytes: number;
  mime_type: string;
  sent_at: string | null;
  sent_to: string;
  created_at: string;
}
const FILE_COLS = 'id,client_id,name,kind,size_bytes,mime_type,sent_at,sent_to,created_at';

type Fail = { ok: false; error: string };

export async function prepareUpload(
  clientId: string,
  f: { name: string; size: number; mime: string },
): Promise<{ ok: true; path: string; token: string } | Fail> {
  await requireAdmin();
  if (!isId(clientId)) return { ok: false, error: 'Invalid client.' };
  const name = clean(f.name, 200);
  if (!name) return { ok: false, error: 'The file has no name.' };
  if (!(f.size > 0) || f.size > MAX_FILE_BYTES) return { ok: false, error: 'Files can be up to 20 MB.' };
  if (!ALLOWED_MIME.has(f.mime)) return { ok: false, error: 'That file type isn’t allowed. Use PDF, Word, Excel, an image, CSV, text or a zip.' };
  const safe = name.replace(/[^\w.\- ]+/g, '_').slice(-120);
  const path = `${clientId}/${crypto.randomUUID()}-${safe}`;
  const { data, error } = await supabaseAdmin.storage.from(BUCKET).createSignedUploadUrl(path);
  if (error || !data) return { ok: false, error: error?.message ?? 'Could not start the upload.' };
  return { ok: true, path, token: data.token };
}

export async function registerFile(
  clientId: string,
  f: { path: string; name: string; kind: Kind; size: number; mime: string },
): Promise<{ ok: true; file: ClientFile } | Fail> {
  const admin = await requireAdmin();
  if (!isId(clientId)) return { ok: false, error: 'Invalid client.' };
  if (!f.path.startsWith(`${clientId}/`) || f.path.includes('..')) return { ok: false, error: 'Invalid file path.' };
  if (!KINDS.includes(f.kind)) return { ok: false, error: 'Pick a file type.' };
  // The object must really exist: never trust the browser's word that it uploaded.
  const folder = clientId;
  const base = f.path.slice(folder.length + 1);
  const { data: listed } = await supabaseAdmin.storage.from(BUCKET).list(folder, { search: base.slice(0, 36) });
  const found = listed?.find((o) => o.name === base);
  if (!found) return { ok: false, error: 'The upload did not finish. Try again.' };

  const name = clean(f.name, 200) || base;
  const { data, error } = await supabaseAdmin
    .from('client_files')
    .insert({
      client_id: clientId, name, kind: f.kind, storage_path: f.path,
      size_bytes: Number(found.metadata?.size ?? f.size) || f.size,
      mime_type: clean(f.mime, 120), uploaded_by: admin.id,
    })
    .select(FILE_COLS)
    .single();
  if (error || !data) return { ok: false, error: error?.message ?? 'Could not save the file.' };
  await supabaseAdmin.from('client_activity').insert({
    client_id: clientId, kind: 'file', title: `${f.kind[0].toUpperCase()}${f.kind.slice(1)} added: ${name}`, actor_id: admin.id,
  });
  revalidatePath('/admin/clients');
  return { ok: true, file: data as ClientFile };
}

async function ownFile(id: string) {
  const { data } = await supabaseAdmin.from('client_files').select(`${FILE_COLS},storage_path`).eq('id', id).single();
  return data as (ClientFile & { storage_path: string }) | null;
}

export async function getFileUrl(id: string): Promise<{ ok: true; url: string } | Fail> {
  await requireAdmin();
  if (!isId(id)) return { ok: false, error: 'Invalid file.' };
  const f = await ownFile(id);
  if (!f) return { ok: false, error: 'That file no longer exists.' };
  const { data, error } = await supabaseAdmin.storage.from(BUCKET).createSignedUrl(f.storage_path, 60, { download: f.name });
  if (error || !data) return { ok: false, error: error?.message ?? 'Could not open the file.' };
  return { ok: true, url: data.signedUrl };
}

export async function deleteFile(id: string): Promise<{ ok: true } | Fail> {
  await requireAdmin();
  if (!isId(id)) return { ok: false, error: 'Invalid file.' };
  const f = await ownFile(id);
  if (!f) return { ok: true };
  await supabaseAdmin.storage.from(BUCKET).remove([f.storage_path]);
  const { error } = await supabaseAdmin.from('client_files').delete().eq('id', id);
  if (error) return { ok: false, error: error.message };
  revalidatePath('/admin/clients');
  return { ok: true };
}

export async function emailFileToClient(
  id: string,
  o: { to: string; recipientName: string; message: string },
): Promise<{ ok: true; file: ClientFile } | Fail> {
  const admin = await requireAdmin();
  if (!isId(id)) return { ok: false, error: 'Invalid file.' };
  const to = clean(o.to, 200).toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(to)) return { ok: false, error: 'Pick a valid email address.' };
  const f = await ownFile(id);
  if (!f) return { ok: false, error: 'That file no longer exists.' };
  // Only ever send to an address that belongs to this client.
  const { data: owns } = await supabaseAdmin.from('client_contacts').select('id').eq('client_id', f.client_id).eq('email_key', to).limit(1);
  if (!owns?.length) return { ok: false, error: 'That email isn’t one of this client’s contacts.' };

  const { data: blob, error: dlError } = await supabaseAdmin.storage.from(BUCKET).download(f.storage_path);
  if (dlError || !blob) return { ok: false, error: 'Could not read the file.' };
  const content = Buffer.from(await blob.arrayBuffer()).toString('base64');

  const email = clientFileEmail({ name: clean(o.recipientName, 160), message: clean(o.message, 2000), fileName: f.name, senderName: admin.name });
  const res = await sendEmail(to, email, undefined, [{ filename: f.name, content, contentType: f.mime_type || 'application/octet-stream' }]);
  if (!res.ok) return { ok: false, error: 'The email could not be sent. Check the Resend settings.' };

  const now = new Date().toISOString();
  const { data, error } = await supabaseAdmin.from('client_files').update({ sent_at: now, sent_to: to }).eq('id', id).select(FILE_COLS).single();
  if (error || !data) return { ok: false, error: error?.message ?? 'Sent, but could not record it.' };
  await supabaseAdmin.from('client_activity').insert({
    client_id: f.client_id, kind: 'email_sent', title: `Sent ${f.name}`, body: `Emailed to ${to}`, actor_id: admin.id, ref: res.id ? `email:${res.id}` : null,
  });
  await supabaseAdmin.from('clients').update({ last_contact_at: now, updated_at: now }).eq('id', f.client_id);
  revalidatePath('/admin/clients');
  return { ok: true, file: data as ClientFile };
}

export async function setFileKind(id: string, kind: Kind): Promise<{ ok: true } | Fail> {
  await requireAdmin();
  if (!isId(id) || !KINDS.includes(kind)) return { ok: false, error: 'Invalid input.' };
  const { error } = await supabaseAdmin.from('client_files').update({ kind }).eq('id', id);
  return error ? { ok: false, error: error.message } : { ok: true };
}
