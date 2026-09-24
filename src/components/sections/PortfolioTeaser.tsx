import Image from "next/image";
import { supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/server";
import type { PortfolioItem, PortfolioCategory } from "@/types/portal";
import { SectionDivider } from "@/components/ui/section-divider";

const CATEGORY_LABELS: Record<PortfolioCategory, string> = {
  "ai-automation": "AI Automation",
  "web-engineering": "Web Engineering",
  "mobile-ecosystem": "Mobile Ecosystem",
  ecosystem: "Ecosystem",
  "data-engineering": "Data Engineering",
};

function PortfolioCard({ item }: { item: PortfolioItem }) {
  const image = item.images?.[0];

  const content = (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.025] to-transparent transition-colors duration-300 hover:border-[var(--color-electric-cyan)]/30">
      <div className="relative aspect-[16/10] overflow-hidden bg-black/40">
        {image ? (
          <Image
            src={image}
            alt={item.title}
            fill
            sizes="(min-width: 768px) 33vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full items-center justify-center font-mono text-[10px] uppercase tracking-[0.28em] text-white/25">
            No image
          </div>
        )}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-12"
          style={{
            background: "linear-gradient(to bottom, transparent, var(--color-background))",
          }}
        />
      </div>

      <div className="relative flex flex-1 flex-col gap-2 p-5">
        <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-white/35">
          {CATEGORY_LABELS[item.category]}
        </span>
        <h4 className="font-serif text-[19px] italic leading-[1.1] tracking-[-0.015em] text-white">
          {item.title}
        </h4>
        {item.client_name && (
          <p className="text-[12px] text-white/50">{item.client_name}</p>
        )}
      </div>
    </article>
  );

  if (!item.live_url) {
    return content;
  }

  return (
    <a
      href={item.live_url}
      target="_blank"
      rel="noopener noreferrer"
      className="block h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-electric-cyan)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-background)]"
    >
      {content}
    </a>
  );
}

export async function PortfolioTeaser() {
  if (!isSupabaseConfigured()) return null;

  const { data, error } = await supabaseAdmin
    .from("portfolio_items")
    .select("*")
    .order("featured", { ascending: false })
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false })
    .limit(3);

  if (error || !data || data.length === 0) return null;

  const items = data as PortfolioItem[];

  return (
    <section className="relative bg-[var(--color-background)] py-14 md:py-16 lg:py-16">
      <SectionDivider />
      <div className="container mx-auto max-w-7xl px-6">
        <div className="mb-10 max-w-2xl lg:mb-12">
          <div
            className="mb-5 inline-flex items-center gap-2.5 rounded-full border border-[var(--color-electric-cyan)]/15 bg-white/[0.04] px-4 py-2 backdrop-blur-xl"
            style={{
              boxShadow:
                "0 0 28px rgba(0,240,255,0.10), 0 8px 24px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.14)",
            }}
          >
            <span
              aria-hidden
              className="h-1.5 w-1.5 rounded-full bg-[var(--color-electric-cyan)]"
              style={{ boxShadow: "0 0 8px rgba(0,240,255,0.7)" }}
            />
            <span className="font-mono text-[11px] uppercase tracking-[0.32em] text-[var(--color-electric-cyan)]">
              Proven In Practice
            </span>
          </div>
          <h3 className="text-3xl font-medium leading-[1.1] tracking-[-0.025em] text-white md:text-4xl lg:text-5xl">
            Systems we&apos;ve built for real businesses.
          </h3>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3 md:gap-6">
          {items.map((item) => (
            <PortfolioCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
