/* eslint-disable jsx-a11y/alt-text -- react-pdf's Image is a PDF primitive, not an <img> */
// src/lib/documents/pdf/InvoicePdf.tsx
// Invoice and Official Receipt: a faithful rebuild of the Aurexis Canva templates
// (A4, absolute layout measured from the originals). One component, two variants.
import path from 'node:path';
import { Document, Image, Page, Path, Svg, Text, View } from '@react-pdf/renderer';
import type { InvoiceData, ReceiptData } from '../model';
import { amountPaid, formatDocDate, formatRMDoc, lineTotal, totals } from '../model';
import { ICON_PHONE, ICON_PIN, WAVE } from './wave';

const W = 595.5;
const H = 842.25;
const INK = '#3D3B3A';
const asset = (f: string) => path.join(process.cwd(), 'src', 'assets', 'pdf', f);

const COMPANY = {
  ssm: '(NS0315281-P)',
  signer: 'SANJAY GUNABALAN',
  role: 'CEO & FOUNDER',
  phone: '+60 16 407 1129',
  address: ['NO.3, JALAN BUKIT PUTERI 1/17,', 'BANDAR PUTERI JAYA,', '08000 SUNGAI PETANI,', 'KEDAH'],
};

type Font = 'OpenSans' | 'DMSans' | 'Helvetica';
interface TProps {
  x: number;
  y: number;
  size: number;
  children: string | (string | React.ReactElement)[];
  bold?: boolean;
  italic?: boolean;
  font?: Font;
  align?: 'left' | 'right' | 'center';
  /** For right/center: the edge or centre to align to. */
  w?: number;
  color?: string;
  ls?: number;
}

// Absolutely positioned line of text. `y` is the top of the line box, as measured
// from the original PDF; `ls` defaults to the templates' 0.09em tracking.
function T({ x, y, size, children, bold, italic, font = 'OpenSans', align = 'left', w, color = INK, ls }: TProps) {
  const family = font === 'Helvetica' ? (bold ? 'Helvetica-Bold' : 'Helvetica') : font;
  const left = align === 'left' ? x : align === 'right' ? x - (w ?? 300) : x - (w ?? 300) / 2;
  return (
    <Text
      style={{
        position: 'absolute',
        left,
        top: y,
        ...(align !== 'left' ? { width: w ?? 300, textAlign: align } : {}),
        fontFamily: family,
        fontSize: size,
        fontWeight: font === 'Helvetica' ? undefined : bold ? 700 : 400,
        fontStyle: italic ? 'italic' : 'normal',
        letterSpacing: ls ?? size * (bold ? 0.09 : font === 'DMSans' ? 0.092 : 0.097),
        color,
        lineHeight: 1.362,
      }}
    >
      {children}
    </Text>
  );
}

const lines = (s: string) => s.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

/** "**bold** and plain" -> react-pdf inline runs. */
function rich(text: string, size: number) {
  return text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean).map((part, i) =>
    part.startsWith('**') ? (
      <Text key={i} style={{ fontWeight: 700, fontFamily: 'OpenSans', fontSize: size }}>
        {part.slice(2, -2)}
      </Text>
    ) : (
      part
    ),
  );
}

type Common = {
  variant: 'invoice' | 'receipt';
  number: string;
  date: string;
  billTo: { name: string; address: string; phone: string };
  items: { description: string; note: string; price: number; qty: number; paid?: boolean }[];
  taxRate: number;
  signature: boolean;
};

function Sheet(props: Common & { data: InvoiceData | ReceiptData }) {
  const { variant, number, date, billTo, items, taxRate, signature } = props;
  const isReceipt = variant === 'receipt';
  const t = totals(items.map((i) => ({ ...i, dueNow: false })), taxRate);

  // Vertical layout of the table: two rows fit the template exactly; more rows
  // tighten the pitch and push the totals down within the free space.
  const pitchOf = (i: { note: string }) => (i.note ? 34.5 : 27);
  const need = items.reduce((s, i) => s + pitchOf(i), 0);
  const base = 69; // two rows in the template
  const maxExtra = 24;
  const scale = need - base > maxExtra ? (base + maxExtra) / need : 1;
  const shift = Math.max(0, need * scale - base);

  const rowY: number[] = [];
  let cursor = 428.2;
  for (const it of items) {
    rowY.push(cursor);
    cursor += pitchOf(it) * scale;
  }
  const line2 = 489.5 + shift;

  const accent = isReceipt ? '#406222' : INK;
  const heroLabel = isReceipt ? 'AMOUNT PAID:' : 'TOTAL DUE:';
  const heroValue = isReceipt
    ? amountPaid(items.map((i) => ({ ...i, dueNow: false, paid: Boolean(i.paid) })), taxRate)
    : (props.data as InvoiceData).items.length
      ? totals((props.data as InvoiceData).items, taxRate).due
      : 0;

  const addressLines = [billTo.name, ...lines(billTo.address), ...(billTo.phone ? [`H/P: ${billTo.phone}`] : [])];

  return (
    <Page size={{ width: W, height: H }} style={{ backgroundColor: '#FFFFFF' }}>
      {/* Wave */}
      <Svg viewBox={`0 0 ${W} ${H}`} style={{ position: 'absolute', left: 0, top: 0, width: W, height: H }}>
        {WAVE.map((p, i) => (
          <Path key={i} d={p.d} fill={p.fill} />
        ))}
      </Svg>

      {/* Header */}
      <Image src={asset('logo-dark.png')} style={{ position: 'absolute', left: 380, top: 34.1, width: 176.2, height: 58.5 }} />
      <T x={549.1} y={85.2} size={6.5} font="Helvetica" bold align="right" w={100} ls={1.9}>{COMPANY.ssm}</T>
      <T x={69.3} y={isReceipt ? 107 : 106.3} size={isReceipt ? 29 : 43} bold ls={isReceipt ? 2.73 : undefined}>{isReceipt ? 'OFFICIAL RECEIPT' : 'INVOICE'}</T>

      {/* Bill to */}
      <T x={69.5} y={185.7} size={12} bold>{isReceipt ? 'RECEIPT TO:' : 'ISSUED TO:'}</T>
      {addressLines.slice(0, 6).map((l, i) => (
        <T key={i} x={69.3} y={201.5 + i * 16.5} size={12}>{l}</T>
      ))}

      {/* Hero amount */}
      <View style={{ position: 'absolute', left: 417.4, top: 204, width: 3.75, height: 55.3, backgroundColor: accent }} />
      <T x={437.2} y={211.5} size={16} bold>{heroLabel}</T>
      <T x={437.2} y={230.2} size={16} bold>{formatRMDoc(heroValue)}</T>

      {/* Number and date */}
      <T x={463.1} y={310} size={11} bold align="right" w={120}>{isReceipt ? 'RECEIPT NO:' : 'INVOICE NO:'}</T>
      <T x={536} y={310} size={11} align="right" w={120}>{number}</T>
      <T x={463.1} y={325.4} size={11} bold align="right" w={120}>DATE:</T>
      <T x={536} y={325.4} size={11} align="right" w={120}>{formatDocDate(date)}</T>

      {/* Table */}
      <T x={77.4} y={391.9} size={10} bold>DESCRIPTION</T>
      <T x={325.2} y={391.9} size={10} bold align="center" w={100}>PRICE (RM)</T>
      <T x={416.4} y={391.9} size={10} bold align="center" w={60}>QTY</T>
      <T x={519.2} y={391.9} size={10} bold align="right" w={80}>TOTAL</T>
      <View style={{ position: 'absolute', left: 69.6, top: 414.5, width: 455.8, height: 0.75, backgroundColor: INK }} />

      {items.map((it, i) => (
        <View key={i}>
          <T x={78} y={rowY[i]} size={10} font="DMSans">{it.description}</T>
          {it.note ? <T x={78} y={rowY[i] + 11.3} size={10} font="DMSans">{it.note}</T> : null}
          <T x={325.2} y={rowY[i]} size={10} font="DMSans" align="center" w={100}>{String(it.price.toLocaleString('en-MY'))}</T>
          <T x={416.4} y={rowY[i]} size={10} font="DMSans" align="center" w={60}>{String(it.qty)}</T>
          {isReceipt && it.paid ? (
            <T x={474.9} y={rowY[i]} size={10} bold font="DMSans">PAID</T>
          ) : (
            <T x={514.5} y={rowY[i]} size={10} font="DMSans" align="right" w={80}>{formatRMDoc(lineTotal(it))}</T>
          )}
        </View>
      ))}

      <View style={{ position: 'absolute', left: 69.8, top: line2, width: 455.7, height: 0.75, backgroundColor: INK }} />
      <T x={79.1} y={495.1 + shift} size={10} bold>SUBTOTAL:</T>
      <T x={516} y={495.1 + shift} size={10} bold align="right" w={80}>{formatRMDoc(t.subtotal)}</T>
      <T x={141.5} y={515 + shift} size={10} bold align="right" w={80}>TAX:</T>
      <T x={80.2} y={527.7 + shift} size={7.6} font="DMSans">(if applicable)</T>
      <T x={516} y={514.4 + shift} size={10} bold align="right" w={80}>{formatRMDoc(t.tax)}</T>
      <T x={458.7} y={533.9 + shift} size={10} bold align="right" w={80}>TOTAL:</T>
      <T x={516} y={533.9 + shift} size={10} bold align="right" w={80}>{formatRMDoc(t.total)}</T>

      {/* Left-bottom block */}
      {!isReceipt ? (
        <>
          <T x={77.6} y={586.3 + shift} size={10} bold>PAYMENT INFO:</T>
          <T x={77.4} y={602.5 + shift} size={10} bold italic>{(props.data as InvoiceData).bank.bank}</T>
          <T x={77.4} y={616 + shift} size={10} bold italic>{`Account Name: ${(props.data as InvoiceData).bank.accountName}`}</T>
          <T x={77.4} y={629.5 + shift} size={10} bold italic>{`Account No : ${(props.data as InvoiceData).bank.accountNo}`}</T>
          <T x={77.4} y={671.3} size={10} bold>PAYMENT SCHEDULE:</T>
          <View style={{ position: 'absolute', left: 77.4, top: 682.5, width: 225 }}>
            {lines((props.data as InvoiceData).schedule).map((l, i) => (
              <Text key={i} style={{ fontFamily: 'OpenSans', fontSize: 10, letterSpacing: 0.97, color: INK, lineHeight: 1.135, marginBottom: 11.2 }}>
                {`• ${l}`}
              </Text>
            ))}
          </View>
        </>
      ) : (
        <>
          <T x={77.6} y={586} size={13} bold>PAYMENT RECEIVED VIA</T>
          <T x={77.6} y={601.1} size={13} bold>{(props.data as ReceiptData).method.toUpperCase()}</T>
          {(props.data as ReceiptData).reference ? (
            <T x={77.6} y={615.9} size={11}>{`Reference ID:${(props.data as ReceiptData).reference}`}</T>
          ) : null}
          {(props.data as ReceiptData).remarks.trim() ? (
            <>
              <T x={79.1} y={659} size={10} bold>REMARKS:</T>
              <View style={{ position: 'absolute', left: 79.1, top: 670.3, width: 218 }}>
                <Text style={{ fontFamily: 'OpenSans', fontSize: 10, letterSpacing: 0.97, color: INK, lineHeight: 1.125 }}>
                  {rich((props.data as ReceiptData).remarks, 10)}
                </Text>
              </View>
            </>
          ) : null}
        </>
      )}

      {/* Signature and contact block */}
      {signature ? (
        <Image src={asset('signature-ink.png')} style={{ position: 'absolute', left: 399.2, top: 596.1, width: 121.4, height: 81.7 }} />
      ) : null}
      <View style={{ position: 'absolute', left: 403.8, top: 672, width: 111.8, height: 0.75, backgroundColor: INK }} />
      <T x={461.5} y={679.7} size={10} bold align="center" w={160}>{COMPANY.signer}</T>
      <T x={462.4} y={693.7} size={9.6} font="Helvetica" align="center" w={160} ls={0.35}>{COMPANY.role}</T>
      <Svg viewBox={`0 0 ${W} ${H}`} style={{ position: 'absolute', left: 0, top: 0, width: W, height: H }}>
        <Path d={ICON_PHONE} fill="#000000" />
        <Path d={ICON_PIN} fill="#000000" />
      </Svg>
      <T x={423.7} y={724.9} size={8} font="OpenSans">{COMPANY.phone}</T>
      {COMPANY.address.map((l, i) => (
        <T key={i} x={422.7} y={744.5 + i * 9.33} size={8}>{l}</T>
      ))}
    </Page>
  );
}

export function InvoiceDocument({ data }: { data: InvoiceData }) {
  return (
    <Document title={`Invoice ${data.number}`} author="Aurexis Solution">
      <Sheet variant="invoice" number={data.number} date={data.date} billTo={data.billTo} items={data.items} taxRate={data.taxRate} signature={data.signature} data={data} />
    </Document>
  );
}

export function ReceiptDocument({ data }: { data: ReceiptData }) {
  return (
    <Document title={`Receipt ${data.number}`} author="Aurexis Solution">
      <Sheet variant="receipt" number={data.number} date={data.date} billTo={data.billTo} items={data.items} taxRate={data.taxRate} signature={data.signature} data={data} />
    </Document>
  );
}
