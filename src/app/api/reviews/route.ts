// src/app/api/reviews/route.ts
// Public review submission from the homepage. Always saved as 'pending' — an
// admin approves it in /admin/reviews before it's shown anywhere.
import { after, NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { sendEmail, SITE_URL, TEAM_INBOX } from '@/lib/email/send';
import { reviewThanks, teamLeadAlert } from '@/lib/email/templates';

export const runtime = 'nodejs';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

const AVATARS = new Set([
  'cyan',
  'violet',
  'emerald',
  'amber',
  'cyan-violet',
  'amber-emerald',
  'silver',
  'constellation',
]);
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

// In-memory, per-instance — blunts casual spam; not a hard guarantee.
const rateMap = new Map<string, { count: number; resetAt: number }>();
function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateMap.set(ip, { count: 1, resetAt: now + 60 * 60 * 1000 });
    return false;
  }
  entry.count++;
  return entry.count > 3;
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: 'Too many reviews from here. Please try again later.' },
      { status: 429 },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  // Honeypot filled → pretend success so bots don't retry.
  if (typeof body.website === 'string' && body.website.trim())
    return NextResponse.json({ ok: true });

  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const role = typeof body.role === 'string' ? body.role.trim() : '';
  const content = typeof body.content === 'string' ? body.content.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim() : '';
  const rating = Number(body.rating);
  const avatarKey =
    typeof body.avatarKey === 'string' && AVATARS.has(body.avatarKey) ? body.avatarKey : 'cyan';

  const errors: Record<string, string> = {};
  if (!name || name.length > 80) errors.name = 'Please add your name or business.';
  if (content.length < 8) errors.content = 'Please write at least a sentence.';
  if (content.length > 320) errors.content = 'Please keep it under 320 characters.';
  if (!Number.isInteger(rating) || rating < 1 || rating > 5)
    errors.form = 'Please pick a star rating.';
  if (email && !EMAIL_RE.test(email)) errors.email = 'That email doesn’t look right.';
  if (Object.keys(errors).length) return NextResponse.json({ errors }, { status: 422 });

  const { error } = await supabaseAdmin.from('reviews').insert({
    name,
    role: role.slice(0, 80),
    content,
    rating,
    avatar_key: avatarKey,
    email: email || null,
    status: 'pending',
  });
  if (error) {
    console.error('[/api/reviews] insert error:', error.message);
    return NextResponse.json(
      { error: 'Couldn’t save your review. Please try again.' },
      { status: 500 },
    );
  }

  after(() =>
    Promise.all([
      email ? sendEmail(email, reviewThanks({ name })) : null,
      sendEmail(
        TEAM_INBOX,
        teamLeadAlert({
          source: 'Review',
          name,
          email: email || 'not given',
          rows: [
            { label: 'Rating', value: '★'.repeat(rating) + '☆'.repeat(5 - rating) },
            { label: 'Role', value: role },
            { label: 'Review', value: content },
          ],
          adminUrl: `${SITE_URL}/admin/reviews`,
          ctaLabel: 'Approve or reject',
          accent: '#F0C88F',
        }),
        email || undefined,
      ),
    ]),
  );

  if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
    const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating);
    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: `⭐ New review waiting for approval\n\n${stars}\n“${content}”\n— ${name}${role ? `, ${role}` : ''}\n\nApprove it in /admin/reviews`,
      }),
    }).catch((err) => console.error('[/api/reviews] telegram failed:', err));
  }

  return NextResponse.json({ ok: true });
}
