"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Star } from "lucide-react";
import { Monogram } from "./Monogram";
import type { Review } from "@/types/portal";
import { useSafeReducedMotion } from "@/lib/hooks/use-safe-reduced-motion";

/**
 * Past this many reviews the row becomes an infinite marquee. Below it a
 * static grid is the honest presentation — a loop implies there's more than
 * fits on screen, which is only true once there is.
 */
const MARQUEE_THRESHOLD = 5;

/** Names shown in the top strip before it starts wrapping into a mess. */
const WORDMARK_LIMIT = 6;

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_AUREXIS_WHATSAPP || "60164071129";

const REVIEW_WA_HREF = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
  "Hi Aurexis - I'd like to leave a review about working with you.",
)}`;

/** Fixed locale so the server and client render the same string. */
function formatMonth(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
}

function Stars({ rating, size = 13 }: { rating: number; size?: number }) {
  return (
    <span
      className="inline-flex items-center gap-0.5"
      aria-label={`Rated ${rating} out of 5`}
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          aria-hidden
          style={{ width: size, height: size }}
          className={
            i < rating
              ? "fill-[var(--color-electric-cyan)] text-[var(--color-electric-cyan)]"
              : "text-white/20"
          }
        />
      ))}
    </span>
  );
}

function ReviewCard({ review, fixed }: { review: Review; fixed?: boolean }) {
  const date = formatMonth(review.approved_at ?? review.created_at);

  return (
    <figure
      className={`flex h-full flex-col rounded-2xl border border-white/[0.07] p-6 ${
        fixed ? "w-[340px] shrink-0 sm:w-[360px]" : ""
      }`}
      style={{
        background:
          "linear-gradient(160deg, rgba(0,240,255,0.04), rgba(255,255,255,0.012) 55%)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
      }}
    >
      <div className="flex items-center justify-between gap-3">
        <Stars rating={review.rating} />
        {date && (
          <span className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-white/30">
            {date}
          </span>
        )}
      </div>

      <blockquote className="mt-5 flex-1 font-serif text-[18px] leading-[1.45] text-white/85 md:text-[19px]">
        &ldquo;{review.content}&rdquo;
      </blockquote>

      <figcaption className="mt-6 flex items-center gap-3 border-t border-white/[0.08] pt-5">
        <Monogram name={review.name} size={34} />
        <span className="min-w-0">
          <cite className="block truncate not-italic text-[13.5px] font-semibold text-white">
            {review.name}
          </cite>
          {review.role && (
            <span className="mt-0.5 block truncate text-[11.5px] text-white/45">
              {review.role}
            </span>
          )}
        </span>
      </figcaption>
    </figure>
  );
}

export function TestimonialsClient({ reviews }: { reviews: Review[] }) {
  const reduce = useSafeReducedMotion();
  const looping = reviews.length > MARQUEE_THRESHOLD;

  return (
    <div
      className={`relative mx-auto flex flex-col gap-8 px-6 ${
        looping ? "max-w-[1320px]" : "max-w-[1200px]"
      }`}
    >
      <motion.div
        className="mx-auto flex max-w-2xl flex-col items-center gap-3 text-center"
        initial={{ opacity: 0, y: reduce ? 0 : 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: reduce ? 0 : 0.5 }}
      >
        <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/40">
          Client Stories
        </span>
        <h2 className="text-3xl font-extrabold leading-[1.05] tracking-[-0.02em] text-balance text-white md:text-4xl lg:text-[2.75rem]">
          Vouched for by{" "}
          <em
            className="font-serif font-normal italic text-[var(--color-electric-cyan)]"
            style={{ filter: "drop-shadow(0 0 18px rgba(0,240,255,0.32))" }}
          >
            real businesses
          </em>
          .
        </h2>
      </motion.div>

      {/* Who vouches for you */}
      <motion.div
        className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 border-y border-white/[0.08] py-6"
        initial={{ opacity: 0, y: reduce ? 0 : 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: reduce ? 0 : 0.5 }}
      >
        {reviews.slice(0, WORDMARK_LIMIT).map((r) => (
          <span
            key={r.id}
            className="font-serif text-[19px] italic text-white/45 transition-colors duration-300 hover:text-white/80 md:text-[21px]"
          >
            {r.name}
          </span>
        ))}
      </motion.div>

      {looping ? (
        /* Enough reviews that they don't fit — loop them. Duplicated track,
           paused on hover so a quote can actually be read, and frozen under
           reduced motion. */
        <div
          className="group relative flex overflow-hidden"
          style={{
            maskImage:
              "linear-gradient(to right, transparent, black 6%, black 94%, transparent)",
            WebkitMaskImage:
              "linear-gradient(to right, transparent, black 6%, black 94%, transparent)",
          }}
        >
          {[0, 1].map((track) => (
            <div
              key={track}
              aria-hidden={track === 1}
              className="flex shrink-0 items-stretch [gap:var(--gap)] animate-marquee group-hover:[animation-play-state:paused] motion-reduce:[animation-play-state:paused] [--gap:1.25rem] [--duration:56s]"
            >
              {reviews.map((r) => (
                <ReviewCard key={`${track}-${r.id}`} review={r} fixed />
              ))}
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {reviews.map((r, i) => (
            <motion.div
              key={r.id}
              className="h-full"
              initial={{ opacity: 0, y: reduce ? 0 : 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-70px" }}
              transition={{
                duration: reduce ? 0 : 0.55,
                delay: reduce ? 0 : i * 0.08,
                ease: "easeOut",
              }}
            >
              <ReviewCard review={r} />
            </motion.div>
          ))}
        </div>
      )}

      <motion.div
        className="flex flex-col items-center gap-4"
        initial={{ opacity: 0, y: reduce ? 0 : 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: reduce ? 0 : 0.45 }}
      >
        <p className="text-[13px] text-white/40">
          Worked with us?{" "}
          <a
            href={REVIEW_WA_HREF}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded text-[var(--color-electric-cyan)]/80 underline-offset-4 transition-colors hover:text-[var(--color-electric-cyan)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-electric-cyan)]/60"
          >
            Leave a review
          </a>
          .
        </p>
        <Link
          href="/contact#brief"
          className="group inline-flex items-center gap-2 rounded-full border border-[var(--color-electric-cyan)]/40 bg-[var(--color-electric-cyan)]/[0.04] px-7 py-3 text-[14px] font-semibold text-white transition-all hover:-translate-y-0.5 hover:border-[var(--color-electric-cyan)]/70 hover:bg-[var(--color-electric-cyan)]/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-electric-cyan)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#05080F] motion-reduce:transition-none motion-reduce:hover:translate-y-0"
        >
          Start with an assessment
          <ArrowRight
            aria-hidden
            className="h-4 w-4 transition-transform group-hover:translate-x-0.5 motion-reduce:group-hover:translate-x-0"
          />
        </Link>
      </motion.div>
    </div>
  );
}
