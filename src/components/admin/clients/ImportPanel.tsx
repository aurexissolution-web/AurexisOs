'use client';

import Link from 'next/link';
import { useRef, useState, useTransition } from 'react';
import { CheckCircle2, FileSpreadsheet, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { mapClientRows, parseCsv, type ImportItem } from '@/lib/admin/csv';
import { Button, Card, Pill, Textarea, useToast } from '../ui';
import { previewImport, runImport, type ImportVerdict } from '@/app/admin/(panel)/clients/data-actions';

const SAMPLE = 'Name,Company,Email,Phone,Status,Tags,Industry,Notes\nAisyah Rahman,Aisyah Dental Clinic,aisyah@clinic.my,012-345 6789,client,care-plan,Healthcare,Referred by Dr Lim\nFarah Aziz,Farah Bakery,farah@bakery.my,019-888 7777,lead,,Food,\n';

export function ImportPanel() {
  const toast = useToast();
  const file = useRef<HTMLInputElement>(null);
  const [text, setText] = useState('');
  const [items, setItems] = useState<ImportItem[]>([]);
  const [verdicts, setVerdicts] = useState<ImportVerdict[]>([]);
  const [problem, setProblem] = useState<string | null>(null);
  const [done, setDone] = useState<{ created: number; skipped: number } | null>(null);
  const [pending, start] = useTransition();

  const analyse = (csv: string) => {
    setDone(null); setProblem(null); setVerdicts([]);
    const { items: rows, missing } = mapClientRows(parseCsv(csv));
    if (missing.length) { setItems([]); return setProblem('I couldn’t find a "Name" column. The first row must be headings, e.g. Name, Email, Phone.'); }
    if (!rows.length) { setItems([]); return setProblem('No rows found under the headings.'); }
    setItems(rows);
    start(async () => {
      const r = await previewImport(rows.map((i) => i.data));
      if (!r.ok) return setProblem(r.error);
      setVerdicts(r.verdicts);
    });
  };

  const verdict = (i: number): ImportVerdict | undefined => verdicts[i];
  const counts = { new: 0, duplicate: 0, invalid: 0, repeat: 0 };
  items.forEach((it, i) => {
    const v = verdict(i);
    if (it.problem || v?.state === 'invalid') counts.invalid++;
    else if (v?.state === 'duplicate') counts.duplicate++;
    else if (v?.state === 'repeat-in-file') counts.repeat++;
    else if (v?.state === 'new') counts.new++;
  });

  const go = () => start(async () => {
    const r = await runImport(items.filter((it) => !it.problem).map((it) => it.data));
    if (!r.ok) return toast('error', r.error);
    setDone({ created: r.created, skipped: r.skipped });
    toast('ok', `${r.created} clients imported`);
  });

  return (
    <div className="space-y-5">
      <Card className="bg-[#070A10]/80 p-5">
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="secondary" onClick={() => file.current?.click()}><FileSpreadsheet className="h-4 w-4" /> Choose a CSV file</Button>
          <a download="clients-sample.csv" href={`data:text/csv;charset=utf-8,${encodeURIComponent(SAMPLE)}`} className="text-[12.5px] text-[#5EE3DA] hover:underline">Download a sample</a>
          <input ref={file} type="file" accept=".csv,text/csv,text/plain" hidden onChange={async (e) => { const f = e.target.files?.[0]; if (f) { const t = await f.text(); setText(t); analyse(t); } }} />
        </div>
        <p className="mt-3 text-[12.5px] leading-[1.6] text-white/45">
          Export your spreadsheet as CSV. The first row is the headings: <b className="text-white/70">Name</b> is required; Company, Email, Phone, Status (lead / client / past / lost), Tags, Industry and Notes are optional. Anyone already in your client list (same email or phone) is skipped.
        </p>
        <Textarea rows={4} value={text} onChange={(e) => setText(e.target.value)} placeholder="…or paste the CSV text here" className="mt-3 font-mono text-[12px]" aria-label="CSV text" />
        <Button className="mt-3" variant="secondary" size="sm" disabled={!text.trim() || pending} onClick={() => analyse(text)}>Check this text</Button>
      </Card>

      {problem && <p role="alert" className="rounded-xl border border-red-400/25 bg-red-400/[0.07] px-4 py-3 text-[13px] text-red-300">{problem}</p>}

      {items.length > 0 && !done && (
        <Card className="overflow-hidden bg-[#070A10]/80">
          <div className="flex flex-wrap items-center gap-2 border-b border-white/[0.12] px-5 py-3.5">
            {pending && verdicts.length === 0 ? <span className="flex items-center gap-2 text-[13px] text-white/55"><Loader2 className="h-4 w-4 animate-spin" /> Checking for duplicates…</span> : (
              <>
                <Pill color="#7FE8C4">{counts.new} new</Pill>
                {counts.duplicate > 0 && <Pill color="#F0C88F">{counts.duplicate} already clients</Pill>}
                {counts.repeat > 0 && <Pill color="#F0C88F">{counts.repeat} repeated in file</Pill>}
                {counts.invalid > 0 && <Pill color="#F08F8F">{counts.invalid} with problems</Pill>}
              </>
            )}
            <Button className="ml-auto" variant="primary" size="sm" disabled={pending || counts.new === 0} onClick={go}>Import {counts.new} clients</Button>
          </div>
          <div className="max-h-[420px] overflow-auto" data-lenis-prevent>
            <table className="w-full min-w-[640px] text-left text-[12.5px]">
              <thead className="sticky top-0 bg-[#0A0E15] font-mono text-[10px] uppercase tracking-[0.16em] text-white/40">
                <tr><th className="px-4 py-2">Row</th><th className="px-4 py-2">Name</th><th className="px-4 py-2">Email</th><th className="px-4 py-2">Phone</th><th className="px-4 py-2">Status</th><th className="px-4 py-2">Result</th></tr>
              </thead>
              <tbody>
                {items.slice(0, 200).map((it, i) => {
                  const v = verdict(i);
                  const bad = it.problem || v?.state === 'invalid';
                  return (
                    <tr key={it.line} className="border-t border-white/[0.08]">
                      <td className="px-4 py-2 font-mono text-white/35">{it.line}</td>
                      <td className="px-4 py-2 text-white">{it.data.name || '—'}</td>
                      <td className="px-4 py-2 text-white/65">{it.data.email}</td>
                      <td className="px-4 py-2 text-white/65">{it.data.phone}</td>
                      <td className="px-4 py-2 text-white/65">{it.data.status}</td>
                      <td className={cn('px-4 py-2', bad ? 'text-red-300' : v?.state === 'new' ? 'text-[#7FE8C4]' : 'text-[#F0C88F]')}>
                        {it.problem ?? (v ? (v.state === 'new' ? 'Will be added' : v.state === 'duplicate' ? `Already: ${v.clientName}` : v.state === 'repeat-in-file' ? 'Repeated in this file' : v.reason) : '…')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {items.length > 200 && <p className="border-t border-white/[0.08] px-5 py-2.5 text-[11.5px] text-white/35">Showing the first 200 of {items.length} rows. All rows are imported.</p>}
        </Card>
      )}

      {done && (
        <Card className="bg-[#070A10]/80 p-8 text-center">
          <CheckCircle2 className="mx-auto h-10 w-10 text-[#7FE8C4]" />
          <p className="mt-3 text-[18px] font-semibold text-white">{done.created} clients imported</p>
          <p className="mt-1 text-[13px] text-white/50">{done.skipped > 0 ? `${done.skipped} skipped (duplicates or problems).` : 'Nothing was skipped.'}</p>
          <Link href="/admin/clients" className="mt-5 inline-flex h-10 items-center rounded-xl bg-[#5EE3DA] px-5 text-[13px] font-semibold text-[#02040A]">View clients</Link>
        </Card>
      )}
    </div>
  );
}
