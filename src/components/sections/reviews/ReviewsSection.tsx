import { fetchApprovedReviews } from "@/lib/portal/reviews-data";
import { TestimonialsClient } from "./TestimonialsClient";
import { SectionDivider } from "@/components/ui/section-divider";

/* Section bg: slightly elevated above the page so the cards read as a
   gently recessed surface. */
const SECTION_BG = "#05080F";

export async function ReviewsSection() {
  const reviews = await fetchApprovedReviews();

  // Nothing to vouch for yet — render nothing rather than an empty
  // "Trusted by..." shell, which only advertises the absence.
  if (reviews.length === 0) return null;

  return (
    <section
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
