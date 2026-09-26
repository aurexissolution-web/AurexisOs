// src/app/api/quote-request/route.ts
// Shared endpoint for every "Get a Quote" form on the site. The `service`
// field in the request body picks which validation, table and copy apply —
// add a new branch here when a new solutions page gets its own quote form.
import { after, NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { isValidEmail, isValidMalaysianPhone } from '@/lib/lead-validation';
import { clientIp, isHoneypot, rateLimited } from '@/lib/spam';
import { telegramBody } from '@/lib/telegram';
import { sendEmail, SITE_URL, TEAM_INBOX } from '@/lib/email/send';
import { linkEnquiry, logEmailSent } from '@/lib/admin/client-link';
import {
  quoteConfirmation,
  quoteTeamAlert,
  type EmailRow,
  type QuoteService,
} from '@/lib/email/templates';
import {
  QUOTE_WEBSITE_TYPE_OPTIONS,
  QUOTE_HAS_WEBSITE_OPTIONS,
  QUOTE_TIMELINE_OPTIONS as PRESENCE_TIMELINE_OPTIONS,
  QUOTE_BUDGET_OPTIONS as PRESENCE_BUDGET_OPTIONS,
  QUOTE_MEETING_OPTIONS,
} from '@/data/presence-config';
import type { PresenceQuoteFieldErrors } from '@/types/presence';
import {
  QUOTE_TIER_OPTIONS,
  QUOTE_HAS_META_OPTIONS,
  QUOTE_ENQUIRY_VOLUME_OPTIONS,
  QUOTE_TIMELINE_OPTIONS as CONNECT_TIMELINE_OPTIONS,
  QUOTE_BUDGET_OPTIONS as CONNECT_BUDGET_OPTIONS,
  QUOTE_MEETING_OPTIONS as CONNECT_MEETING_OPTIONS,
} from '@/data/connect-config';
import type { ConnectQuoteFieldErrors } from '@/types/connect';
import {
  QUOTE_TIER_OPTIONS as FLOW_TIER_OPTIONS,
  QUOTE_ACCOUNTING_PACKAGE_OPTIONS,
  QUOTE_ADMIN_HOURS_OPTIONS,
  QUOTE_LHDN_STATUS_OPTIONS,
  QUOTE_TIMELINE_OPTIONS as FLOW_TIMELINE_OPTIONS,
  QUOTE_BUDGET_OPTIONS as FLOW_BUDGET_OPTIONS,
  QUOTE_MEETING_OPTIONS as FLOW_MEETING_OPTIONS,
} from '@/data/flow-config';
import type { FlowQuoteFieldErrors } from '@/types/flow';
import {
  QUOTE_TIER_OPTIONS as CORE_TIER_OPTIONS,
  QUOTE_SAAS_SPEND_OPTIONS,
  QUOTE_BOTTLENECK_OPTIONS,
  QUOTE_DATA_MIGRATION_OPTIONS,
  QUOTE_TIMELINE_OPTIONS as CORE_TIMELINE_OPTIONS,
  QUOTE_BUDGET_OPTIONS as CORE_BUDGET_OPTIONS,
  QUOTE_MEETING_OPTIONS as CORE_MEETING_OPTIONS,
} from '@/data/core-config';
import type { CoreQuoteFieldErrors } from '@/types/core';
import {
  QUOTE_TIER_OPTIONS as AUDIT_TIER_OPTIONS,
  QUOTE_AI_STAGE_OPTIONS,
  QUOTE_BIGGEST_QUESTION_OPTIONS,
  QUOTE_GRANT_INTEREST_OPTIONS,
  QUOTE_MEETING_OPTIONS as AUDIT_MEETING_OPTIONS,
} from '@/data/audit-config';
import type { AuditQuoteFieldErrors } from '@/types/audit';

export const runtime = 'nodejs';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

const RATE_LIMIT = 3;
const RATE_WINDOW_MS = 60 * 60 * 1000;
const MAX_TEXT = 4000;

async function notifyTelegram(text: string) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) return;
  try {
    const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: telegramBody(TELEGRAM_CHAT_ID, text),
    });
    if (!res.ok) {
      console.error('[/api/quote-request] telegram non-ok:', await res.text());
    }
  } catch (err) {
    console.error('[/api/quote-request] telegram fetch failed:', err);
  }
}

// Runs after the response so the visitor never waits on Resend or the client
// database. Order matters: link the enquiry to a client first, then email, then
// log the confirmation on that client's timeline.
function sendQuoteEmails(o: {
  service: QuoteService;
  id: string;
  name: string;
  email: string;
  whatsapp: string;
  choice: string;
  rows: EmailRow[];
}) {
  const adminUrl = `${SITE_URL}/admin/command?lead=${encodeURIComponent(`${o.service}:${o.id}`)}`;
  after(async () => {
    const clientId = await linkEnquiry({
      source: o.service,
      leadId: o.id,
      name: o.name,
      email: o.email,
      phone: o.whatsapp,
      headline: `${o.choice}: ${o.rows[0]?.value ?? ''}`,
    });
    const confirmation = quoteConfirmation(o);
    const [sent] = await Promise.all([
      sendEmail(o.email, confirmation),
      sendEmail(TEAM_INBOX, quoteTeamAlert({ ...o, adminUrl: clientId ? `${SITE_URL}/admin/clients/${clientId}` : adminUrl }), o.email),
    ]);
    if (clientId && sent.ok) await logEmailSent(clientId, confirmation.subject, o.email, sent.id);
  });
}

const WEBSITE_TYPE_SET = new Set(QUOTE_WEBSITE_TYPE_OPTIONS);
const HAS_WEBSITE_SET = new Set(QUOTE_HAS_WEBSITE_OPTIONS);
const PRESENCE_TIMELINE_SET = new Set(PRESENCE_TIMELINE_OPTIONS);
const PRESENCE_BUDGET_SET = new Set(PRESENCE_BUDGET_OPTIONS);
const MEETING_SET = new Set(QUOTE_MEETING_OPTIONS);

async function handlePresenceQuote(
  body: Record<string, unknown>,
  ip: string,
  userAgent: string | null,
) {
  const {
    websiteType,
    businessDescription,
    hasWebsite,
    timeline,
    budget,
    meetingPreference,
    meetingAddress,
    name,
    whatsapp,
    email,
    notes,
  } = body;

  const errors: PresenceQuoteFieldErrors = {};
  if (typeof websiteType !== 'string' || !WEBSITE_TYPE_SET.has(websiteType as never)) {
    errors.websiteType = 'Please pick a valid website type.';
  }
  if (typeof businessDescription !== 'string' || businessDescription.trim().length === 0) {
    errors.businessDescription = 'Tell us what your business does.';
  }
  if (typeof hasWebsite !== 'string' || !HAS_WEBSITE_SET.has(hasWebsite as never)) {
    errors.hasWebsite = 'Please pick a valid option.';
  }
  if (typeof timeline !== 'string' || !PRESENCE_TIMELINE_SET.has(timeline as never)) {
    errors.timeline = 'Please pick a valid timeline.';
  }
  if (typeof budget !== 'string' || !PRESENCE_BUDGET_SET.has(budget as never)) {
    errors.budget = 'Please pick a valid budget.';
  }
  if (typeof meetingPreference !== 'string' || !MEETING_SET.has(meetingPreference as never)) {
    errors.meetingPreference = 'Please pick online or face to face.';
  }
  const faceToFace = meetingPreference === 'Face to face';
  if (faceToFace && (typeof meetingAddress !== 'string' || meetingAddress.trim().length === 0)) {
    errors.meetingAddress = 'Tell us where to meet you.';
  }
  if (typeof name !== 'string' || name.trim().length === 0) {
    errors.name = 'Please tell us your name.';
  }
  if (typeof whatsapp !== 'string' || !isValidMalaysianPhone(whatsapp)) {
    errors.whatsapp = 'Enter a valid Malaysian WhatsApp number.';
  }
  if (typeof email !== 'string' || !isValidEmail(email)) {
    errors.email = 'Enter a valid email address.';
  }
  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ errors }, { status: 422 });
  }

  const cleanName = (name as string).trim();
  const cleanEmail = (email as string).trim();
  const cleanWhatsapp = (whatsapp as string).trim();
  const cleanNotes = typeof notes === 'string' && notes.trim() ? notes.trim() : null;
  const cleanAddress = faceToFace ? (meetingAddress as string).trim() : null;

  const { data: insertData, error: insertError } = await supabaseAdmin
    .from('presence_quote_requests')
    .insert({
      website_type: websiteType,
      business_description: (businessDescription as string).trim(),
      has_website: hasWebsite,
      timeline,
      budget,
      meeting_preference: meetingPreference,
      meeting_address: cleanAddress,
      name: cleanName,
      whatsapp: cleanWhatsapp,
      email: cleanEmail,
      notes: cleanNotes,
      ip,
      user_agent: userAgent,
    })
    .select('id')
    .single();

  if (insertError || !insertData) {
    console.error('[/api/quote-request] presence insert error:', insertError);
    return NextResponse.json(
      { error: 'Could not save your request. Try again, or WhatsApp us directly.' },
      { status: 500 },
    );
  }

  await notifyTelegram(
    [
      `🌐 *New Presence quote request*`,
      ``,
      `*Website type:* ${websiteType}`,
      `*Business:* ${businessDescription}`,
      `*Has a site today:* ${hasWebsite}`,
      `*Timeline:* ${timeline}`,
      `*Budget:* ${budget}`,
      `*Meeting:* ${meetingPreference}${cleanAddress ? ` — ${cleanAddress}` : ''}`,
      ``,
      `*Name:* ${cleanName}`,
      `*WhatsApp:* ${cleanWhatsapp}`,
      `*Email:* ${cleanEmail}`,
      cleanNotes ? `\n*Notes:*\n${cleanNotes}` : '',
      ``,
      `_via /solutions/presence_`,
    ].join('\n'),
  );

  sendQuoteEmails({
    service: 'presence',
    id: insertData.id,
    name: cleanName,
    email: cleanEmail,
    whatsapp: cleanWhatsapp,
    choice: websiteType as string,
    rows: [
      { label: 'Your business', value: (businessDescription as string).trim() },
      { label: 'Website today', value: hasWebsite as string },
      { label: 'Timeline', value: timeline as string },
      { label: 'Budget', value: budget as string },
      {
        label: 'Meeting',
        value: `${meetingPreference}${cleanAddress ? ` at ${cleanAddress}` : ''}`,
      },
      { label: 'Notes', value: cleanNotes ?? '' },
    ],
  });

  return NextResponse.json({ ok: true, id: insertData.id });
}

const TIER_SET = new Set(QUOTE_TIER_OPTIONS);
const HAS_META_SET = new Set(QUOTE_HAS_META_OPTIONS);
const ENQUIRY_VOLUME_SET = new Set(QUOTE_ENQUIRY_VOLUME_OPTIONS);
const CONNECT_TIMELINE_SET = new Set(CONNECT_TIMELINE_OPTIONS);
const CONNECT_BUDGET_SET = new Set(CONNECT_BUDGET_OPTIONS);
const CONNECT_MEETING_SET = new Set(CONNECT_MEETING_OPTIONS);

async function handleConnectQuote(
  body: Record<string, unknown>,
  ip: string,
  userAgent: string | null,
) {
  const {
    tier,
    businessDescription,
    hasMetaAccount,
    enquiriesPerMonth,
    timeline,
    budget,
    meetingPreference,
    meetingAddress,
    name,
    whatsapp,
    email,
    notes,
  } = body;

  const errors: ConnectQuoteFieldErrors = {};
  if (typeof tier !== 'string' || !TIER_SET.has(tier as never)) {
    errors.tier = 'Please pick a valid Connect tier.';
  }
  if (typeof businessDescription !== 'string' || businessDescription.trim().length === 0) {
    errors.businessDescription = 'Tell us what your business does.';
  }
  if (typeof hasMetaAccount !== 'string' || !HAS_META_SET.has(hasMetaAccount as never)) {
    errors.hasMetaAccount = 'Please pick a valid option.';
  }
  if (
    typeof enquiriesPerMonth !== 'string' ||
    !ENQUIRY_VOLUME_SET.has(enquiriesPerMonth as never)
  ) {
    errors.enquiriesPerMonth = 'Please pick a valid range.';
  }
  if (typeof timeline !== 'string' || !CONNECT_TIMELINE_SET.has(timeline as never)) {
    errors.timeline = 'Please pick a valid timeline.';
  }
  if (typeof budget !== 'string' || !CONNECT_BUDGET_SET.has(budget as never)) {
    errors.budget = 'Please pick a valid budget.';
  }
  if (
    typeof meetingPreference !== 'string' ||
    !CONNECT_MEETING_SET.has(meetingPreference as never)
  ) {
    errors.meetingPreference = 'Please pick online or face to face.';
  }
  const faceToFace = meetingPreference === 'Face to face';
  if (faceToFace && (typeof meetingAddress !== 'string' || meetingAddress.trim().length === 0)) {
    errors.meetingAddress = 'Tell us where to meet you.';
  }
  if (typeof name !== 'string' || name.trim().length === 0) {
    errors.name = 'Please tell us your name.';
  }
  if (typeof whatsapp !== 'string' || !isValidMalaysianPhone(whatsapp)) {
    errors.whatsapp = 'Enter a valid Malaysian WhatsApp number.';
  }
  if (typeof email !== 'string' || !isValidEmail(email)) {
    errors.email = 'Enter a valid email address.';
  }
  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ errors }, { status: 422 });
  }

  const cleanName = (name as string).trim();
  const cleanEmail = (email as string).trim();
  const cleanWhatsapp = (whatsapp as string).trim();
  const cleanNotes = typeof notes === 'string' && notes.trim() ? notes.trim() : null;
  const cleanAddress = faceToFace ? (meetingAddress as string).trim() : null;

  const { data: insertData, error: insertError } = await supabaseAdmin
    .from('connect_quote_requests')
    .insert({
      tier,
      business_description: (businessDescription as string).trim(),
      has_meta_account: hasMetaAccount,
      enquiries_per_month: enquiriesPerMonth,
      timeline,
      budget,
      meeting_preference: meetingPreference,
      meeting_address: cleanAddress,
      name: cleanName,
      whatsapp: cleanWhatsapp,
      email: cleanEmail,
      notes: cleanNotes,
      ip,
      user_agent: userAgent,
    })
    .select('id')
    .single();

  if (insertError || !insertData) {
    console.error('[/api/quote-request] connect insert error:', insertError);
    return NextResponse.json(
      { error: 'Could not save your request. Try again, or WhatsApp us directly.' },
      { status: 500 },
    );
  }

  await notifyTelegram(
    [
      `💬 *New Connect quote request*`,
      ``,
      `*Tier:* ${tier}`,
      `*Business:* ${businessDescription}`,
      `*Meta Business account today:* ${hasMetaAccount}`,
      `*Enquiries/month:* ${enquiriesPerMonth}`,
      `*Timeline:* ${timeline}`,
      `*Budget:* ${budget}`,
      `*Meeting:* ${meetingPreference}${cleanAddress ? ` — ${cleanAddress}` : ''}`,
      ``,
      `*Name:* ${cleanName}`,
      `*WhatsApp:* ${cleanWhatsapp}`,
      `*Email:* ${cleanEmail}`,
      cleanNotes ? `\n*Notes:*\n${cleanNotes}` : '',
      ``,
      `_via /solutions/connect_`,
    ].join('\n'),
  );

  sendQuoteEmails({
    service: 'connect',
    id: insertData.id,
    name: cleanName,
    email: cleanEmail,
    whatsapp: cleanWhatsapp,
    choice: tier as string,
    rows: [
      { label: 'Your business', value: (businessDescription as string).trim() },
      { label: 'Meta Business account', value: hasMetaAccount as string },
      { label: 'Enquiries a month', value: enquiriesPerMonth as string },
      { label: 'Timeline', value: timeline as string },
      { label: 'Budget', value: budget as string },
      {
        label: 'Meeting',
        value: `${meetingPreference}${cleanAddress ? ` at ${cleanAddress}` : ''}`,
      },
      { label: 'Notes', value: cleanNotes ?? '' },
    ],
  });

  return NextResponse.json({ ok: true, id: insertData.id });
}

const FLOW_TIER_SET = new Set(FLOW_TIER_OPTIONS);
const ACCOUNTING_PACKAGE_SET = new Set(QUOTE_ACCOUNTING_PACKAGE_OPTIONS);
const ADMIN_HOURS_SET = new Set(QUOTE_ADMIN_HOURS_OPTIONS);
const LHDN_STATUS_SET = new Set(QUOTE_LHDN_STATUS_OPTIONS);
const FLOW_TIMELINE_SET = new Set(FLOW_TIMELINE_OPTIONS);
const FLOW_BUDGET_SET = new Set(FLOW_BUDGET_OPTIONS);
const FLOW_MEETING_SET = new Set(FLOW_MEETING_OPTIONS);

async function handleFlowQuote(
  body: Record<string, unknown>,
  ip: string,
  userAgent: string | null,
) {
  const {
    tier,
    businessDescription,
    accountingPackage,
    adminHoursPerWeek,
    lhdnStatus,
    timeline,
    budget,
    meetingPreference,
    meetingAddress,
    name,
    whatsapp,
    email,
    notes,
  } = body;

  const errors: FlowQuoteFieldErrors = {};
  if (typeof tier !== 'string' || !FLOW_TIER_SET.has(tier as never)) {
    errors.tier = 'Please pick a valid Flow tier.';
  }
  if (typeof businessDescription !== 'string' || businessDescription.trim().length === 0) {
    errors.businessDescription = 'Tell us what your business does.';
  }
  if (
    typeof accountingPackage !== 'string' ||
    !ACCOUNTING_PACKAGE_SET.has(accountingPackage as never)
  ) {
    errors.accountingPackage = 'Please pick a valid option.';
  }
  if (typeof adminHoursPerWeek !== 'string' || !ADMIN_HOURS_SET.has(adminHoursPerWeek as never)) {
    errors.adminHoursPerWeek = 'Please pick a valid range.';
  }
  if (typeof lhdnStatus !== 'string' || !LHDN_STATUS_SET.has(lhdnStatus as never)) {
    errors.lhdnStatus = 'Please pick a valid option.';
  }
  if (typeof timeline !== 'string' || !FLOW_TIMELINE_SET.has(timeline as never)) {
    errors.timeline = 'Please pick a valid timeline.';
  }
  if (typeof budget !== 'string' || !FLOW_BUDGET_SET.has(budget as never)) {
    errors.budget = 'Please pick a valid budget.';
  }
  if (typeof meetingPreference !== 'string' || !FLOW_MEETING_SET.has(meetingPreference as never)) {
    errors.meetingPreference = 'Please pick online or face to face.';
  }
  const faceToFace = meetingPreference === 'Face to face';
  if (faceToFace && (typeof meetingAddress !== 'string' || meetingAddress.trim().length === 0)) {
    errors.meetingAddress = 'Tell us where to meet you.';
  }
  if (typeof name !== 'string' || name.trim().length === 0) {
    errors.name = 'Please tell us your name.';
  }
  if (typeof whatsapp !== 'string' || !isValidMalaysianPhone(whatsapp)) {
    errors.whatsapp = 'Enter a valid Malaysian WhatsApp number.';
  }
  if (typeof email !== 'string' || !isValidEmail(email)) {
    errors.email = 'Enter a valid email address.';
  }
  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ errors }, { status: 422 });
  }

  const cleanName = (name as string).trim();
  const cleanEmail = (email as string).trim();
  const cleanWhatsapp = (whatsapp as string).trim();
  const cleanNotes = typeof notes === 'string' && notes.trim() ? notes.trim() : null;
  const cleanAddress = faceToFace ? (meetingAddress as string).trim() : null;

  const { data: insertData, error: insertError } = await supabaseAdmin
    .from('flow_quote_requests')
    .insert({
      tier,
      business_description: (businessDescription as string).trim(),
      accounting_package: accountingPackage,
      admin_hours_per_week: adminHoursPerWeek,
      lhdn_status: lhdnStatus,
      timeline,
      budget,
      meeting_preference: meetingPreference,
      meeting_address: cleanAddress,
      name: cleanName,
      whatsapp: cleanWhatsapp,
      email: cleanEmail,
      notes: cleanNotes,
      ip,
      user_agent: userAgent,
    })
    .select('id')
    .single();

  if (insertError || !insertData) {
    console.error('[/api/quote-request] flow insert error:', insertError);
    return NextResponse.json(
      { error: 'Could not save your request. Try again, or WhatsApp us directly.' },
      { status: 500 },
    );
  }

  await notifyTelegram(
    [
      `⚙️ *New Flow quote request*`,
      ``,
      `*Tier:* ${tier}`,
      `*Business:* ${businessDescription}`,
      `*Accounting package:* ${accountingPackage}`,
      `*Admin hours/week:* ${adminHoursPerWeek}`,
      `*LHDN e-Invoice status:* ${lhdnStatus}`,
      `*Timeline:* ${timeline}`,
      `*Budget:* ${budget}`,
      `*Meeting:* ${meetingPreference}${cleanAddress ? ` — ${cleanAddress}` : ''}`,
      ``,
      `*Name:* ${cleanName}`,
      `*WhatsApp:* ${cleanWhatsapp}`,
      `*Email:* ${cleanEmail}`,
      cleanNotes ? `\n*Notes:*\n${cleanNotes}` : '',
      ``,
      `_via /solutions/flow_`,
    ].join('\n'),
  );

  sendQuoteEmails({
    service: 'flow',
    id: insertData.id,
    name: cleanName,
    email: cleanEmail,
    whatsapp: cleanWhatsapp,
    choice: tier as string,
    rows: [
      { label: 'Your business', value: (businessDescription as string).trim() },
      { label: 'Accounting software', value: accountingPackage as string },
      { label: 'Admin hours a week', value: adminHoursPerWeek as string },
      { label: 'LHDN e-Invoice', value: lhdnStatus as string },
      { label: 'Timeline', value: timeline as string },
      { label: 'Budget', value: budget as string },
      {
        label: 'Meeting',
        value: `${meetingPreference}${cleanAddress ? ` at ${cleanAddress}` : ''}`,
      },
      { label: 'Notes', value: cleanNotes ?? '' },
    ],
  });

  return NextResponse.json({ ok: true, id: insertData.id });
}

const CORE_TIER_SET = new Set(CORE_TIER_OPTIONS);
const SAAS_SPEND_SET = new Set(QUOTE_SAAS_SPEND_OPTIONS);
const BOTTLENECK_SET = new Set(QUOTE_BOTTLENECK_OPTIONS);
const DATA_MIGRATION_SET = new Set(QUOTE_DATA_MIGRATION_OPTIONS);
const CORE_TIMELINE_SET = new Set(CORE_TIMELINE_OPTIONS);
const CORE_BUDGET_SET = new Set(CORE_BUDGET_OPTIONS);
const CORE_MEETING_SET = new Set(CORE_MEETING_OPTIONS);

async function handleCoreQuote(
  body: Record<string, unknown>,
  ip: string,
  userAgent: string | null,
) {
  const {
    tier,
    businessDescription,
    saasSpend,
    bottleneck,
    dataMigration,
    timeline,
    budget,
    meetingPreference,
    meetingAddress,
    name,
    whatsapp,
    email,
    notes,
  } = body;

  const errors: CoreQuoteFieldErrors = {};
  if (typeof tier !== 'string' || !CORE_TIER_SET.has(tier as never)) {
    errors.tier = 'Please pick a valid Core tier.';
  }
  if (typeof businessDescription !== 'string' || businessDescription.trim().length === 0) {
    errors.businessDescription = 'Tell us what your business does.';
  }
  if (typeof saasSpend !== 'string' || !SAAS_SPEND_SET.has(saasSpend as never)) {
    errors.saasSpend = 'Please pick a valid range.';
  }
  if (typeof bottleneck !== 'string' || !BOTTLENECK_SET.has(bottleneck as never)) {
    errors.bottleneck = 'Please pick a valid option.';
  }
  if (typeof dataMigration !== 'string' || !DATA_MIGRATION_SET.has(dataMigration as never)) {
    errors.dataMigration = 'Please pick a valid option.';
  }
  if (typeof timeline !== 'string' || !CORE_TIMELINE_SET.has(timeline as never)) {
    errors.timeline = 'Please pick a valid timeline.';
  }
  if (typeof budget !== 'string' || !CORE_BUDGET_SET.has(budget as never)) {
    errors.budget = 'Please pick a valid budget.';
  }
  if (typeof meetingPreference !== 'string' || !CORE_MEETING_SET.has(meetingPreference as never)) {
    errors.meetingPreference = 'Please pick online or face to face.';
  }
  const faceToFace = meetingPreference === 'Face to face';
  if (faceToFace && (typeof meetingAddress !== 'string' || meetingAddress.trim().length === 0)) {
    errors.meetingAddress = 'Tell us where to meet you.';
  }
  if (typeof name !== 'string' || name.trim().length === 0) {
    errors.name = 'Please tell us your name.';
  }
  if (typeof whatsapp !== 'string' || !isValidMalaysianPhone(whatsapp)) {
    errors.whatsapp = 'Enter a valid Malaysian WhatsApp number.';
  }
  if (typeof email !== 'string' || !isValidEmail(email)) {
    errors.email = 'Enter a valid email address.';
  }
  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ errors }, { status: 422 });
  }

  const cleanName = (name as string).trim();
  const cleanEmail = (email as string).trim();
  const cleanWhatsapp = (whatsapp as string).trim();
  const cleanNotes = typeof notes === 'string' && notes.trim() ? notes.trim() : null;
  const cleanAddress = faceToFace ? (meetingAddress as string).trim() : null;

  const { data: insertData, error: insertError } = await supabaseAdmin
    .from('core_quote_requests')
    .insert({
      tier,
      business_description: (businessDescription as string).trim(),
      saas_spend: saasSpend,
      bottleneck,
      data_migration: dataMigration,
      timeline,
      budget,
      meeting_preference: meetingPreference,
      meeting_address: cleanAddress,
      name: cleanName,
      whatsapp: cleanWhatsapp,
      email: cleanEmail,
      notes: cleanNotes,
      ip,
      user_agent: userAgent,
    })
    .select('id')
    .single();

  if (insertError || !insertData) {
    console.error('[/api/quote-request] core insert error:', insertError);
    return NextResponse.json(
      { error: 'Could not save your request. Try again, or WhatsApp us directly.' },
      { status: 500 },
    );
  }

  await notifyTelegram(
    [
      `🧩 *New Core quote request*`,
      ``,
      `*Tier:* ${tier}`,
      `*Business:* ${businessDescription}`,
      `*Monthly SaaS spend:* ${saasSpend}`,
      `*Biggest bottleneck:* ${bottleneck}`,
      `*Data to migrate:* ${dataMigration}`,
      `*Timeline:* ${timeline}`,
      `*Budget:* ${budget}`,
      `*Meeting:* ${meetingPreference}${cleanAddress ? ` — ${cleanAddress}` : ''}`,
      ``,
      `*Name:* ${cleanName}`,
      `*WhatsApp:* ${cleanWhatsapp}`,
      `*Email:* ${cleanEmail}`,
      cleanNotes ? `\n*Notes:*\n${cleanNotes}` : '',
      ``,
      `_via /solutions/core_`,
    ].join('\n'),
  );

  sendQuoteEmails({
    service: 'core',
    id: insertData.id,
    name: cleanName,
    email: cleanEmail,
    whatsapp: cleanWhatsapp,
    choice: tier as string,
    rows: [
      { label: 'Your business', value: (businessDescription as string).trim() },
      { label: 'Monthly SaaS spend', value: saasSpend as string },
      { label: 'Biggest bottleneck', value: bottleneck as string },
      { label: 'Data to move', value: dataMigration as string },
      { label: 'Timeline', value: timeline as string },
      { label: 'Budget', value: budget as string },
      {
        label: 'Meeting',
        value: `${meetingPreference}${cleanAddress ? ` at ${cleanAddress}` : ''}`,
      },
      { label: 'Notes', value: cleanNotes ?? '' },
    ],
  });

  return NextResponse.json({ ok: true, id: insertData.id });
}

const AUDIT_TIER_SET = new Set(AUDIT_TIER_OPTIONS);
const AI_STAGE_SET = new Set(QUOTE_AI_STAGE_OPTIONS);
const BIGGEST_QUESTION_SET = new Set(QUOTE_BIGGEST_QUESTION_OPTIONS);
const GRANT_INTEREST_SET = new Set(QUOTE_GRANT_INTEREST_OPTIONS);
const AUDIT_MEETING_SET = new Set(AUDIT_MEETING_OPTIONS);

async function handleAuditQuote(
  body: Record<string, unknown>,
  ip: string,
  userAgent: string | null,
) {
  const {
    tier,
    businessDescription,
    aiStage,
    biggestQuestion,
    grantInterest,
    meetingPreference,
    meetingAddress,
    name,
    whatsapp,
    email,
    notes,
  } = body;

  const errors: AuditQuoteFieldErrors = {};
  if (typeof tier !== 'string' || !AUDIT_TIER_SET.has(tier as never)) {
    errors.tier = 'Please pick a valid audit tier.';
  }
  if (typeof businessDescription !== 'string' || businessDescription.trim().length === 0) {
    errors.businessDescription = 'Tell us what your business does.';
  }
  if (typeof aiStage !== 'string' || !AI_STAGE_SET.has(aiStage as never)) {
    errors.aiStage = 'Please pick a valid option.';
  }
  if (typeof biggestQuestion !== 'string' || !BIGGEST_QUESTION_SET.has(biggestQuestion as never)) {
    errors.biggestQuestion = 'Please pick a valid option.';
  }
  if (typeof grantInterest !== 'string' || !GRANT_INTEREST_SET.has(grantInterest as never)) {
    errors.grantInterest = 'Please pick a valid option.';
  }
  if (typeof meetingPreference !== 'string' || !AUDIT_MEETING_SET.has(meetingPreference as never)) {
    errors.meetingPreference = 'Please pick online or face to face.';
  }
  const faceToFace = meetingPreference === 'Face to face';
  if (faceToFace && (typeof meetingAddress !== 'string' || meetingAddress.trim().length === 0)) {
    errors.meetingAddress = 'Tell us where to meet you.';
  }
  if (typeof name !== 'string' || name.trim().length === 0) {
    errors.name = 'Please tell us your name.';
  }
  if (typeof whatsapp !== 'string' || !isValidMalaysianPhone(whatsapp)) {
    errors.whatsapp = 'Enter a valid Malaysian WhatsApp number.';
  }
  if (typeof email !== 'string' || !isValidEmail(email)) {
    errors.email = 'Enter a valid email address.';
  }
  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ errors }, { status: 422 });
  }

  const cleanName = (name as string).trim();
  const cleanEmail = (email as string).trim();
  const cleanWhatsapp = (whatsapp as string).trim();
  const cleanNotes = typeof notes === 'string' && notes.trim() ? notes.trim() : null;
  const cleanAddress = faceToFace ? (meetingAddress as string).trim() : null;

  const { data: insertData, error: insertError } = await supabaseAdmin
    .from('ai_readiness_audit_quote_requests')
    .insert({
      tier,
      business_description: (businessDescription as string).trim(),
      ai_stage: aiStage,
      biggest_question: biggestQuestion,
      grant_interest: grantInterest,
      meeting_preference: meetingPreference,
      meeting_address: cleanAddress,
      name: cleanName,
      whatsapp: cleanWhatsapp,
      email: cleanEmail,
      notes: cleanNotes,
      ip,
      user_agent: userAgent,
    })
    .select('id')
    .single();

  if (insertError || !insertData) {
    console.error('[/api/quote-request] ai-readiness-audit insert error:', insertError);
    return NextResponse.json(
      { error: 'Could not save your request. Try again, or WhatsApp us directly.' },
      { status: 500 },
    );
  }

  await notifyTelegram(
    [
      `🧠 *New AI Readiness Audit request*`,
      ``,
      `*Tier:* ${tier}`,
      `*Business:* ${businessDescription}`,
      `*Where they are with AI:* ${aiStage}`,
      `*Biggest question:* ${biggestQuestion}`,
      `*Wants grant screening:* ${grantInterest}`,
      `*Meeting:* ${meetingPreference}${cleanAddress ? ` — ${cleanAddress}` : ''}`,
      ``,
      `*Name:* ${cleanName}`,
      `*WhatsApp:* ${cleanWhatsapp}`,
      `*Email:* ${cleanEmail}`,
      cleanNotes ? `\n*Notes:*\n${cleanNotes}` : '',
      ``,
      `_via /solutions/ai-readiness-audit_`,
    ].join('\n'),
  );

  sendQuoteEmails({
    service: 'audit',
    id: insertData.id,
    name: cleanName,
    email: cleanEmail,
    whatsapp: cleanWhatsapp,
    choice: tier as string,
    rows: [
      { label: 'Your business', value: (businessDescription as string).trim() },
      { label: 'Where you are with AI', value: aiStage as string },
      { label: 'Biggest question', value: biggestQuestion as string },
      { label: 'Grant screening', value: grantInterest as string },
      {
        label: 'Meeting',
        value: `${meetingPreference}${cleanAddress ? ` at ${cleanAddress}` : ''}`,
      },
      { label: 'Notes', value: cleanNotes ?? '' },
    ],
  });

  return NextResponse.json({ ok: true, id: insertData.id });
}

export async function POST(request: NextRequest) {
  const ip = clientIp(request);
  if (rateLimited(`quote:${ip}`, RATE_LIMIT, RATE_WINDOW_MS)) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait a while and try again, or WhatsApp us directly.' },
      { status: 429 },
    );
  }

  try {
    const raw = (await request.json()) as Record<string, unknown>;
    if (isHoneypot(raw)) return NextResponse.json({ ok: true });
    const body = Object.fromEntries(
      Object.entries(raw).map(([k, v]) => [k, typeof v === 'string' ? v.slice(0, MAX_TEXT) : v]),
    );
    if (typeof body.email === 'string' && rateLimited(`quote-email:${body.email.trim().toLowerCase()}`, RATE_LIMIT, RATE_WINDOW_MS)) {
      return NextResponse.json({ ok: true });
    }
    const userAgent = request.headers.get('user-agent') || null;
    const service = typeof body.service === 'string' ? body.service : 'presence';

    if (service === 'connect') {
      return await handleConnectQuote(body, ip, userAgent);
    }
    if (service === 'flow') {
      return await handleFlowQuote(body, ip, userAgent);
    }
    if (service === 'core') {
      return await handleCoreQuote(body, ip, userAgent);
    }
    if (service === 'ai-readiness-audit') {
      return await handleAuditQuote(body, ip, userAgent);
    }
    if (service === 'presence') {
      return await handlePresenceQuote(body, ip, userAgent);
    }
    return NextResponse.json({ error: 'Unknown quote request service.' }, { status: 400 });
  } catch (err) {
    console.error('[/api/quote-request] unexpected error:', err);
    return NextResponse.json(
      { error: 'Something went wrong. Try WhatsApp instead.' },
      { status: 500 },
    );
  }
}
