'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, ArrowDown, ArrowUp, Download, HelpCircle, Loader2, Plus, RotateCcw, Trash2 } from 'lucide-react';
import { Button, Card, Input, Label, Segmented, Textarea, useToast } from '@/components/admin/ui';
import { saveDocument } from '@/app/documents/(panel)/actions';
import { PRODUCTS, proposalRef, suggestClientCode, type ProductKey } from '@/lib/documents/model';
import { defaultSections, proposalIssues, type ProposalSection } from '@/lib/documents/proposal';
import { PdfPreview } from './PdfPreview';
import type { ClientOption } from './DocumentEditor';

export type ProposalState = {
  ref: string;
  date: string;
  product: ProductKey;
  title: string;
  clientName: string;
  clientId: string | null;
  price: number;
  sections: ProposalSection[];
};

const TITLES: Record<ProductKey, string> = {
  presence: 'Corporate Capability\nWebsite Proposal',
  flow: 'Workflow Automation\nProposal',
  core: 'Business System\nProposal',
  connect: 'Customer Messaging\nProposal',
  audit: 'AI Readiness Audit\nProposal',
};

const SYNTAX = `## Sub-heading
- bullet point
> highlighted line
1. Title | short description   (shows as "01 — Title")
| Column A | Column B         (table, first row is the header)
~ small print
@invest Project name | RM1,850
@sign                          (acceptance and signatures)
A blank line starts a new paragraph.`;

export function ProposalEditor({ initial, clients, existingRefs, year, docId }: { initial: ProposalState; clients: ClientOption[]; existingRefs: string[]; year: number; docId?: string }) {
  const router = useRouter();
  const toast = useToast();
  const [s, setS] = useState<ProposalState>(initial);
  const [saving, setSaving] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [refEdited, setRefEdited] = useState(Boolean(docId));
  const [showHelp, setShowHelp] = useState(false);

  const nextRef = (product: ProductKey, client: string) => {
    const code = suggestClientCode(client || 'Client');
    const prefix = proposalRef(product, code, year, 0).replace(/000$/, '');
    let max = 0;
    for (const r of existingRefs) if (r.startsWith(prefix)) max = Math.max(max, Number(r.slice(prefix.length)) || 0);
    return proposalRef(product, code, year, max + 1);
  };

  const patch = (p: Partial<ProposalState>) =>
    setS((prev) => {
      const next = { ...prev, ...p };
      if (!refEdited && ('product' in p || 'clientName' in p)) next.ref = nextRef(next.product, next.clientName);
      return next;
    });

  const pickClient = (name: string) => {
    const c = clients.find((x) => x.name.toLowerCase() === name.trim().toLowerCase());
    patch({ clientName: name, clientId: c?.id ?? null });
  };

  const setSection = (i: number, p: Partial<ProposalSection>) =>
    setS((prev) => ({ ...prev, sections: prev.sections.map((x, n) => (n === i ? { ...x, ...p } : x)) }));
  const move = (i: number, d: -1 | 1) =>
    setS((prev) => {
      const a = [...prev.sections];
      const j = i + d;
      if (j < 0 || j >= a.length) return prev;
      [a[i], a[j]] = [a[j], a[i]];
      return { ...prev, sections: a };
    });

  const reset = () => {
    if (!window.confirm('Replace every section with a fresh template for this client? Your edits will be lost.')) return;
    patch({ sections: defaultSections(s.product, s.price), title: TITLES[s.product] });
  };

  const payload = useMemo(
    () => JSON.stringify({ kind: 'proposal', data: { ref: s.ref, date: s.date, product: s.product, title: s.title, clientName: s.clientName, sections: s.sections, signature: true } }),
    [s],
  );

  const issues = useMemo(() => proposalIssues(s.sections, s.clientName), [s.sections, s.clientName]);

  const save = async () => {
    if (issues.length && !window.confirm(`This proposal still needs attention:\n\n${issues.map((m) => `• ${m}`).join('\n')}\n\nSave and download it anyway?`)) return;
    setSaving(true);
    const res = await saveDocument({ kind: 'proposal', data: JSON.parse(payload).data, clientId: s.clientId, sourceId: null, id: docId });
    setSaving(false);
    if (!res.ok) return toast('error', res.error);
    toast('ok', 'Saved. Opening the PDF.');
    window.open(`/api/documents/${res.id}/pdf`, '_blank');
    router.push('/documents/proposals');
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,560px)_minmax(0,1fr)]">
      <div className="space-y-5">
        <Card className="space-y-4 p-5">
          <div>
            <Label hint="{{client}} in the text becomes this name">Prepared for</Label>
            <Input list="prop-clients" value={s.clientName} onChange={(e) => pickClient(e.target.value)} placeholder="Company name" />
            <datalist id="prop-clients">
              {clients.map((c) => (
                <option key={c.id} value={c.name} />
              ))}
            </datalist>
          </div>
          <div>
            <Label>Product</Label>
            <Segmented
              value={s.product}
              onChange={(v) => patch({ product: v, title: TITLES[v] })}
              options={PRODUCTS.map((p) => ({ value: p.key, label: p.label }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label hint="editable">Reference</Label>
              <Input value={s.ref} onChange={(e) => { setRefEdited(true); setS((p) => ({ ...p, ref: e.target.value })); }} />
            </div>
            <div>
              <Label>Issue date</Label>
              <Input type="date" value={s.date} onChange={(e) => patch({ date: e.target.value })} />
            </div>
          </div>
          <div>
            <Label hint="a line break makes a second line">Cover title</Label>
            <Textarea rows={2} value={s.title} onChange={(e) => patch({ title: e.target.value })} />
          </div>
          <div className="flex flex-wrap items-end gap-3 border-t border-white/[0.1] pt-4">
            <div className="w-40">
              <Label hint="RM, then fill from template">Project price</Label>
              <Input type="number" min={0} step="0.01" value={s.price} onChange={(e) => patch({ price: Number(e.target.value) })} />
            </div>
            <Button onClick={reset}>
              <RotateCcw className="h-4 w-4" /> Fill sections from template
            </Button>
          </div>
        </Card>

        <div className="flex items-center justify-between">
          <h3 className="text-[13.5px] font-semibold text-white">Sections</h3>
          <Button size="sm" variant="ghost" onClick={() => setShowHelp((v) => !v)}>
            <HelpCircle className="h-4 w-4" /> How to write
          </Button>
        </div>
        {showHelp && <pre className="whitespace-pre-wrap rounded-xl border border-white/[0.1] bg-white/[0.03] p-4 font-mono text-[11.5px] leading-[1.7] text-white/70">{SYNTAX}</pre>}

        {s.sections.map((sec, i) => (
          <Card key={i} className="space-y-3 p-4">
            <div className="flex items-center gap-2">
              <Input value={sec.title} onChange={(e) => setSection(i, { title: e.target.value })} placeholder="Section heading" />
              <Button variant="ghost" size="sm" aria-label="Move up" onClick={() => move(i, -1)} disabled={i === 0}><ArrowUp className="h-4 w-4" /></Button>
              <Button variant="ghost" size="sm" aria-label="Move down" onClick={() => move(i, 1)} disabled={i === s.sections.length - 1}><ArrowDown className="h-4 w-4" /></Button>
              <Button variant="ghost" size="sm" aria-label="Delete section" onClick={() => setS((p) => ({ ...p, sections: p.sections.filter((_, n) => n !== i) }))} disabled={s.sections.length === 1}><Trash2 className="h-4 w-4" /></Button>
            </div>
            <Textarea rows={Math.min(18, Math.max(5, sec.body.split('\n').length + 1))} value={sec.body} onChange={(e) => setSection(i, { body: e.target.value })} className="font-mono text-[12.5px]" />
            <label className="flex items-center gap-2 text-[12px] text-white/50">
              <input type="checkbox" checked={sec.pageBreak} onChange={(e) => setSection(i, { pageBreak: e.target.checked })} />
              Start on a new page
            </label>
          </Card>
        ))}
        <Button onClick={() => setS((p) => ({ ...p, sections: [...p.sections, { title: '', body: '', pageBreak: true }] }))}>
          <Plus className="h-4 w-4" /> Add section
        </Button>

        {issues.length > 0 && (
          <div role="status" className="rounded-xl border border-amber-300/25 bg-amber-300/[0.06] p-4 text-[12.5px] leading-[1.6] text-amber-100/90">
            <p className="flex items-center gap-2 font-semibold text-amber-200"><AlertTriangle className="h-4 w-4" /> Before you send this</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">{issues.map((m) => <li key={m}>{m}</li>)}</ul>
          </div>
        )}

        <div className="flex items-center gap-3 pt-2">
          <Button variant="primary" onClick={save} disabled={saving || !!previewError}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            {docId ? 'Save changes & download PDF' : 'Save & download PDF'}
          </Button>
          <Button variant="ghost" onClick={() => router.push('/documents/proposals')}>Cancel</Button>
        </div>
      </div>

      <div className="xl:sticky xl:top-6 xl:self-start">
        <PdfPreview payload={payload} onError={setPreviewError} />
      </div>
    </div>
  );
}
