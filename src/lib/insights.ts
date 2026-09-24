// src/lib/insights.ts
// Read path for insights_posts — the seam the future admin panel writes to.
// Always published-only: a draft's slug returns nothing here, even if guessed.
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase/server';
import type { InsightPost } from '@/types/insights';

export async function getInsightPosts(): Promise<InsightPost[]> {
  if (!isSupabaseConfigured()) return [];

  const { data, error } = await supabaseAdmin
    .from('insights_posts')
    .select('*')
    .eq('status', 'published')
    .order('published_at', { ascending: false });

  if (error) {
    console.error('[insights] getInsightPosts error:', error);
    return [];
  }
  return (data ?? []) as InsightPost[];
}

export async function getInsightPostBySlug(slug: string): Promise<InsightPost | null> {
  if (!isSupabaseConfigured()) return null;

  const { data, error } = await supabaseAdmin
    .from('insights_posts')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle();

  if (error) {
    console.error('[insights] getInsightPostBySlug error:', error);
    return null;
  }
  return (data as InsightPost | null) ?? null;
}
