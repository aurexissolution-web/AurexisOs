'use server';

// src/app/admin/actions.ts
// Every mutation the admin panel can make. Each one calls requireAdmin()
// first — server actions are public HTTP endpoints, so the UI hiding a button
// is never the protection.
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createAuthClient } from '@/lib/supabase/ssr';
import { supabaseAdmin } from '@/lib/supabase/server';
import { getAdminUser, requireAdmin } from '@/lib/auth/admin';
import {
  SOURCE_BY_KEY,
  isLeadSourceKey,
  isLeadStatus,
  type LeadSourceKey,
  type LeadStatus,
} from '@/lib/admin/lead-sources';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

type Result = { ok: true } | { ok: false; error: string };

function assertId(id: unknown): asserts id is string {
  if (typeof id !== 'string' || !UUID_RE.test(id)) throw new Error('Invalid id');
}

// ── Auth ─────────────────────────────────────────────────────────────────────

export async function signIn(
  _prev: { error?: string } | undefined,
  formData: FormData,
): Promise<{ error?: string }> {
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');
  if (!email || !password) return { error: 'Enter your email and password.' };

  const supabase = await createAuthClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: 'That email and password don’t match an account.' };

  if (!(await getAdminUser())) {
    await supabase.auth.signOut();
    return { error: 'This account doesn’t have admin access.' };
  }
  redirect('/admin');
}

export async function signOut() {
  const supabase = await createAuthClient();
  await supabase.auth.signOut();
  redirect('/admin/login');
}

// ── Command Center ───────────────────────────────────────────────────────────

export async function updateLeadStatus(
  source: LeadSourceKey,
  id: string,
  status: LeadStatus,
): Promise<Result> {
  await requireAdmin();
  if (!isLeadSourceKey(source) || !isLeadStatus(status)) return { ok: false, error: 'Invalid input' };
  assertId(id);

  const patch: Record<string, unknown> = { status, updated_at: new Date().toISOString() };
  if (status === 'contacted') patch.contacted_at = new Date().toISOString();

  const { error } = await supabaseAdmin.from(SOURCE_BY_KEY[source].table).update(patch).eq('id', id);
  if (error) return { ok: false, error: error.message };
  revalidatePath('/admin', 'layout');
  return { ok: true };
}

export async function saveLeadNotes(source: LeadSourceKey, id: string, notes: string): Promise<Result> {
  await requireAdmin();
  if (!isLeadSourceKey(source)) return { ok: false, error: 'Invalid input' };
  assertId(id);

  const { error } = await supabaseAdmin
    .from(SOURCE_BY_KEY[source].table)
    .update({ admin_notes: String(notes).slice(0, 4000), updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) return { ok: false, error: error.message };
  revalidatePath('/admin/command');
  return { ok: true };
}

// ── Reviews ──────────────────────────────────────────────────────────────────

export async function setReviewStatus(
  id: string,
  status: 'pending' | 'approved' | 'rejected',
): Promise<Result> {
  await requireAdmin();
  assertId(id);
  if (!['pending', 'approved', 'rejected'].includes(status)) return { ok: false, error: 'Invalid status' };

  const { error } = await supabaseAdmin
    .from('reviews')
    .update({
      status,
      approved_at: status === 'approved' ? new Date().toISOString() : null,
      ...(status !== 'approved' ? { featured: false } : {}),
    })
    .eq('id', id);
  if (error) return { ok: false, error: error.message };
  revalidatePath('/');
  revalidatePath('/admin', 'layout');
  return { ok: true };
}

export async function setReviewFeatured(id: string, featured: boolean): Promise<Result> {
  await requireAdmin();
  assertId(id);
  const { error } = await supabaseAdmin
    .from('reviews')
    .update({ featured: Boolean(featured) })
    .eq('id', id)
    .eq('status', 'approved');
  if (error) return { ok: false, error: error.message };
  revalidatePath('/');
  revalidatePath('/admin/reviews');
  return { ok: true };
}

export async function deleteReview(id: string): Promise<Result> {
  await requireAdmin();
  assertId(id);
  const { error } = await supabaseAdmin.from('reviews').delete().eq('id', id);
  if (error) return { ok: false, error: error.message };
  revalidatePath('/');
  revalidatePath('/admin', 'layout');
  return { ok: true };
}

// ── Image uploads (insights + work) ──────────────────────────────────────────

const IMAGE_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
};

export async function uploadImage(
  formData: FormData,
): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  await requireAdmin();
  const file = formData.get('file');
  const folder = formData.get('folder') === 'work' ? 'work' : 'insights';
  if (!(file instanceof File)) return { ok: false, error: 'No file' };
  const ext = IMAGE_TYPES[file.type];
  if (!ext) return { ok: false, error: 'Use a JPG, PNG, WebP or AVIF image.' };
  if (file.size > 5 * 1024 * 1024) return { ok: false, error: 'Images must be under 5 MB.' };

  const path = `${folder}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;
  const { error } = await supabaseAdmin.storage
    .from('site-media')
    .upload(path, file, { contentType: file.type, cacheControl: '31536000' });
  if (error) return { ok: false, error: error.message };

  const { data } = supabaseAdmin.storage.from('site-media').getPublicUrl(path);
  return { ok: true, url: data.publicUrl };
}

// ── Insight Booster ──────────────────────────────────────────────────────────

export interface InsightInput {
  id?: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  coverImageUrl: string | null;
  status: 'draft' | 'published';
  publishedAt: string | null;
}

export async function saveInsight(
  input: InsightInput,
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  await requireAdmin();
  const title = String(input.title ?? '').trim();
  const slug = String(input.slug ?? '').trim();
  const excerpt = String(input.excerpt ?? '').trim();
  const body = String(input.body ?? '');
  if (!title) return { ok: false, error: 'Give the post a title.' };
  if (!SLUG_RE.test(slug)) return { ok: false, error: 'The URL can only use lowercase letters, numbers and dashes.' };
  if (input.status === 'published' && (!excerpt || body.trim().length < 20)) {
    return { ok: false, error: 'A published post needs an excerpt and a body.' };
  }

  const row = {
    slug,
    title: title.slice(0, 200),
    excerpt: excerpt.slice(0, 400),
    body,
    cover_image_url: input.coverImageUrl || null,
    status: input.status === 'published' ? 'published' : 'draft',
    published_at: input.publishedAt || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  let id = input.id;
  if (id) {
    assertId(id);
    const { error } = await supabaseAdmin.from('insights_posts').update(row).eq('id', id);
    if (error) return { ok: false, error: error.code === '23505' ? 'That URL is already used by another post.' : error.message };
  } else {
    const { data, error } = await supabaseAdmin.from('insights_posts').insert(row).select('id').single();
    if (error) return { ok: false, error: error.code === '23505' ? 'That URL is already used by another post.' : error.message };
    id = data.id as string;
  }

  revalidatePath('/insights');
  revalidatePath(`/insights/${slug}`);
  revalidatePath('/admin', 'layout');
  return { ok: true, id: id! };
}

export async function deleteInsight(id: string): Promise<Result> {
  await requireAdmin();
  assertId(id);
  const { error } = await supabaseAdmin.from('insights_posts').delete().eq('id', id);
  if (error) return { ok: false, error: error.message };
  revalidatePath('/insights');
  revalidatePath('/admin', 'layout');
  return { ok: true };
}

// ── Work Files ───────────────────────────────────────────────────────────────

export interface CaseStudyInput {
  id?: string;
  slug: string;
  clientName: string;
  industry: string;
  location: string;
  outcomeHeadline: string;
  summary: string;
  problem: string;
  whatWasBuilt: string;
  result: string;
  metrics: { value: string; label: string }[];
  services: string[];
  techTags: string[];
  timeline: string;
  liveUrl: string;
  coverImageUrl: string | null;
  gallery: string[];
  testimonialQuote: string;
  testimonialAuthor: string;
  status: 'draft' | 'published';
  featured: boolean;
  displayOrder: number;
}

const SERVICES = new Set(['presence', 'flow', 'core', 'connect', 'audit']);
const clean = (v: unknown, max = 5000) => String(v ?? '').trim().slice(0, max);
const cleanList = (v: unknown, max = 20) =>
  (Array.isArray(v) ? v : []).map((x) => clean(x, 300)).filter(Boolean).slice(0, max);

export async function saveCaseStudy(
  input: CaseStudyInput,
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  await requireAdmin();
  const slug = clean(input.slug, 120);
  const clientName = clean(input.clientName, 160);
  const outcomeHeadline = clean(input.outcomeHeadline, 240);
  if (!clientName) return { ok: false, error: 'Add the client name.' };
  if (!outcomeHeadline) return { ok: false, error: 'Add an outcome headline.' };
  if (!SLUG_RE.test(slug)) return { ok: false, error: 'The URL can only use lowercase letters, numbers and dashes.' };

  const liveUrl = clean(input.liveUrl, 500);
  if (liveUrl && !/^https?:\/\//i.test(liveUrl)) return { ok: false, error: 'The live site link must start with https://' };

  const status = input.status === 'published' ? 'published' : 'draft';
  const row = {
    slug,
    client_name: clientName,
    industry: clean(input.industry, 120),
    location: clean(input.location, 120),
    outcome_headline: outcomeHeadline,
    summary: clean(input.summary, 600),
    problem: clean(input.problem),
    what_was_built: clean(input.whatWasBuilt),
    result: clean(input.result),
    metrics: (Array.isArray(input.metrics) ? input.metrics : [])
      .map((m) => ({ value: clean(m?.value, 40), label: clean(m?.label, 80) }))
      .filter((m) => m.value && m.label)
      .slice(0, 4),
    services: cleanList(input.services).filter((s) => SERVICES.has(s)),
    tech_tags: cleanList(input.techTags, 16),
    timeline: clean(input.timeline, 80),
    live_url: liveUrl || null,
    cover_image_url: input.coverImageUrl || null,
    gallery: cleanList(input.gallery, 12),
    testimonial_quote: clean(input.testimonialQuote, 600),
    testimonial_author: clean(input.testimonialAuthor, 160),
    status,
    featured: Boolean(input.featured),
    display_order: Number.isFinite(Number(input.displayOrder)) ? Math.trunc(Number(input.displayOrder)) : 0,
    updated_at: new Date().toISOString(),
  };

  let id = input.id;
  if (id) {
    assertId(id);
    const { data: existing } = await supabaseAdmin
      .from('case_studies')
      .select('published_at')
      .eq('id', id)
      .maybeSingle();
    const publishedAt = status === 'published' ? existing?.published_at ?? new Date().toISOString() : existing?.published_at ?? null;
    const { error } = await supabaseAdmin
      .from('case_studies')
      .update({ ...row, published_at: publishedAt })
      .eq('id', id);
    if (error) return { ok: false, error: error.code === '23505' ? 'That URL is already used by another case study.' : error.message };
  } else {
    const { data, error } = await supabaseAdmin
      .from('case_studies')
      .insert({ ...row, published_at: status === 'published' ? new Date().toISOString() : null })
      .select('id')
      .single();
    if (error) return { ok: false, error: error.code === '23505' ? 'That URL is already used by another case study.' : error.message };
    id = data.id as string;
  }

  revalidatePath('/work');
  revalidatePath(`/work/${slug}`);
  revalidatePath('/admin', 'layout');
  return { ok: true, id: id! };
}

export async function deleteCaseStudy(id: string): Promise<Result> {
  await requireAdmin();
  assertId(id);
  const { error } = await supabaseAdmin.from('case_studies').delete().eq('id', id);
  if (error) return { ok: false, error: error.message };
  revalidatePath('/work');
  revalidatePath('/admin', 'layout');
  return { ok: true };
}
