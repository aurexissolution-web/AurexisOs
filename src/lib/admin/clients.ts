// src/lib/admin/clients.ts
// Pure client-database logic: types, name sorting for the A-Z list, phone and
// email matching, follow-up state. No imports, so node:test can load it.
// normalizePhone MUST stay in step with norm_phone() in migration 034.

export type ClientStatus = 'lead' | 'active' | 'past' | 'lost';
export type ClientKind = 'business' | 'individual';
export type ActivityKind =
  | 'enquiry'
  | 'email_sent'
  | 'meeting'
  | 'call'
  | 'whatsapp'
  | 'note'
  | 'file'
  | 'status_change'
  | 'invoice'
  | 'service';

export const CLIENT_STATUSES: { key: ClientStatus; label: string; color: string }[] = [
  { key: 'lead', label: 'Lead', color: '#8FA8F0' },
  { key: 'active', label: 'Active', color: '#7FE8C4' },
  { key: 'past', label: 'Past', color: '#9CA3AF' },
  { key: 'lost', label: 'Lost', color: '#F08F8F' },
];
export const STATUS_BY_KEY = Object.fromEntries(CLIENT_STATUSES.map((s) => [s.key, s])) as Record<
  ClientStatus,
  (typeof CLIENT_STATUSES)[number]
>;

/** Kinds a person can log by hand; the rest are written by the system. */
export const MANUAL_KINDS: { key: ActivityKind; label: string }[] = [
  { key: 'note', label: 'Note' },
  { key: 'call', label: 'Call' },
  { key: 'whatsapp', label: 'WhatsApp' },
  { key: 'email_sent', label: 'Email' },
  { key: 'meeting', label: 'Meeting' },
];
export const MANUAL_KEYS = MANUAL_KINDS.map((k) => k.key);

export interface Client {
  id: string;
  name: string;
  company: string;
  kind: ClientKind;
  status: ClientStatus;
  owner_id: string | null;
  industry: string;
  source: string;
  website: string;
  address: string;
  tags: string[];
  notes: string;
  first_contact_at: string | null;
  last_contact_at: string | null;
  next_followup_at: string | null;
  next_followup_note: string;
  created_at: string;
  updated_at: string;
}

export interface ClientContact {
  id: string;
  client_id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  is_primary: boolean;
}

export interface ClientActivity {
  id: string;
  client_id: string;
  kind: ActivityKind;
  title: string;
  body: string;
  occurred_at: string;
  actor_id: string | null;
  ref: string | null;
}

// ── Matching ─────────────────────────────────────────────────────────────────

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export function normalizeEmail(v: string | null | undefined): string | null {
  const e = (v ?? '').trim().toLowerCase();
  return EMAIL_RE.test(e) ? e : null;
}

/** 012-345 6789 / +60 12 345 6789 / 0060123456789 -> 60123456789 */
export function normalizePhone(v: string | null | undefined): string | null {
  const d = (v ?? '').replace(/\D/g, '');
  if (!d) return null;
  if (d.startsWith('00')) return d.slice(2);
  if (d.startsWith('0')) return `6${d}`;
  return d;
}

export interface MatchContact {
  client_id: string;
  email_key: string | null;
  phone_key: string | null;
}

export interface Match {
  clientId: string;
  by: 'email' | 'phone';
  /** Email and phone point at two different clients: worth a human look. */
  ambiguous: boolean;
}

export function matchClient(
  contacts: MatchContact[],
  who: { email?: string | null; phone?: string | null },
): Match | null {
  const email = normalizeEmail(who.email);
  const phone = normalizePhone(who.phone);
  const byEmail = email ? contacts.find((c) => c.email_key === email) : undefined;
  const byPhone = phone ? contacts.find((c) => c.phone_key === phone) : undefined;
  if (byEmail) {
    return {
      clientId: byEmail.client_id,
      by: 'email',
      ambiguous: Boolean(byPhone && byPhone.client_id !== byEmail.client_id),
    };
  }
  if (byPhone) return { clientId: byPhone.client_id, by: 'phone', ambiguous: false };
  return null;
}

// ── A-Z list ─────────────────────────────────────────────────────────────────

/** First letter A-Z (accents folded); anything else groups under '#'. */
export function letterOf(name: string): string {
  const folded = (name ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '');
  const m = /[A-Za-z]/.exec(folded.replace(/^[^A-Za-z0-9]+/, ''));
  const first = folded.replace(/^[^A-Za-z0-9]+/, '')[0];
  return first && m && m.index === 0 ? first.toUpperCase() : '#';
}

const collator = new Intl.Collator('en', { sensitivity: 'base', numeric: true });

export function groupByLetter<T extends { name: string }>(
  items: T[],
): { letter: string; items: T[] }[] {
  const map = new Map<string, T[]>();
  for (const it of [...items].sort((a, b) => collator.compare(a.name, b.name))) {
    const l = letterOf(it.name);
    map.set(l, [...(map.get(l) ?? []), it]);
  }
  return [...map.entries()]
    .sort(([a], [b]) => (a === '#' ? 1 : b === '#' ? -1 : a.localeCompare(b)))
    .map(([letter, list]) => ({ letter, items: list }));
}

export type SortKey = 'name' | 'recent' | 'newest';

export function sortClients<
  T extends { name: string; last_contact_at: string | null; created_at: string },
>(items: T[], key: SortKey): T[] {
  const t = (v: string | null) => (v ? new Date(v).getTime() : 0);
  return [...items].sort((a, b) =>
    key === 'name'
      ? collator.compare(a.name, b.name)
      : key === 'recent'
        ? t(b.last_contact_at) - t(a.last_contact_at) || collator.compare(a.name, b.name)
        : t(b.created_at) - t(a.created_at),
  );
}

// ── Follow-ups ───────────────────────────────────────────────────────────────

const MYT_MS = 8 * 3_600_000;
const dayIndex = (ms: number) => Math.floor((ms + MYT_MS) / 86_400_000);

export type FollowUpState = 'none' | 'upcoming' | 'today' | 'overdue';

/** Compared by Malaysia calendar day, so "today" means today for the team. */
export function followUpState(iso: string | null, nowMs: number): FollowUpState {
  if (!iso) return 'none';
  const d = dayIndex(new Date(iso).getTime());
  const n = dayIndex(nowMs);
  return d < n ? 'overdue' : d === n ? 'today' : 'upcoming';
}
