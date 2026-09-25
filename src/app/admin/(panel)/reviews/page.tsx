// src/app/admin/(panel)/reviews/page.tsx
import { requireAdmin } from '@/lib/auth/admin';
import { supabaseAdmin } from '@/lib/supabase/server';
import type { Review } from '@/types/portal';
import { ReviewsBoard } from '@/components/admin/ReviewsBoard';

export const dynamic = 'force-dynamic';

export default async function ReviewsAdminPage() {
  await requireAdmin();
  const { data } = await supabaseAdmin
    .from('reviews')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(500);
  return <ReviewsBoard reviews={(data ?? []) as Review[]} />;
}
