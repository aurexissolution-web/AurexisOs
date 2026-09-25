// src/app/admin/(panel)/insights/page.tsx
import Link from 'next/link';
import { ExternalLink, PenLine, Plus } from 'lucide-react';
import { requireAdmin } from '@/lib/auth/admin';
import { supabaseAdmin } from '@/lib/supabase/server';
import type { InsightPost } from '@/types/insights';
import { ButtonLink, EmptyState, PageHeader, Pill } from '@/components/admin/ui';
import { RelativeTime } from '@/components/admin/RelativeTime';

export const dynamic = 'force-dynamic';

export default async function InsightsAdminPage() {
  await requireAdmin();
  const { data } = await supabaseAdmin
    .from('insights_posts')
    .select('id, slug, title, excerpt, status, published_at, updated_at, created_at, cover_image_url')
    .order('updated_at', { ascending: false });
  const posts = (data ?? []) as InsightPost[];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Publish to /insights"
        title="Insight"
        accent="Booster."
        description="Write once, publish to the Insights page instantly. Drafts stay private until you publish."
        actions={
          <>
            <ButtonLink href="/insights" external>
              View Insights <ExternalLink className="h-3.5 w-3.5" />
            </ButtonLink>
            <ButtonLink href="/admin/insights/new" variant="primary">
              <Plus className="h-4 w-4" /> New post
            </ButtonLink>
          </>
        }
      />

      {posts.length === 0 ? (
        <div className="rounded-2xl border border-white/[0.14] bg-white/[0.02]">
          <EmptyState
            icon={<PenLine className="h-5 w-5" />}
            title="No posts yet"
            body="Share what you learn from client work. Each post helps you rank on Google and shows prospects you know your stuff."
            action={
              <ButtonLink href="/admin/insights/new" variant="primary">
                <Plus className="h-4 w-4" /> Write your first post
              </ButtonLink>
            }
          />
        </div>
      ) : (
        <ul className="grid gap-3">
          {posts.map((p) => (
            <li key={p.id}>
              <Link
                href={`/admin/insights/${p.id}`}
                className="group flex items-center gap-4 rounded-2xl border border-white/[0.14] bg-white/[0.025] p-3 pr-5 transition-colors hover:border-white/20"
              >
                <span className="relative hidden h-16 w-28 shrink-0 overflow-hidden rounded-xl border border-white/[0.14] bg-gradient-to-br from-[#5EE3DA]/15 to-[#8FA8F0]/10 sm:block">
                  {p.cover_image_url && (
                    // eslint-disable-next-line @next/next/no-img-element -- CMS thumbnail
                    <img src={p.cover_image_url} alt="" className="h-full w-full object-cover" />
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[15px] font-semibold text-white group-hover:text-[#5EE3DA]">
                    {p.title}
                  </span>
                  <span className="mt-0.5 block truncate text-[12.5px] text-white/45">{p.excerpt || 'No excerpt yet'}</span>
                  <span className="mt-1.5 block font-mono text-[10.5px] text-white/30">/insights/{p.slug}</span>
                </span>
                <span className="flex shrink-0 flex-col items-end gap-1.5">
                  {p.status === 'published' ? <Pill color="#7FE8C4">Published</Pill> : <Pill color="#F0C88F">Draft</Pill>}
                  <span className="text-[11.5px] text-white/35">
                    edited <RelativeTime iso={p.updated_at ?? p.created_at} />
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
