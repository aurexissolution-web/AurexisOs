/* eslint-disable jsx-a11y/alt-text -- react-pdf's Image is a PDF primitive, not an <img> */
// Proposal: dark Aurexis theme. A cover page, then flowing content pages with a
// fixed logo, footer pill, page number and reference line on every page. Content
// wraps automatically and always stays clear of the footer.
import path from 'node:path';
import { Document, Image, Page, Path, Svg, Text, View } from '@react-pdf/renderer';
import { PRODUCTS, formatMonthYear } from '../model';
import { parseBody, twoDigits, type Block, type ProposalData } from '../proposal';

const W = 595.5;
const H = 842.25;
const BG = '#2B292B';
const TEAL = '#08C7C8';
const PILL = '#3D3D3F';
const MUTED = '#B9B5B2';
const asset = (f: string) => path.join(process.cwd(), 'src', 'assets', 'pdf', f);

const body = { fontFamily: 'Montserrat', fontSize: 12, lineHeight: 1.38, color: '#FFFFFF' } as const;

function Furniture({ data }: { data: ProposalData }) {
  return (
    <>
      <View fixed style={{ position: 'absolute', left: 17.5, top: 734, width: 563, height: 56.8, borderRadius: 28.4, backgroundColor: PILL }} />
      <View fixed style={{ position: 'absolute', left: 522, top: 659, width: 58, height: 132, borderRadius: 29, backgroundColor: PILL }} />
      <View fixed style={{ position: 'absolute', left: 531.5, top: 667, width: 43, height: 43, borderRadius: 21.5, backgroundColor: TEAL }} />
      <Svg fixed style={{ position: 'absolute', left: 542, top: 678, width: 22, height: 22 }} viewBox="0 0 24 24">
        <Path d="M4 12h15M13 5l7 7-7 7" stroke="#DED9D2" strokeWidth={1.6} fill="none" />
      </Svg>
      <Text fixed style={{ position: 'absolute', left: 52, top: 756, fontFamily: 'Montserrat', fontSize: 10, color: '#FFFFFF' }}>
        www.aurexissolution.com
      </Text>
      <Text
        fixed
        render={({ pageNumber }) => twoDigits(pageNumber)}
        style={{ position: 'absolute', left: 540, top: 766, width: 40, textAlign: 'right', fontFamily: 'Montserrat', fontSize: 9, color: '#FFFFFF' }}
      />
      <Text fixed style={{ position: 'absolute', left: 17.5, top: 806, fontFamily: 'Montserrat', fontWeight: 700, fontSize: 7.5, color: '#FFFFFF' }}>
        {formatMonthYear(data.date)}
      </Text>
      <Text fixed style={{ position: 'absolute', left: 0, top: 806, width: W, textAlign: 'center', fontFamily: 'Montserrat', fontWeight: 700, fontSize: 7.5, color: '#FFFFFF' }}>
        {`Proposal Ref: ${data.ref}`}
      </Text>
      <Text fixed style={{ position: 'absolute', right: 17.5, top: 806, fontFamily: 'Montserrat', fontWeight: 700, fontSize: 7.5, color: '#FFFFFF' }}>
        Confidential
      </Text>
    </>
  );
}

const Heading = ({ text }: { text: string }) => (
  <Text minPresenceAhead={80} style={{ fontFamily: 'Cormorant', fontWeight: 700, fontSize: 30, color: TEAL, marginBottom: 12, lineHeight: 1.15 }}>
    {text}
  </Text>
);

function Blocks({ blocks, client, signature }: { blocks: Block[]; client: string; signature: boolean }) {
  return (
    <>
      {blocks.map((b, i) => {
        switch (b.t) {
          case 'para':
            return <Text key={i} style={{ ...body, marginBottom: 9 }}>{b.text}</Text>;
          case 'sub':
            return (
              <Text key={i} minPresenceAhead={60} style={{ fontFamily: 'Cormorant', fontWeight: 700, fontSize: 21, color: TEAL, marginTop: 10, marginBottom: 6 }}>
                {b.text}
              </Text>
            );
          case 'bullets':
            return (
              <View key={i} style={{ marginBottom: 8 }}>
                {b.items.map((it, n) => (
                  <View key={n} wrap={false} style={{ flexDirection: 'row', marginBottom: 2.5 }}>
                    <Text style={{ ...body, width: 16 }}>•</Text>
                    <Text style={{ ...body, flex: 1 }}>{it}</Text>
                  </View>
                ))}
              </View>
            );
          case 'num':
            return (
              <View key={i} wrap={false} style={{ marginBottom: 8 }}>
                <Text style={{ fontFamily: 'Cormorant', fontWeight: 700, fontSize: 17, color: TEAL, marginBottom: 2 }}>
                  {`${twoDigits(b.n)} — ${b.title}`}
                </Text>
                {b.text ? <Text style={{ ...body, fontSize: 11 }}>{b.text}</Text> : null}
              </View>
            );
          case 'callout':
            return (
              <View key={i} wrap={false} style={{ flexDirection: 'row', marginVertical: 6 }}>
                <View style={{ width: 2.5, backgroundColor: '#FFFFFF', marginRight: 10 }} />
                <Text style={{ ...body, flex: 1, fontFamily: 'Cormorant', fontWeight: 400, fontSize: 14.5, color: TEAL }}>{b.text}</Text>
              </View>
            );
          case 'note':
            return <Text key={i} style={{ ...body, fontSize: 9.5, color: MUTED, marginBottom: 8 }}>{b.text}</Text>;
          case 'table':
            return (
              <View key={i} style={{ marginBottom: 10, borderTopWidth: 0.75, borderLeftWidth: 0.75, borderColor: '#6A6668' }}>
                {b.rows.map((r, n) => (
                  <View key={n} wrap={false} style={{ flexDirection: 'row' }}>
                    {r.map((c, k) => (
                      <Text
                        key={k}
                        style={{
                          ...body, fontSize: 10.5, flex: k === 0 ? 1.4 : 1, padding: 7,
                          fontWeight: n === 0 || k > 0 ? 700 : 400,
                          borderRightWidth: 0.75, borderBottomWidth: 0.75, borderColor: '#6A6668',
                        }}
                      >
                        {c}
                      </Text>
                    ))}
                  </View>
                ))}
              </View>
            );
          case 'invest':
            return (
              <View key={i} wrap={false} style={{ marginBottom: 12 }}>
                <Text style={{ ...body, fontSize: 11, color: MUTED }}>{b.label}</Text>
                <Text style={{ fontFamily: 'Cormorant', fontWeight: 700, fontSize: 48, color: '#FFFFFF', lineHeight: 1.1 }}>{b.amount}</Text>
              </View>
            );
          case 'sign':
            return (
              <View key={i} wrap={false} style={{ flexDirection: 'row', gap: 30, marginTop: 14 }}>
                {[
                  { who: `For ${client}`, role: 'Authorised signatory', sig: false },
                  { who: 'For Aurexis Solution', role: 'Sanjay Gunabalan, CEO & Founder', sig: signature },
                ].map((p) => (
                  <View key={p.who} style={{ flex: 1 }}>
                    <Text style={{ ...body, fontSize: 9, color: MUTED }}>{p.who}</Text>
                    <View style={{ height: 62, justifyContent: 'flex-end' }}>
                      {p.sig ? <Image src={asset('signature-script.png')} style={{ width: 120, height: 28, objectFit: 'contain', objectPosition: 'left' }} /> : null}
                    </View>
                    <View style={{ borderTopWidth: 0.75, borderColor: '#FFFFFF', paddingTop: 4 }}>
                      <Text style={{ ...body, fontSize: 8.5 }}>{p.role}</Text>
                      <Text style={{ ...body, fontSize: 8.5, color: MUTED, marginTop: 8 }}>Date:</Text>
                    </View>
                  </View>
                ))}
              </View>
            );
        }
      })}
    </>
  );
}

export function ProposalDocument({ data }: { data: ProposalData }) {
  const product = PRODUCTS.find((p) => p.key === data.product)?.label ?? '';
  const [t1, ...t2] = data.title.split('\n');
  return (
    <Document title={`Proposal ${data.ref}`} author="Aurexis Solution">
      <Page size={{ width: W, height: H }} style={{ backgroundColor: BG }}>
        <Image src={asset('logo-white.png')} style={{ position: 'absolute', left: 59.5, top: 44, width: 150, height: 84.6 }} />
        <Text style={{ position: 'absolute', left: 339, top: 58, width: 200, fontFamily: 'Montserrat', fontSize: 6.5, lineHeight: 1.6, letterSpacing: 1.2, color: MUTED }}>
          No 3 Jalan Bukit Puteri 1/17 Bandar Puteri Jaya 08000 Sungai Petani, Kedah, Malaysia
        </Text>
        <Text style={{ position: 'absolute', left: 0, top: 290, width: W, textAlign: 'center', fontFamily: 'Cormorant', fontWeight: 700, fontSize: 32, color: TEAL, letterSpacing: 1 }}>
          {`AUREXIS ${product.toUpperCase()}`}
        </Text>
        <View style={{ position: 'absolute', left: 30, top: 340, width: W - 80 }}>
          <Text style={{ textAlign: 'center', fontFamily: 'Cormorant', fontWeight: 300, fontSize: 54, lineHeight: 1.05, color: '#FFFFFF' }}>
            {[t1, ...t2].join('\n')}
          </Text>
        </View>
        <Text style={{ position: 'absolute', left: 36, top: 655, fontFamily: 'Montserrat', fontSize: 8, color: MUTED }}>Prepared for :</Text>
        <Text style={{ position: 'absolute', left: 36, top: 668, width: 190, fontFamily: 'Montserrat', fontWeight: 700, fontSize: 11, lineHeight: 1.15, color: '#FFFFFF' }}>
          {data.clientName}
        </Text>
        <Text style={{ position: 'absolute', left: 248, top: 655, fontFamily: 'Montserrat', fontSize: 8, color: MUTED }}>Prepared by :</Text>
        <Text style={{ position: 'absolute', left: 248, top: 668, fontFamily: 'Montserrat', fontWeight: 700, fontSize: 11, color: '#FFFFFF' }}>Aurexis Solution</Text>
        <Furniture data={data} />
      </Page>

      <Page size={{ width: W, height: H }} style={{ backgroundColor: BG, paddingTop: 112, paddingBottom: 150, paddingHorizontal: 56 }}>
        <Image fixed src={asset('logo-white.png')} style={{ position: 'absolute', left: 52, top: 30, width: 96, height: 54 }} />
        {data.sections.map((s, i) => (
          <View key={i} break={i > 0 && s.pageBreak} style={{ marginBottom: 14 }}>
            <Heading text={s.title} />
            <Blocks blocks={parseBody(s.body)} client={data.clientName} signature={data.signature} />
          </View>
        ))}
        <Furniture data={data} />
      </Page>
    </Document>
  );
}
