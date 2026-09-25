// src/lib/email/templates.ts
// Every email the site sends, rendered to inline-styled table HTML plus a
// plain-text part. No path aliases here so node:test can import it directly.

export type EmailRow = { label: string; value: string };
export type Email = { subject: string; html: string; text: string };
export type QuoteService = 'presence' | 'flow' | 'core' | 'connect' | 'audit';

const WHATSAPP_DISPLAY = '+60 16-407 1129';
const WHATSAPP_LINK = 'https://wa.me/60164071129';
const SITE = 'aurexissolution.com';

const SERVICES: Record<QuoteService, { name: string; accent: string; next: string }> = {
  presence: {
    name: 'Presence',
    accent: '#5EE3DA',
    next: 'book a short call about your website',
  },
  flow: { name: 'Flow', accent: '#7FE8C4', next: 'book a short call about your workflow' },
  core: { name: 'Core', accent: '#8FA8F0', next: 'book a discovery call' },
  connect: { name: 'Connect', accent: '#B08FF0', next: 'book a short call about WhatsApp' },
  audit: {
    name: 'AI Readiness Audit',
    accent: '#F0C88F',
    next: 'confirm scope and schedule your audit',
  },
};

const CONTACT_INTENTS: Record<string, string> = {
  'new-project': 'a new project',
  'ai-agent': 'an AI agent',
  'existing-client': 'your existing project with us',
  'press-partnerships': 'a press or partnership enquiry',
  careers: 'working with us',
};

const myr = new Intl.NumberFormat('en-MY', {
  style: 'currency',
  currency: 'MYR',
  maximumFractionDigits: 0,
});

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const escBr = (s: string) => esc(s).replace(/\r?\n/g, '<br>');
const unesc = (s: string) =>
  s
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&');

type Block =
  | { kind: 'p'; text: string; strong?: string[] }
  | { kind: 'rows'; title?: string; rows: EmailRow[] }
  | { kind: 'hero'; label: string; value: string; sub?: string }
  | { kind: 'quote'; text: string };

type Layout = {
  subject: string;
  preheader: string;
  eyebrow: string;
  heading: string;
  accent?: string;
  blocks: Block[];
  cta?: { label: string; href: string };
  footer?: string;
};

const FONT = `-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif`;
const MONO = `ui-monospace,SFMono-Regular,Menlo,Consolas,monospace`;

// Paragraph text is escaped; any `strong` fragments found in it are bolded.
function paragraph(text: string, strong: string[] = []): string {
  let html = escBr(text);
  for (const s of strong) {
    const e = esc(s);
    if (e) html = html.split(e).join(`<b style="color:#ffffff;font-weight:600;">${e}</b>`);
  }
  return `<p style="margin:0 0 14px;font-family:${FONT};font-size:15px;line-height:1.65;color:rgba(255,255,255,0.72);">${html}</p>`;
}

function rowsTable(rows: EmailRow[], title?: string): string {
  const kept = rows.filter((r) => r.value.trim());
  if (!kept.length) return '';
  const trs = kept
    .map(
      (r, i) => `<tr>
  <td valign="top" style="padding:11px 0;${i ? 'border-top:1px solid rgba(255,255,255,0.06);' : ''}font-family:${MONO};font-size:10.5px;letter-spacing:0.14em;text-transform:uppercase;color:rgba(255,255,255,0.42);width:38%;">${esc(r.label)}</td>
  <td valign="top" style="padding:11px 0 11px 12px;${i ? 'border-top:1px solid rgba(255,255,255,0.06);' : ''}font-family:${FONT};font-size:14px;line-height:1.5;color:#ffffff;">${escBr(r.value)}</td>
</tr>`,
    )
    .join('');
  return `${title ? `<div style="margin:22px 0 4px;font-family:${MONO};font-size:10px;letter-spacing:0.24em;text-transform:uppercase;color:rgba(255,255,255,0.4);">${esc(title)}</div>` : ''}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 18px;border-collapse:collapse;">${trs}</table>`;
}

function render(l: Layout): Email {
  const accent = l.accent ?? '#5EE3DA';
  const body = l.blocks
    .map((b) => {
      if (b.kind === 'p') return paragraph(b.text, b.strong);
      if (b.kind === 'rows') return rowsTable(b.rows, b.title);
      if (b.kind === 'quote')
        return `<div style="margin:6px 0 18px;padding:14px 16px;border-left:2px solid ${accent};background:rgba(255,255,255,0.03);border-radius:0 10px 10px 0;font-family:${FONT};font-size:14px;line-height:1.6;color:rgba(255,255,255,0.7);">${escBr(b.text)}</div>`;
      return `<div style="margin:4px 0 20px;padding:20px;border:1px solid rgba(255,255,255,0.08);border-radius:14px;background:rgba(255,255,255,0.025);">
  <div style="font-family:${MONO};font-size:10px;letter-spacing:0.24em;text-transform:uppercase;color:rgba(255,255,255,0.45);">${esc(b.label)}</div>
  <div style="margin-top:8px;font-family:Georgia,serif;font-style:italic;font-size:44px;line-height:1;color:#ffffff;">${esc(b.value)}</div>
  ${b.sub ? `<div style="margin-top:8px;font-family:${MONO};font-size:12px;color:${accent};">${esc(b.sub)}</div>` : ''}
</div>`;
    })
    .join('\n');

  const cta = l.cta
    ? `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 4px;"><tr><td style="border-radius:999px;background:${accent};">
  <a href="${esc(l.cta.href)}" style="display:inline-block;padding:13px 24px;font-family:${FONT};font-size:14px;font-weight:600;color:#02040A;text-decoration:none;border-radius:999px;">${esc(l.cta.label)} &rarr;</a>
</td></tr></table>`
    : '';

  const footer =
    l.footer ??
    `Need us sooner? WhatsApp <a href="${WHATSAPP_LINK}" style="color:${accent};text-decoration:none;">${WHATSAPP_DISPLAY}</a> or just reply to this email.`;

  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="dark"><meta name="supported-color-schemes" content="dark"><title>${esc(l.subject)}</title></head>
<body style="margin:0;padding:0;background:#02040A;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${esc(l.preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#02040A;">
<tr><td align="center" style="padding:32px 14px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;">
    <tr><td style="padding:0 4px 18px;font-family:${FONT};font-size:15px;font-weight:700;letter-spacing:-0.01em;color:#ffffff;">
      Aurexis<span style="color:${accent};">.</span>
    </td></tr>
    <tr><td style="background:#0A0C13;border:1px solid rgba(255,255,255,0.08);border-radius:18px;overflow:hidden;">
      <div style="height:2px;background:${accent};opacity:0.85;"></div>
      <div style="padding:30px 28px 10px;">
        <div style="font-family:${MONO};font-size:10px;letter-spacing:0.28em;text-transform:uppercase;color:${accent};">${esc(l.eyebrow)}</div>
        <h1 style="margin:12px 0 20px;font-family:${FONT};font-size:26px;line-height:1.2;font-weight:800;letter-spacing:-0.02em;color:#ffffff;">${esc(l.heading)}</h1>
        ${body}
        ${cta}
      </div>
      <div style="padding:18px 28px 26px;border-top:1px solid rgba(255,255,255,0.06);font-family:${FONT};font-size:13px;line-height:1.6;color:rgba(255,255,255,0.45);">${footer}</div>
    </td></tr>
    <tr><td style="padding:18px 4px 0;font-family:${MONO};font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:rgba(255,255,255,0.28);">
      Aurexis Solution &middot; Kuala Lumpur &middot; <a href="https://${SITE}" style="color:rgba(255,255,255,0.4);text-decoration:none;">${SITE}</a>
    </td></tr>
  </table>
</td></tr>
</table>
</body></html>`;

  const text = [
    l.heading,
    '',
    ...l.blocks.flatMap((b) => {
      if (b.kind === 'p') return [b.text, ''];
      if (b.kind === 'quote') return [b.text, ''];
      if (b.kind === 'hero') return [`${b.label}: ${b.value}${b.sub ? ` (${b.sub})` : ''}`, ''];
      const kept = b.rows.filter((r) => r.value.trim());
      return kept.length
        ? [
            ...(b.title ? [b.title.toUpperCase()] : []),
            ...kept.map((r) => `${r.label}: ${r.value}`),
            '',
          ]
        : [];
    }),
    ...(l.cta ? [`${l.cta.label}: ${l.cta.href}`, ''] : []),
    l.footer
      ? unesc(l.footer.replace(/<[^>]+>/g, ''))
      : `Need us sooner? WhatsApp ${WHATSAPP_DISPLAY} or just reply to this email.`,
    '',
    `Aurexis Solution · ${SITE}`,
  ].join('\n');

  return { subject: l.subject, html, text };
}

export function quoteConfirmation(o: {
  service: QuoteService;
  name: string;
  choice: string;
  whatsapp: string;
  rows: EmailRow[];
}): Email {
  const s = SERVICES[o.service];
  return render({
    subject: `We've got your ${s.name} request`,
    preheader: `We'll WhatsApp you within one business day to ${s.next}.`,
    eyebrow: `Aurexis · ${s.name}`,
    heading: `Thanks, ${o.name}. We've got it.`,
    accent: s.accent,
    blocks: [
      {
        kind: 'p',
        text: `Your ${s.name} request for ${o.choice} is with us. One of us will read it properly and WhatsApp you at ${o.whatsapp} within one business day to ${s.next}.`,
        strong: [o.choice, o.whatsapp],
      },
      { kind: 'rows', title: 'What you told us', rows: o.rows },
      {
        kind: 'p',
        text: 'Something to add or change? Reply to this email and it comes straight to us.',
      },
    ],
  });
}

export function contactConfirmation(o: { name: string; intent: string; message: string }): Email {
  const topic = CONTACT_INTENTS[o.intent] ?? 'your message';
  return render({
    subject: 'We got your message',
    preheader: 'A real person will reply within one business day.',
    eyebrow: 'Aurexis · Contact',
    heading: `Thanks, ${o.name}.`,
    blocks: [
      {
        kind: 'p',
        text: `Your message about ${topic} is with us. A real person will reply within one business day, usually sooner.`,
        strong: [topic],
      },
      { kind: 'quote', text: o.message },
    ],
  });
}

export function calculatorReport(o: {
  annualWaste: number;
  staff: number;
  wage: number;
  hours: number;
  siteUrl?: string;
}): Email {
  const annual = myr.format(o.annualWaste);
  const monthly = myr.format(Math.round(o.annualWaste / 12));
  const site = o.siteUrl ?? `https://${SITE}`;
  return render({
    subject: `Your admin cost breakdown: ${annual} a year`,
    preheader: `That's about ${monthly} every month spent on manual admin.`,
    eyebrow: 'Aurexis · Capacity calculator',
    heading: 'Here is your breakdown.',
    accent: '#00F0FF',
    blocks: [
      {
        kind: 'hero',
        label: 'Spent on manual admin each year',
        value: annual,
        sub: `≈ ${monthly} a month`,
      },
      {
        kind: 'rows',
        title: 'Based on',
        rows: [
          { label: 'Admin staff', value: `${o.staff} ${o.staff === 1 ? 'person' : 'people'}` },
          { label: 'Monthly wage', value: `${myr.format(o.wage)} each` },
          { label: 'Admin time', value: `${o.hours} hrs a week each` },
        ],
      },
      {
        kind: 'p',
        text: 'Most of that time goes on typing the same thing twice, chasing approvals and copying between spreadsheets. That is the work we automate. Want to see which parts of yours could go?',
      },
    ],
    cta: { label: 'Book a free 20-minute call', href: `${site}/contact` },
  });
}

export function reviewThanks(o: { name: string }): Email {
  return render({
    subject: 'Thank you for your review',
    preheader: 'It means a lot to a small team.',
    eyebrow: 'Aurexis · Reviews',
    heading: `Thank you, ${o.name}.`,
    blocks: [
      {
        kind: 'p',
        text: 'We read every review ourselves. Once we have checked yours, it will appear on our homepage. It genuinely helps the next business owner decide to work with us.',
      },
    ],
    footer: `Anything we could have done better? Reply to this email. We'd rather hear it from you first.`,
  });
}

export function teamLeadAlert(o: {
  source: string;
  name: string;
  email: string;
  phone?: string;
  rows: EmailRow[];
  adminUrl: string;
  accent?: string;
  ctaLabel?: string;
}): Email {
  const digits = o.phone?.replace(/\D/g, '') ?? '';
  const wa = digits ? `https://wa.me/${digits.startsWith('0') ? `6${digits}` : digits}` : '';
  return render({
    subject: `New ${o.source} lead · ${o.name}`,
    preheader: `${o.name} · ${o.email}${o.phone ? ` · ${o.phone}` : ''}`,
    eyebrow: `New lead · ${o.source}`,
    heading: o.name,
    accent: o.accent,
    blocks: [
      {
        kind: 'rows',
        rows: [
          { label: 'Email', value: o.email },
          { label: 'Phone', value: o.phone ?? '' },
          ...o.rows,
        ],
      },
    ],
    cta: { label: o.ctaLabel ?? 'Open in Command Center', href: o.adminUrl },
    footer: `${wa ? `<a href="${esc(wa)}" style="color:#25D366;text-decoration:none;">WhatsApp ${esc(o.name)}</a> · ` : ''}Reply to this email to answer ${esc(o.name)} directly.`,
  });
}

export function quoteTeamAlert(o: {
  service: QuoteService;
  name: string;
  email: string;
  whatsapp: string;
  choice: string;
  rows: EmailRow[];
  adminUrl: string;
}): Email {
  const s = SERVICES[o.service];
  return teamLeadAlert({
    source: s.name,
    name: o.name,
    email: o.email,
    phone: o.whatsapp,
    rows: [
      { label: 'Picked', value: o.choice },
      ...o.rows.map((r) => ({ ...r, label: r.label.replace(/^Your /, '') })),
    ],
    adminUrl: o.adminUrl,
    accent: s.accent,
  });
}

export function calendarInvite(o: {
  title: string;
  kindLabel: string;
  when: string;
  where: string;
  url: string | null;
  attendee: string;
  notes: string;
  cancelled: boolean;
  adminUrl: string;
}): Email {
  return render({
    subject: `${o.cancelled ? 'Cancelled' : 'Invitation'}: ${o.title}`,
    preheader: o.when,
    eyebrow: `${o.cancelled ? 'Cancelled' : 'Calendar'} · ${o.kindLabel}`,
    heading: o.title,
    accent: o.cancelled ? '#F08F8F' : '#5EE3DA',
    blocks: [
      {
        kind: 'rows',
        rows: [
          { label: 'When', value: o.when },
          { label: 'Where', value: o.where },
          { label: 'Link', value: o.url ?? '' },
          { label: 'With', value: o.attendee },
          { label: 'Notes', value: o.notes },
        ],
      },
      {
        kind: 'p',
        text: o.cancelled
          ? 'This event was cancelled and will be removed from your Google Calendar.'
          : 'This is added to your Google Calendar automatically. If you only see an "Add to calendar" button in Gmail, turn on Google Calendar > Settings > Event settings > "Automatically add invitations".',
      },
    ],
    cta: { label: 'Open calendar', href: o.adminUrl },
    footer: 'Sent by the Aurexis admin calendar.',
  });
}

export function clientFileEmail(o: {
  name: string;
  message: string;
  fileName: string;
  senderName: string;
}): Email {
  return render({
    subject: `${o.fileName} from Aurexis Solution`,
    preheader: `${o.fileName} is attached.`,
    eyebrow: 'Aurexis · Document',
    heading: `Hi ${o.name.split(' ')[0] || 'there'},`,
    blocks: [
      ...(o.message.trim() ? [{ kind: 'p' as const, text: o.message.trim() }] : []),
      { kind: 'p', text: `Attached: ${o.fileName}`, strong: [o.fileName] },
      { kind: 'p', text: 'Reply to this email if anything needs changing, and it comes straight to us.' },
    ],
    footer: `${esc(o.senderName)}, Aurexis Solution · <a href="${WHATSAPP_LINK}" style="color:#5EE3DA;text-decoration:none;">WhatsApp ${WHATSAPP_DISPLAY}</a>`,
  });
}
