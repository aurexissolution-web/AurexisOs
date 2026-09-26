import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/sections/HeroSection";
import { TechStackMarquee } from "@/components/sections/TechStackMarquee";
import { TheShift } from "@/components/sections/TheShift";
import { TheEcosystem } from "@/components/sections/TheEcosystem";
import { PortfolioTeaser } from "@/components/sections/PortfolioTeaser";
import { HowAurexisWorks } from "@/components/sections/HowAurexisWorks";
import { CapacityCalculator } from "@/components/sections/CapacityCalculator";
import { ReviewsSection } from "@/components/sections/reviews/ReviewsSection";
import { FAQSection } from "@/components/sections/FAQSection";
import { FinalCTA } from "@/components/sections/FinalCTA";

// Cached for a minute. Approving or deleting a review also revalidates "/" right away.
export const revalidate = 60;

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <TechStackMarquee />
        <TheShift />
        <TheEcosystem />
        <PortfolioTeaser />
        <HowAurexisWorks />
        <CapacityCalculator />
        <ReviewsSection />
        <FAQSection />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
