"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Fraunces } from "next/font/google";
import { CHANNELS } from "@/data/contact-config";
import type { SolutionsService } from "@/data/solutions-services";

// Loaded locally to this component (not the root layout) so only /solutions
// pays for it. Variable font: omitting `weight` loads the full axis.
const fraunces = Fraunces({
  subsets: ["latin"],
  style: ["italic"],
  display: "swap",
});

const BULLET_PLACEHOLDER = "[PLACEHOLDER — pending]";
const PLACEHOLDER_BULLETS = [BULLET_PLACEHOLDER, BULLET_PLACEHOLDER, BULLET_PLACEHOLDER];

function whatsappHref(service: string) {
  return `${CHANNELS.whatsappUrl}?text=${encodeURIComponent(
    `Hi Aurexis - I'm interested in ${service}.`,
  )}`;
}

function ServiceRow({
  service,
  index,
}: {
  service: SolutionsService;
  index: number;
}) {
  const href = service.ctaHref ?? whatsappHref(service.name);
  const bullets = service.bullets ?? PLACEHOLDER_BULLETS;

  return (
    <div
      // The divider "beneath" a section is this row's own border-bottom, not the
      // next row's border-top — so hovering/focusing THIS row lights up THIS
      // row's own divider with THIS row's own accent, not the next section's.
      // Every row gets one, including the last — otherwise hovering the final
      // section has nothing to light up, unlike every other section.
      className="solutions-row solutions-row-divider border-b px-6 py-14 md:px-16 md:py-16"
      style={{ "--accent": service.accent } as CSSProperties}
    >
      <div className="mx-auto max-w-7xl">
        {/* Five columns, matching the reference's numeral / headline / body / bullets / arrow
            split. Price/CTA aren't part of the reference, so rather than guess a margin to
            line them up, they're placed as real grid items (row 2, starting at the body
            column) — staying aligned automatically if the column widths ever change. */}
        <div className="grid gap-6 md:grid-cols-[110px_300px_1fr_240px_64px] md:items-center md:gap-x-12 md:gap-y-8">
          {/* Numeral — outlined in the service's accent, nothing else here uses it. */}
          <span
            className={fraunces.className}
            aria-hidden
            style={{
              fontSize: "clamp(64px, 8vw, 120px)",
              lineHeight: 1,
              color: "transparent",
              WebkitTextStroke: `1.5px ${service.accent}`,
            }}
          >
            {String(index + 1).padStart(2, "0")}
          </span>

          {/* Category + headline */}
          <div>
            <div className="flex items-center gap-2">
              <span
                aria-hidden
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: service.accent }}
              />
              <span className="font-mono text-[10.5px] uppercase tracking-[0.32em] text-white/40">
                {service.category}
              </span>
            </div>
            <h2 className="mt-3 text-3xl font-semibold italic tracking-[-0.015em] text-white md:text-4xl">
              {service.name}
            </h2>
          </div>

          {/* Problem + body */}
          <div>
            <p className="font-serif text-lg italic leading-snug text-white/70 md:text-xl">
              {service.problemLine}
            </p>
            <p className="mt-3 text-[14px] leading-[1.6] text-white/55 md:text-[15px]">
              {service.body}
            </p>
          </div>

          {/* Bullets — its own column, matching the reference's three-line rhythm.
              Falls back to placeholder text for rows that haven't defined their own yet. */}
          <ul className="space-y-2">
            {bullets.map((text, i) => (
              <li
                key={i}
                className={`flex items-start gap-2 text-[12.5px] ${
                  text === BULLET_PLACEHOLDER ? "text-white/35" : "text-white/55"
                }`}
              >
                <span aria-hidden className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-white/25" />
                {text}
              </li>
            ))}
          </ul>

          {/* Arrow — links to the service's own detail page when one exists (e.g.
              Presence → /solutions/presence); otherwise falls back to the same
              WhatsApp destination as the CTA below. Rest state stays neutral gray;
              hovering (or keyboard-focusing) anywhere in the row lights it up to the
              row's own accent, via the .solutions-row-arrow(-icon) rules in globals.css. */}
          {service.detailHref ? (
            <Link
              href={service.detailHref}
              aria-label={`See ${service.name} in detail`}
              className="solutions-row-arrow hidden h-14 w-14 shrink-0 items-center justify-center rounded-full border md:flex"
            >
              <ArrowRight className="solutions-row-arrow-icon h-5 w-5" strokeWidth={1.5} />
            </Link>
          ) : (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`WhatsApp us about ${service.name}`}
              className="solutions-row-arrow hidden h-14 w-14 shrink-0 items-center justify-center rounded-full border md:flex"
            >
              <ArrowRight className="solutions-row-arrow-icon h-5 w-5" strokeWidth={1.5} />
            </a>
          )}

          {/* Price + CTA — real grid items (row 2, body column start), not a magic margin. */}
          <div className="md:col-start-3 md:col-span-2 md:row-start-2">
            <p className="font-serif text-lg italic text-[var(--color-electric-cyan)] md:text-xl">
              {service.pricePrefix && (
                <span className="mr-1.5 align-baseline font-sans text-[12.5px] not-italic text-white/40">
                  {service.pricePrefix}
                </span>
              )}
              {service.priceAmount}
              {service.priceSuffix && (
                <span className="ml-1.5 align-baseline font-sans text-[13.5px] italic text-white/50">
                  {service.priceSuffix}
                </span>
              )}
            </p>

            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="group mt-4 inline-flex items-center gap-2 rounded-full border border-[var(--color-electric-cyan)]/40 bg-[var(--color-electric-cyan)]/[0.04] px-6 py-3 text-[14px] font-semibold text-white transition-all hover:-translate-y-0.5 hover:border-[var(--color-electric-cyan)]/70 hover:bg-[var(--color-electric-cyan)]/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-electric-cyan)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-background)]"
            >
              WhatsApp us about {service.name}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SolutionsServiceRows({ services }: { services: SolutionsService[] }) {
  return (
    <div className="relative">
      {services.map((service, index) => (
        <ServiceRow key={service.name} service={service} index={index} />
      ))}
    </div>
  );
}
