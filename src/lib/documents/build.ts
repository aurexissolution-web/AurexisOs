// One place that validates a document and turns it into PDF bytes plus the
// facts we store about it. Used by the preview route, the download route and
// the save action so they can never disagree.
import 'server-only';
import { amountPaid, totals } from './model';
import { parseBody, type ProposalData } from './proposal';
import { checkInvoice, checkProposal, checkReceipt } from './validate';
import { renderInvoicePdf, renderProposalPdf, renderReceiptPdf } from './render';

export type DocKindInput = 'invoice' | 'receipt' | 'proposal';

export interface Built {
  ok: true;
  data: unknown;
  number: string;
  date: string;
  title: string;
  total: number;
  filename: string;
  pdf: () => Promise<Buffer>;
}

/** First "RM1,850" style amount found in a proposal's @invest line. */
export function proposalTotal(p: ProposalData): number {
  for (const s of p.sections) {
    for (const b of parseBody(s.body)) {
      if (b.t === 'invest') {
        const n = Number(b.amount.replace(/[^\d.]/g, ''));
        if (Number.isFinite(n)) return n;
      }
    }
  }
  return 0;
}

const safe = (v: string) => v.replace(/[^\w.-]+/g, '_');

export function buildDocument(kind: string, raw: unknown): Built | { ok: false; error: string } {
  if (kind === 'invoice') {
    const c = checkInvoice(raw);
    if (!c.ok) return c;
    const d = c.data;
    return { ok: true, data: d, number: d.number, date: d.date, title: d.billTo.name, total: totals(d.items, d.taxRate).total, filename: `Invoice ${safe(d.number)}.pdf`, pdf: () => renderInvoicePdf(d) };
  }
  if (kind === 'receipt') {
    const c = checkReceipt(raw);
    if (!c.ok) return c;
    const d = c.data;
    return { ok: true, data: d, number: d.number, date: d.date, title: d.billTo.name, total: amountPaid(d.items, d.taxRate), filename: `Receipt ${safe(d.number)}.pdf`, pdf: () => renderReceiptPdf(d) };
  }
  if (kind === 'proposal') {
    const c = checkProposal(raw);
    if (!c.ok) return c;
    const d = c.data;
    return { ok: true, data: d, number: d.ref, date: d.date, title: d.clientName, total: proposalTotal(d), filename: `Proposal ${safe(d.ref)}.pdf`, pdf: () => renderProposalPdf(d) };
  }
  return { ok: false, error: 'Unknown document type.' };
}
