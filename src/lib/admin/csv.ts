// src/lib/admin/csv.ts
// Small CSV reader and the mapping from a spreadsheet to client rows. No
// imports so node:test can load it. Handles quotes, escaped quotes, newlines
// inside cells, CRLF, a BOM, and comma / semicolon / tab separators.

export function parseCsv(input: string): string[][] {
  const text = input.replace(/^﻿/, '');
  const first = text.split(/\r?\n/, 1)[0] ?? '';
  const delim = [',', ';', '\t'].reduce(
    (best, d) => ((first.split(d).length > first.split(best).length) ? d : best),
    ',',
  );
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"') {
        if (text[i + 1] === '"') { cell += '"'; i++; } else quoted = false;
      } else cell += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === delim) { row.push(cell); cell = ''; }
    else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      row.push(cell); cell = '';
      if (row.some((c) => c.trim() !== '')) rows.push(row);
      row = [];
    } else cell += ch;
  }
  row.push(cell);
  if (row.some((c) => c.trim() !== '')) rows.push(row);
  return rows;
}

export interface ImportData {
  name: string;
  company: string;
  email: string;
  phone: string;
  status: 'lead' | 'active' | 'past' | 'lost';
  tags: string[];
  industry: string;
  notes: string;
}
export interface ImportItem {
  line: number;
  data: ImportData;
  problem: string | null;
}

const ALIASES: Record<keyof ImportData, string[]> = {
  name: ['name', 'client', 'client name', 'business name', 'business', 'customer', 'full name', 'contact name'],
  company: ['company', 'company name', 'organisation', 'organization'],
  email: ['email', 'email address', 'e-mail'],
  phone: ['phone', 'mobile', 'whatsapp', 'tel', 'telephone', 'phone number', 'contact number', 'handphone', 'hp'],
  status: ['status', 'stage', 'type'],
  tags: ['tags', 'tag', 'labels', 'category'],
  industry: ['industry', 'sector'],
  notes: ['notes', 'note', 'remarks', 'comments', 'description'],
};

const STATUS_WORDS: Record<string, ImportData['status']> = {
  lead: 'lead', prospect: 'lead', new: 'lead', enquiry: 'lead', inquiry: 'lead',
  active: 'active', client: 'active', customer: 'active', current: 'active', won: 'active', live: 'active',
  past: 'past', former: 'past', inactive: 'past', churned: 'past', completed: 'past', old: 'past',
  lost: 'lost', declined: 'lost', rejected: 'lost', dead: 'lost',
};

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export function mapClientRows(rows: string[][]): { items: ImportItem[]; missing: string[] } {
  if (!rows.length) return { items: [], missing: ['name'] };
  const header = rows[0].map((h) => h.trim().toLowerCase());
  const col = {} as Record<keyof ImportData, number>;
  for (const key of Object.keys(ALIASES) as (keyof ImportData)[]) {
    col[key] = header.findIndex((h) => ALIASES[key].includes(h));
  }
  if (col.name === -1) return { items: [], missing: ['name'] };

  const get = (r: string[], k: keyof ImportData) => (col[k] >= 0 ? (r[col[k]] ?? '').trim() : '');
  const items = rows.slice(1).map((r, i): ImportItem => {
    const email = get(r, 'email').toLowerCase();
    const data: ImportData = {
      name: get(r, 'name'),
      company: get(r, 'company'),
      email,
      phone: get(r, 'phone'),
      status: STATUS_WORDS[get(r, 'status').toLowerCase()] ?? 'lead',
      tags: get(r, 'tags').split(/[;,|]/).map((t) => t.trim().toLowerCase()).filter(Boolean),
      industry: get(r, 'industry'),
      notes: get(r, 'notes'),
    };
    let problem: string | null = null;
    if (!data.name) problem = 'Missing name';
    else if (email && !EMAIL_RE.test(email)) problem = 'Email looks wrong';
    return { line: i + 2, data, problem };
  });
  return { items, missing: [] };
}
