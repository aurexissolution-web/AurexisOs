// Proposal data, the small writing syntax used in each section, and the
// starting template. Type-only imports, so node:test can load it.
import type { ProductKey } from './model';

export interface ProposalSection {
  title: string;
  /** Written in the syntax below. */
  body: string;
  /** Start this section on a new page. */
  pageBreak: boolean;
}

export interface ProposalData {
  ref: string;
  /** YYYY-MM-DD */
  date: string;
  product: ProductKey;
  /** Cover title; a line break makes a second line. */
  title: string;
  clientName: string;
  sections: ProposalSection[];
  signature: boolean;
}

export type Block =
  | { t: 'para'; text: string }
  | { t: 'sub'; text: string }
  | { t: 'bullets'; items: string[] }
  | { t: 'num'; n: number; title: string; text: string }
  | { t: 'callout'; text: string }
  | { t: 'note'; text: string }
  | { t: 'table'; rows: string[][] }
  | { t: 'invest'; label: string; amount: string }
  | { t: 'sign' };

/**
 * Writing syntax, one item per line:
 *   ## Sub-heading            - bullet            > highlighted line
 *   1. Title | description    (numbered, shows as "01 — Title")
 *   | col | col               (table; first row is the header)
 *   ~ small print             @invest Label | RM1,850      @sign
 * Any other lines form paragraphs; a blank line starts a new one.
 */
export function parseBody(body: string): Block[] {
  const out: Block[] = [];
  let para: string[] = [];
  const flush = () => {
    if (para.length) out.push({ t: 'para', text: para.join(' ') });
    para = [];
  };
  for (const raw of body.replace(/\r/g, '').split('\n')) {
    const line = raw.trim();
    if (!line) {
      flush();
      continue;
    }
    let m: RegExpExecArray | null;
    if (line.startsWith('## ')) {
      flush();
      out.push({ t: 'sub', text: line.slice(3).trim() });
    } else if (/^[-•]\s+/.test(line)) {
      flush();
      const text = line.replace(/^[-•]\s+/, '');
      const last = out[out.length - 1];
      if (last?.t === 'bullets') last.items.push(text);
      else out.push({ t: 'bullets', items: [text] });
    } else if (line.startsWith('> ')) {
      flush();
      out.push({ t: 'callout', text: line.slice(2).trim() });
    } else if (line.startsWith('~ ')) {
      flush();
      out.push({ t: 'note', text: line.slice(2).trim() });
    } else if (line.startsWith('|')) {
      flush();
      const row = line.replace(/^\||\|$/g, '').split('|').map((c) => c.trim());
      const last = out[out.length - 1];
      if (last?.t === 'table') last.rows.push(row);
      else out.push({ t: 'table', rows: [row] });
    } else if ((m = /^(\d{1,2})\.\s+(.*)$/.exec(line))) {
      flush();
      const [title, ...rest] = m[2].split('|');
      out.push({ t: 'num', n: Number(m[1]), title: title.trim(), text: rest.join('|').trim() });
    } else if ((m = /^@invest\s+(.*)$/.exec(line))) {
      flush();
      const [label, amount] = m[1].split('|');
      out.push({ t: 'invest', label: (label ?? '').trim(), amount: (amount ?? '').trim() });
    } else if (line === '@sign') {
      flush();
      out.push({ t: 'sign' });
    } else {
      para.push(line);
    }
  }
  flush();
  return out;
}

export const twoDigits = (n: number) => String(n).padStart(2, '0');

// ── Starting template ────────────────────────────────────────────────────────

/** Written into sections as {{client}} and filled from "Prepared for" when the PDF is built. */
export const CLIENT_TOKEN = '{{client}}';

export function fillClient(text: string, clientName: string): string {
  return text.split(CLIENT_TOKEN).join(clientName.trim() || 'the client');
}

const LABELS: Record<ProductKey, string> = {
  presence: 'Presence', flow: 'Flow', core: 'Core', connect: 'Connect', audit: 'AI Readiness Audit',
};
/** What the product is, in words a client understands. */
const SERVICES: Record<ProductKey, string> = {
  presence: 'Website design and development',
  flow: 'Workflow automation',
  core: 'Custom business systems',
  connect: 'WhatsApp and customer messaging',
  audit: 'AI readiness audit',
};
const productLabel = (k: ProductKey) => LABELS[k] ?? 'Solution';
const serviceName = (k: ProductKey) => SERVICES[k] ?? 'Solution';

/** "RM1,850" or "RM925.50" (proposal style: no space). */
const rm = (n: number) =>
  `RM${(Math.round(n * 100) / 100).toLocaleString('en-MY', { minimumFractionDigits: Number.isInteger(n) ? 0 : 2, maximumFractionDigits: 2 })}`;

/** A price, or a visible blank to fill in when none is set yet. */
const money = (n: number) => (n > 0 ? rm(n) : 'RM…');

const CARE_PLAN: Record<ProductKey, string> = {
  presence: `A website needs looking after once it is live. A monthly care plan keeps it secure, backed up and up to date. It is billed separately from the project price above.

| Care plan | Monthly fee
| Essential | RM350 per month
| Growth | RM650 per month

## What Essential includes
- Hosting, SSL and domain management
- Daily backups and security patches
- Uptime monitoring and bug fixes
- 1 hour of content edits each month

~ Care plans are billed monthly, with a minimum of 6 months and month-to-month after that. Prices shown are for standard websites; database-driven projects are quoted separately. Choose a plan or decline it when accepting this proposal.`,
  flow: careGeneric(),
  core: careGeneric(),
  connect: careGeneric(),
  audit: careGeneric(),
};

function careGeneric(): string {
  return `A monthly care plan keeps the solution running, secure and up to date after launch. It is billed separately from the project price above.

| Care plan | Monthly fee
| Monthly care plan | RM… per month

## What the care plan includes
- Hosting and monitoring
- Fixes and updates
- Support hours each month

~ Choose a plan or decline it when accepting this proposal.`;
}

/** Standard sections. {{client}} is filled from "Prepared for" when the PDF is built. Everything is editable. */
export function defaultSections(product: ProductKey, price: number): ProposalSection[] {
  const c = CLIENT_TOKEN;
  const deposit = Math.round((price / 2) * 100) / 100;
  const balance = Math.round((price - deposit) * 100) / 100;
  const label = productLabel(product);
  const service = serviceName(product);
  // Short sections flow on after the previous one; long ones start a fresh page.
  const sec = (title: string, body: string, pageBreak = false): ProposalSection => ({ title, body, pageBreak });
  return [
    sec(
      'About Aurexis Solution',
      `Aurexis Solution is a productised business-systems and technology company that helps growing organisations turn scattered operations, disconnected tools and unclear information into connected, visible and manageable systems.

We combine business analysis, digital experience design, software development, workflow improvement, data engineering, systems integration, reporting and responsible AI to create practical technology solutions built around measurable business outcomes.

## About this service
Aurexis ${label} is our ${service.toLowerCase()} service. Add two or three sentences on what it will do for ${c}.

## Our approach
- Understand the business objective before designing
- Structure information around the customer journey
- Create professional, responsive and accessible experiences
- Build around credibility, conversion and long-term usability

> Clients own their systems, accounts and data.`,
    ),
    sec(
      'Executive Summary',
      `${c} requires ... (what the client needs and why).

Aurexis recommends ... (the solution in one paragraph).

## Our Understanding of ${c}
- Point one
- Point two

## Proposed Outcome
Describe the result the client should expect.`,
    ),
    sec(
      'Project Objectives',
      `1. First objective | What it means for ${c}.
2. Second objective | What it means for ${c}.
3. Third objective | What it means for ${c}.

> One sentence that sums up the value of the project.`,
    ),
    sec(
      'Recommended Solution',
      `Aurexis recommends ...

## Solution at a Glance
- Key deliverable one
- Key deliverable two
- Key deliverable three`,
    ),
    sec(
      'Included Deliverables',
      `The project includes ...

## Group one
- Deliverable
- Deliverable

## Group two
- Deliverable
- Deliverable`,
    ),
    sec(
      'Estimated Timeline',
      `## Approximately 10–15 working days

| Stage | Estimated duration
| Discovery and content review | 2–3 working days
| Content structure and design | 3–4 working days
| Development | 4–6 working days
| Review, revisions and QA | 2–3 working days
| Launch and handover | 1 working day

## Timeline Conditions
The project timeline begins after:
- The initial deposit is received
- The project scope is accepted
- Required content and visual assets are supplied
- Domain access and any required account credentials are provided
- One authorised representative is assigned`,
      true,
    ),
    sec(
      'Project Investment',
      `@invest ${c} — ${service} | ${money(price)}

The investment covers the design, development and launch of the project described in this proposal.

## Included
- Deliverable
- Deliverable

## Payment Schedule
1. Project Commencement | 50% deposit — ${money(deposit)}. Required to confirm the project and begin work.
2. Before Launch | 50% balance — ${money(balance)}. Payable after final approval and before go-live.

## Commercial Notes
- The deposit confirms acceptance of the project scope and reserves the delivery schedule.
- Work begins after the deposit, required content, assets and access are received.
- The project includes 2 rounds of revisions. Further rounds are quoted under Additional Services.
- Additional work outside the approved scope will be quoted separately.
- This proposal is valid for 14 days from the issue date. Prices are held for that period only.`,
      true,
    ),
    sec('Care Plan and Maintenance', CARE_PLAN[product] ?? careGeneric()),
    sec(
      'Additional Services',
      `The following services are not included in the base project and may be added during the project or requested after launch.

| Optional service | Investment
| Additional page | RM… per page
| Additional revision round | RM… per round

## Quoted Separately
- Additional language versions
- CRM or third-party system integration

~ Optional services will only be carried out after the scope, price and delivery impact have been approved in writing.`,
    ),
    sec(
      'Acceptance',
      `By signing below, ${c} accepts this proposal and the payment schedule set out above.

@sign`,
    ),
  ];
}

// ── Checks before a proposal goes out ────────────────────────────────────────

const LEFTOVERS: [RegExp, string][] = [
  [/RM…|RM\s?0(\.0+)?(?![\d,])/, 'A price is still blank or RM0. Set the project price and the optional prices.'],
  [/Add two or three sentences|Describe the result|One sentence that sums up|\(what the client needs and why\)/, 'Template wording is still in place (for example "Add two or three sentences").'],
  [/^\s*[-•]\s*Point (one|two)\s*$|(First|Second|Third) objective|Key deliverable (one|two|three)|^\s*[-•]\s*Deliverable\s*$|^## Group (one|two)\s*$/im, 'Placeholder points remain (for example "Point one", "First objective", "Deliverable").'],
  [/(requires|recommends|includes) \.\.\./, 'A sentence still ends in "..." and needs finishing.'],
];

/** Plain-language list of things to fix before sending; empty when the proposal looks finished. */
export function proposalIssues(sections: ProposalSection[], clientName: string): string[] {
  const text = sections.map((s) => s.body).join('\n');
  const out: string[] = [];
  for (const [re, msg] of LEFTOVERS) if (re.test(text)) out.push(msg);
  if (/^@invest\s+the client\b/im.test(fillClient(text, clientName))) {
    out.push('The Investment section says "the client" instead of the client name. Fill in "Prepared for".');
  }
  return out;
}
