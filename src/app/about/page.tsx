import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AboutHeroAurora } from "@/components/sections/AboutHeroAurora";
import { ValueAdd } from "@/components/sections/ValueAdd";
import { FoundersStory } from "@/components/sections/FoundersStory";
import { WhatWeBelieve } from "@/components/sections/WhatWeBelieve";
import { AurexisStandard } from "@/components/sections/AurexisStandard";
import { CulturalFit } from "@/components/sections/CulturalFit";
import { AboutCTA } from "@/components/sections/AboutCTA";
import { LocationSection } from "@/components/sections/LocationSection";
import { TheStack } from "@/components/sections/TheStack";

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#02040A] text-[#F8FAFC]">
      <Navbar />

      <main className="flex-1">
        <AboutHeroAurora />
        <FoundersStory />
        <WhatWeBelieve />
        <LocationSection />
        <TheStack />
        <ValueAdd />
        <AurexisStandard />
        <CulturalFit />
        <AboutCTA />
      </main>

      <Footer />
    </div>
  );
}
