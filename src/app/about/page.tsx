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
import { JsonLd } from "@/components/seo/JsonLd";
import { BRAND, SITE_URL, breadcrumbJsonLd, orgId } from "@/lib/seo";

export const metadata = {
  title: "About Aurexis Solution | Founders & Studios in Malaysia",
  description:
    "Aurexis Solution is a Malaysian software studio founded by Sanjay Gunabalan and Nemila Raj Selvaraj, with studios in Kuala Lumpur and Sungai Petani.",
  alternates: { canonical: "/about" },
};

const JSON_LD = [
  {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "@id": `${SITE_URL}/about#page`,
    url: `${SITE_URL}/about`,
    name: `About ${BRAND.name}`,
    about: { "@id": orgId },
    isPartOf: { "@id": `${SITE_URL}/#website` },
  },
  breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
  ]),
];

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#02040A] text-[#F8FAFC]">
      <JsonLd data={JSON_LD} />
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
