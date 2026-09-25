// src/app/admin/(panel)/work/page.tsx
import Link from 'next/link';
import { BriefcaseBusiness, ExternalLink, Plus, Star } from 'lucide-react';
import { requireAdmin } from '@/lib/auth/admin';
import { supabaseAdmin } from '@/lib/supabase/server';
import { ButtonLink, EmptyState, PageHeader, Pill } from '@/components/admin/ui';
import { RelativeTime } from '@/components/admin/RelativeTime';

export const dynamic = 'force-dynamic';

type Row = {
  id: string;
  slug: string;
  client_name: string;
  industry: string;
  outcome_headline: string;
  cover_image_url: string | null;
  status: 'draft' | 'published';
  featured: boolean;
  updated_at: string;
};

export default async function WorkAdminPage() {
  await requireAdmin();
  const { data } = await supabaseAdmin
    .from('case_studies')
    .select(
      'id, slug, client_name, industry, outcome_headline, cover_image_url, status, featured, updated_at',
    )
    .order('featured', { ascending: false })
    .order('display_order', { ascending: true })
    .order('updated_at', { ascending: false });
  const items = (data ?? []) as Row[];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Publish to /work"
        title="The Work"
        accent="Files."
        description="Case studies that prove it. Featured work leads the Work page."
        actions={
          <>
            <ButtonLink href="/work" external>
              View Work page <ExternalLink className="h-3.5 w-3.5" />
            </ButtonLink>
            <ButtonLink href="/admin/work/new" variant="primary">
              <Plus className="h-4 w-4" /> New case study
            </ButtonLink>
          </>
        }
      />

      {items.length === 0 ? (
        <div className="rounded-2xl border border-white/[0.14] bg-white/[0.02]">
          <EmptyState
            icon={<BriefcaseBusiness className="h-5 w-5" />}
            title="Your first case study"
            body="Start with a finished client — the problem, what you built and the result. One strong case study sells better than a long list."
            action={
              <ButtonLink href="/admin/work/new" variant="primary">
                <Plus className="h-4 w-4" /> Add case study
              </ButtonLink>
            }
          />
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((w) => (
            <li key={w.id}>
              <Link
                href={`/admin/work/${w.id}`}
                className="group block overflow-hidden rounded-2xl border border-white/[0.14] bg-white/[0.025] transition-colors hover:border-white/20"
              >
                <span className="relative block aspect-[16/10] overflow-hidden bg-gradient-to-br from-[#5EE3DA]/15 via-white/[0.02] to-[#8FA8F0]/10">
                  {w.cover_image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element -- CMS thumbnail
                    <img
                      src={w.cover_image_url}
                      alt=""
                      className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <span className="grid h-full place-items-center font-serif text-[28px] italic text-white/25">
                      {w.client_name}
                    </span>
                  )}
                  <span className="absolute left-3 top-3 flex gap-1.5">
                    {w.status === 'published' ? (
                      <Pill color="#7FE8C4" solid>
                        Live
                      </Pill>
                    ) : (
                      <Pill color="#F0C88F" solid>
                        Draft
                      </Pill>
                    )}
                    {w.featured && (
                      <span className="inline-flex h-6 items-center gap-1 rounded-full bg-black/60 px-2 text-[11px] text-[#F0C88F] backdrop-blur">
                        <Star className="h-3 w-3 fill-current" /> Featured
                      </span>
                    )}
                  </span>
                </span>
                <span className="block p-4">
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#5EE3DA]">
                    {w.industry || 'Industry'}
                  </span>
                  <span className="mt-1 block truncate text-[15px] font-semibold text-white">
                    {w.client_name}
                  </span>
                  <span className="mt-0.5 line-clamp-2 block text-[12.5px] leading-[1.5] text-white/50">
                    {w.outcome_headline}
                  </span>
                  <span className="mt-3 block text-[11px] text-white/30">
                    edited <RelativeTime iso={w.updated_at} />
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
