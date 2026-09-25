// src/lib/case-studies.ts
// Read path for case_studies — published rows only. The admin panel writes
// them; /work and /work/[slug] read through here.
import 'server-only';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase/server';
import type { CaseStudy } from '@/types/case-study';

type Row = Record<string, unknown>;

function toCaseStudy(r: Row): CaseStudy {
  return {
    slug: String(r.slug),
    clientName: String(r.client_name ?? ''),
    industry: String(r.industry ?? ''),
    outcomeHeadline: String(r.outcome_headline ?? ''),
    problem: String(r.problem ?? ''),
    whatWasBuilt: String(r.what_was_built ?? ''),
    result: String(r.result ?? ''),
    screenshotUrl: (r.cover_image_url as string) || undefined,
    summary: String(r.summary ?? ''),
    location: String(r.location ?? ''),
    metrics: Array.isArray(r.metrics) ? (r.metrics as CaseStudy['metrics']) : [],
    services: (r.services as string[]) ?? [],
    techTags: (r.tech_tags as string[]) ?? [],
    timeline: String(r.timeline ?? ''),
    liveUrl: (r.live_url as string) ?? null,
    gallery: (r.gallery as string[]) ?? [],
    testimonialQuote: String(r.testimonial_quote ?? ''),
    testimonialAuthor: String(r.testimonial_author ?? ''),
  };
}

export async function getCaseStudies(): Promise<CaseStudy[]> {
  if (!isSupabaseConfigured()) return [];
  const { data, error } = await supabaseAdmin
    .from('case_studies')
    .select('*')
    .eq('status', 'published')
    .order('featured', { ascending: false })
    .order('display_order', { ascending: true })
    .order('published_at', { ascending: false });
  if (error) {
    console.error('[case-studies] list error:', error.message);
    return [];
  }
  return (data ?? []).map(toCaseStudy);
}

export async function getCaseStudyBySlug(slug: string): Promise<CaseStudy | null> {
  if (!isSupabaseConfigured()) return null;
  const { data, error } = await supabaseAdmin
    .from('case_studies')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle();
  if (error) {
    console.error('[case-studies] get error:', error.message);
    return null;
  }
  return data ? toCaseStudy(data) : null;
}
