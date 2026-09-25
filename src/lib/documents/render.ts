// Server-only: turns validated document data into PDF bytes.
import 'server-only';
import { createElement, type ReactElement } from 'react';
import { renderToBuffer, type DocumentProps } from '@react-pdf/renderer';
import { registerFonts } from './pdf/fonts';
import { InvoiceDocument, ReceiptDocument } from './pdf/InvoicePdf';
import { ProposalDocument } from './pdf/ProposalPdf';
import type { InvoiceData, ReceiptData } from './model';
import type { ProposalData } from './proposal';

export async function renderInvoicePdf(data: InvoiceData): Promise<Buffer> {
  registerFonts();
  return renderToBuffer(createElement(InvoiceDocument, { data }) as ReactElement<DocumentProps>);
}

export async function renderReceiptPdf(data: ReceiptData): Promise<Buffer> {
  registerFonts();
  return renderToBuffer(createElement(ReceiptDocument, { data }) as ReactElement<DocumentProps>);
}

export async function renderProposalPdf(data: ProposalData): Promise<Buffer> {
  registerFonts();
  return renderToBuffer(createElement(ProposalDocument, { data }) as ReactElement<DocumentProps>);
}
