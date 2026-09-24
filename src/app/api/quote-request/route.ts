// src/app/api/quote-request/route.ts
// Shared endpoint for every "Get a Quote" form on the site. The `service`
// field in the request body picks which validation, table and copy apply —
// add a new branch here when a new solutions page gets its own quote form.
import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { supabaseAdmin } from '@/lib/supabase/server';
import { isValidEmail, isValidMalaysianPhone } from '@/lib/lead-validation';
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
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const LEAD_FROM_EMAIL = process.env.LEAD_FROM_EMAIL || 'Aurexis Leads <onboarding@resend.dev>';

// In-memory, per-instance — resets on cold start / redeploy and isn't shared
// across serverless instances. Good enough to blunt casual abuse; not a hard
// guarantee under multi-instance load. Shared across every service on this route.
const rateMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 3;
const RATE_WINDOW_MS = 60 * 60 * 1000;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }
  entry.count++;
  return entry.count > RATE_LIMIT;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

async function notifyTelegram(text: string) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) return;
  try {
    const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text, parse_mode: 'Markdown' }),
    });
    if (!res.ok) {
      console.error('[/api/quote-request] telegram non-ok:', await res.text());
    }
  } catch (err) {
    console.error('[/api/quote-request] telegram fetch failed:', err);
  }
}

async function sendConfirmationEmail(opts: {
  to: string;
  subject: string;
  eyebrow: string;
  heading: string;
  bodyHtml: string;
  bodyText: string;
}) {
  if (!RESEND_API_KEY) {
    console.warn('[/api/quote-request] RESEND_API_KEY not set — confirmation email not sent.');
    return;
  }
  try {
    const resend = new Resend(RESEND_API_KEY);
    const { error } = await resend.emails.send({
      from: LEAD_FROM_EMAIL,
      to: opts.to,
      subject: opts.subject,
      html: `<!doctype html>
<html><body style="margin:0;padding:0;background:#02040A;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#f5f5f7;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#02040A;padding:24px 16px;">
    <tr><td align="center">
      <table role="presentation" width="520" cellpadding="0" cellspacing="0" border="0" style="max-width:520px;background:#0A0B12;border:1px solid rgba(255,255,255,0.08);border-radius:14px;overflow:hidden;">
        <tr><td style="padding:28px 28px 20px;">
          <div style="font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:10px;letter-spacing:0.28em;text-transform:uppercase;color:rgba(94,227,218,0.9);">
            ${escapeHtml(opts.eyebrow)}
          </div>
          <h1 style="font-family:Georgia,serif;font-style:italic;font-size:24px;font-weight:400;color:#fff;margin:10px 0 0;letter-spacing:-0.01em;">
            ${opts.heading}
          </h1>
        </td></tr>
        <tr><td style="padding:0 28px 28px;">
          ${opts.bodyHtml}
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`,
      text: opts.bodyText,
    });
    if (error) {
      console.error('[/api/quote-request] Resend error:', error);
    }
  } catch (err) {
    console.error('[/api/quote-request] Resend exception:', err);
  }
}

const WEBSITE_TYPE_SET = new Set(QUOTE_WEBSITE_TYPE_OPTIONS);
const HAS_WEBSITE_SET = new Set(QUOTE_HAS_WEBSITE_OPTIONS);
const PRESENCE_TIMELINE_SET = new Set(PRESENCE_TIMELINE_OPTIONS);
const PRESENCE_BUDGET_SET = new Set(PRESENCE_BUDGET_OPTIONS);
const MEETING_SET = new Set(QUOTE_MEETING_OPTIONS);

async function handlePresenceQuote(body: Record<string, unknown>, ip: string, userAgent: string | null) {
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

  await sendConfirmationEmail({
    to: cleanEmail,
    subject: 'We received your quote request',
    eyebrow: 'Aurexis · Presence',
    heading: `Thanks, ${escapeHtml(cleanName)} — we&rsquo;ve got it.`,
    bodyHtml: `<p style="font-size:14px;line-height:1.6;color:rgba(255,255,255,0.65);margin:0 0 12px;">
            We received your quote request for a <b style="color:#fff;">${escapeHtml(websiteType as string)}</b>.
            We&rsquo;ll review what you&rsquo;ve sent and WhatsApp you at ${escapeHtml(cleanWhatsapp)} within a business day to book a short call.
          </p>
          <p style="font-size:13px;line-height:1.6;color:rgba(255,255,255,0.4);margin:0;">
            In a hurry? Message us directly on WhatsApp: +60 16-407 1129.
          </p>`,
    bodyText: `Thanks, ${cleanName} — we've got it.\n\nWe received your quote request for a ${websiteType}. We'll review what you've sent and WhatsApp you at ${cleanWhatsapp} within a business day to book a short call.\n\nIn a hurry? Message us on WhatsApp: +60 16-407 1129.`,
  });

  return NextResponse.json({ ok: true, id: insertData.id });
}

const TIER_SET = new Set(QUOTE_TIER_OPTIONS);
const HAS_META_SET = new Set(QUOTE_HAS_META_OPTIONS);
const ENQUIRY_VOLUME_SET = new Set(QUOTE_ENQUIRY_VOLUME_OPTIONS);
const CONNECT_TIMELINE_SET = new Set(CONNECT_TIMELINE_OPTIONS);
const CONNECT_BUDGET_SET = new Set(CONNECT_BUDGET_OPTIONS);
const CONNECT_MEETING_SET = new Set(CONNECT_MEETING_OPTIONS);

async function handleConnectQuote(body: Record<string, unknown>, ip: string, userAgent: string | null) {
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
  if (typeof enquiriesPerMonth !== 'string' || !ENQUIRY_VOLUME_SET.has(enquiriesPerMonth as never)) {
    errors.enquiriesPerMonth = 'Please pick a valid range.';
  }
  if (typeof timeline !== 'string' || !CONNECT_TIMELINE_SET.has(timeline as never)) {
    errors.timeline = 'Please pick a valid timeline.';
  }
  if (typeof budget !== 'string' || !CONNECT_BUDGET_SET.has(budget as never)) {
    errors.budget = 'Please pick a valid budget.';
  }
  if (typeof meetingPreference !== 'string' || !CONNECT_MEETING_SET.has(meetingPreference as never)) {
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

  await sendConfirmationEmail({
    to: cleanEmail,
    subject: 'We received your Connect quote request',
    eyebrow: 'Aurexis · Connect',
    heading: `Thanks, ${escapeHtml(cleanName)} — we&rsquo;ve got it.`,
    bodyHtml: `<p style="font-size:14px;line-height:1.6;color:rgba(255,255,255,0.65);margin:0 0 12px;">
            We received your Connect quote request for the <b style="color:#fff;">${escapeHtml(tier as string)}</b> tier.
            We&rsquo;ll review what you&rsquo;ve sent and WhatsApp you at ${escapeHtml(cleanWhatsapp)} within a business day to book a short call.
          </p>
          <p style="font-size:13px;line-height:1.6;color:rgba(255,255,255,0.4);margin:0;">
            In a hurry? Message us directly on WhatsApp: +60 16-407 1129.
          </p>`,
    bodyText: `Thanks, ${cleanName} — we've got it.\n\nWe received your Connect quote request for the ${tier} tier. We'll review what you've sent and WhatsApp you at ${cleanWhatsapp} within a business day to book a short call.\n\nIn a hurry? Message us on WhatsApp: +60 16-407 1129.`,
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

async function handleFlowQuote(body: Record<string, unknown>, ip: string, userAgent: string | null) {
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
  if (typeof accountingPackage !== 'string' || !ACCOUNTING_PACKAGE_SET.has(accountingPackage as never)) {
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

  await sendConfirmationEmail({
    to: cleanEmail,
    subject: 'We received your Flow quote request',
    eyebrow: 'Aurexis · Flow',
    heading: `Thanks, ${escapeHtml(cleanName)} — we&rsquo;ve got it.`,
    bodyHtml: `<p style="font-size:14px;line-height:1.6;color:rgba(255,255,255,0.65);margin:0 0 12px;">
            We received your Flow quote request for the <b style="color:#fff;">${escapeHtml(tier as string)}</b> tier.
            We&rsquo;ll review what you&rsquo;ve sent and WhatsApp you at ${escapeHtml(cleanWhatsapp)} within a business day to book a short call.
          </p>
          <p style="font-size:13px;line-height:1.6;color:rgba(255,255,255,0.4);margin:0;">
            In a hurry? Message us directly on WhatsApp: +60 16-407 1129.
          </p>`,
    bodyText: `Thanks, ${cleanName} — we've got it.\n\nWe received your Flow quote request for the ${tier} tier. We'll review what you've sent and WhatsApp you at ${cleanWhatsapp} within a business day to book a short call.\n\nIn a hurry? Message us on WhatsApp: +60 16-407 1129.`,
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

async function handleCoreQuote(body: Record<string, unknown>, ip: string, userAgent: string | null) {
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

  await sendConfirmationEmail({
    to: cleanEmail,
    subject: 'We received your Core quote request',
    eyebrow: 'Aurexis · Core',
    heading: `Thanks, ${escapeHtml(cleanName)} — we&rsquo;ve got it.`,
    bodyHtml: `<p style="font-size:14px;line-height:1.6;color:rgba(255,255,255,0.65);margin:0 0 12px;">
            We received your Core quote request for the <b style="color:#fff;">${escapeHtml(tier as string)}</b> tier.
            We&rsquo;ll review what you&rsquo;ve sent and WhatsApp you at ${escapeHtml(cleanWhatsapp)} within a business day to book a discovery call.
          </p>
          <p style="font-size:13px;line-height:1.6;color:rgba(255,255,255,0.4);margin:0;">
            In a hurry? Message us directly on WhatsApp: +60 16-407 1129.
          </p>`,
    bodyText: `Thanks, ${cleanName} — we've got it.\n\nWe received your Core quote request for the ${tier} tier. We'll review what you've sent and WhatsApp you at ${cleanWhatsapp} within a business day to book a discovery call.\n\nIn a hurry? Message us on WhatsApp: +60 16-407 1129.`,
  });

  return NextResponse.json({ ok: true, id: insertData.id });
}

const AUDIT_TIER_SET = new Set(AUDIT_TIER_OPTIONS);
const AI_STAGE_SET = new Set(QUOTE_AI_STAGE_OPTIONS);
const BIGGEST_QUESTION_SET = new Set(QUOTE_BIGGEST_QUESTION_OPTIONS);
const GRANT_INTEREST_SET = new Set(QUOTE_GRANT_INTEREST_OPTIONS);
const AUDIT_MEETING_SET = new Set(AUDIT_MEETING_OPTIONS);

async function handleAuditQuote(body: Record<string, unknown>, ip: string, userAgent: string | null) {
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

  await sendConfirmationEmail({
    to: cleanEmail,
    subject: 'We received your AI Readiness Audit request',
    eyebrow: 'Aurexis · AI Readiness Audit',
    heading: `Thanks, ${escapeHtml(cleanName)} — we&rsquo;ve got it.`,
    bodyHtml: `<p style="font-size:14px;line-height:1.6;color:rgba(255,255,255,0.65);margin:0 0 12px;">
            We received your request for the <b style="color:#fff;">${escapeHtml(tier as string)}</b> AI Readiness Audit.
            We&rsquo;ll review what you&rsquo;ve sent and WhatsApp you at ${escapeHtml(cleanWhatsapp)} within a business day to confirm scope and start the audit.
          </p>
          <p style="font-size:13px;line-height:1.6;color:rgba(255,255,255,0.4);margin:0;">
            In a hurry? Message us directly on WhatsApp: +60 16-407 1129.
          </p>`,
    bodyText: `Thanks, ${cleanName} — we've got it.\n\nWe received your request for the ${tier} AI Readiness Audit. We'll review what you've sent and WhatsApp you at ${cleanWhatsapp} within a business day to confirm scope and start the audit.\n\nIn a hurry? Message us on WhatsApp: +60 16-407 1129.`,
  });

  return NextResponse.json({ ok: true, id: insertData.id });
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait a while and try again, or WhatsApp us directly.' },
      { status: 429 },
    );
  }

  try {
    const body = (await request.json()) as Record<string, unknown>;
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
