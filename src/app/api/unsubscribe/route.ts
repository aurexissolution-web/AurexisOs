// src/app/api/unsubscribe/route.ts
// POST only: the unsubscribe page and the one-tap button in mail apps call this.
// The token is a random UUID that only ever appears in that subscriber's own emails.
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('t') ?? '';
  if (!UUID_RE.test(token)) return NextResponse.json({ error: 'Invalid link.' }, { status: 400 });
  const { error } = await supabaseAdmin
    .from('subscribers')
    .update({ status: 'unsubscribed', unsubscribed_at: new Date().toISOString(), next_send_at: null })
    .eq('unsub_token', token);
  if (error) return NextResponse.json({ error: 'Could not unsubscribe right now.' }, { status: 500 });
  return NextResponse.json({ ok: true });
}
