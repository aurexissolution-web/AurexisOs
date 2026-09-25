import { fetchApprovedReviews } from "@/lib/portal/reviews-data";
import { TestimonialsClient } from "./TestimonialsClient";
import { LeaveReview } from "./LeaveReview";
import { SectionDivider } from "@/components/ui/section-divider";

/* Section bg: slightly elevated above the page so the cards read as a
   gently recessed surface. */
const SECTION_BG = "#05080F";

export async function ReviewsSection() {
  const reviews = await fetchApprovedReviews();

  // No approved reviews yet: skip the "Trusted by…" shell (it would only
  // advertise the absence) but keep a quiet way for clients to leave one.
  if (reviews.length === 0) {
    return (
      <section
        id="reviews"
        className="relative px-6 py-14 md:py-16"
        style={{ background: SECTION_BG }}
      >
        <SectionDivider />
        <div className="mx-auto flex max-w-xl flex-col items-center gap-4 text-center">
          <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/40">
            Client Stories
          </span>
          <p className="text-[22px] font-extrabold tracking-[-0.02em] text-white md:text-[26px]">
            Worked with us?{" "}
            <em className="font-serif font-normal italic text-[var(--color-electric-cyan)]">
              Tell others how it went.
            </em>
          </p>
          <LeaveReview variant="button" />
        </div>
      </section>
    );
  }

  return (
    <section
      id="reviews"
      className="relative overflow-hidden px-0 py-14 md:py-16"
      style={{ background: SECTION_BG }}
    >
      <SectionDivider />
      {/* Dotted grid texture — kept faint so it never competes with the cards */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.02) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
          maskImage:
            "radial-gradient(ellipse 90% 80% at 50% 50%, black 30%, transparent 80%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 90% 80% at 50% 50%, black 30%, transparent 80%)",
        }}
      />

      <div className="relative">
        <TestimonialsClient reviews={reviews} />
      </div>
    </section>
  );
}
