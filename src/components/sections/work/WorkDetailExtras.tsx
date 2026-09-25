// src/components/sections/work/WorkDetailExtras.tsx
// The optional parts of a case study. "top" sits under the hero (metrics +
// facts); "bottom" follows the story (testimonial + gallery). Each block hides
// itself when the admin left it empty.
import { ArrowUpRight } from 'lucide-react';
import type { CaseStudy } from '@/types/case-study';
import { SERVICES } from '@/data/solutions-services';
import { WORK_ACCENT } from '@/data/work-config';
import { WorkSectionLabel } from './WorkSectionLabel';

// Keyed by the admin's service tags; order matches SERVICES in solutions-services.ts.
const SERVICE_KEYS = ['presence', 'flow', 'core', 'connect', 'audit'];
const SERVICE_BY_KEY = Object.fromEntries(
  SERVICES.map((s, i) => [SERVICE_KEYS[i], { name: s.name, accent: s.accent, href: s.detailHref }]),
) as Record<string, { name: string; accent: string; href?: string }>;

export function WorkDetailExtras({
  item,
  placement,
}: {
  item: CaseStudy;
  placement: 'top' | 'bottom';
}) {
  if (placement === 'top') {
    const metrics = item.metrics ?? [];
    const services = (item.services ?? [])
      .map((k) => ({ k, ...SERVICE_BY_KEY[k] }))
      .filter((s) => s.name);
    const facts = [
      item.location && ['Location', item.location],
      item.timeline && ['Timeline', item.timeline],
    ].filter(Boolean) as [string, string][];
    if (
      !metrics.length &&
      !services.length &&
      !facts.length &&
      !item.liveUrl &&
      !item.techTags?.length
    )
      return null;

    return (
      <section className="border-t border-white/[0.08] px-6 py-12 md:py-14">
        <div className="mx-auto max-w-6xl space-y-8">
          {metrics.length > 0 && (
            <dl className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {metrics.map((m) => (
                <div
                  key={m.label}
                  className="flex flex-col-reverse rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5"
                >
                  <dt className="mt-1.5 text-[13px] text-white/50">{m.label}</dt>
                  <dd
                    className="font-serif text-[40px] italic leading-none"
                    style={{ color: WORK_ACCENT }}
                  >
                    {m.value}
                  </dd>
                </div>
              ))}
            </dl>
          )}

          <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
            {services.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                {services.map((s) =>
                  s.href ? (
                    <a
                      key={s.k}
                      href={s.href}
                      className="inline-flex h-8 items-center gap-2 rounded-full border px-3.5 text-[12.5px] text-white/85 transition-colors hover:text-white"
                      style={{ borderColor: `${s.accent}55`, background: `${s.accent}12` }}
                    >
                      <span className="h-1.5 w-1.5 rounded-full" style={{ background: s.accent }} />
                      {s.name}
                    </a>
                  ) : null,
                )}
              </div>
            )}
            {facts.map(([k, v]) => (
              <p key={k} className="text-[13px] text-white/45">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/35">
                  {k}
                </span>{' '}
                <span className="text-white/80">{v}</span>
              </p>
            ))}
            {item.liveUrl && (
              <a
                href={item.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[13px] underline-offset-4 hover:underline"
                style={{ color: WORK_ACCENT }}
              >
                Visit the live site <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            )}
          </div>

          {item.techTags && item.techTags.length > 0 && (
            <ul className="flex flex-wrap gap-1.5">
              {item.techTags.map((t) => (
                <li
                  key={t}
                  className="rounded-md border border-white/[0.08] px-2 py-1 font-mono text-[10.5px] text-white/50"
                >
                  {t}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    );
  }

  const gallery = item.gallery ?? [];
  if (!item.testimonialQuote && !gallery.length) return null;
  return (
    <>
      {item.testimonialQuote && (
        <section className="border-t border-white/[0.08] px-6 py-16 md:py-20">
          <figure className="mx-auto max-w-4xl">
            <blockquote className="font-serif text-[26px] italic leading-[1.35] text-white md:text-[34px]">
              &ldquo;{item.testimonialQuote}&rdquo;
            </blockquote>
            {item.testimonialAuthor && (
              <figcaption className="mt-6 font-mono text-[11px] uppercase tracking-[0.24em] text-white/45">
                {item.testimonialAuthor}
              </figcaption>
            )}
          </figure>
        </section>
      )}
      {gallery.length > 0 && (
        <section className="border-t border-white/[0.08] px-6 py-16 md:py-20">
          <div className="mx-auto max-w-6xl">
            <WorkSectionLabel>More from the build</WorkSectionLabel>
            <div className="grid gap-4 md:grid-cols-2">
              {gallery.map((src) => (
                // eslint-disable-next-line @next/next/no-img-element -- CMS image of unknown size
                <img
                  key={src}
                  src={src}
                  alt={`${item.clientName} project screenshot`}
                  loading="lazy"
                  className="w-full rounded-2xl border border-white/10 object-cover"
                />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
