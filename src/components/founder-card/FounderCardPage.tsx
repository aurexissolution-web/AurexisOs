import type { Metadata, Viewport } from "next";
import type { FounderCardData } from "@/data/founder-cards";
import { SITE_URL, IS_PRODUCTION } from "@/data/founder-cards";
import { FounderCardBackground } from "./FounderCardBackground";
import { FounderHero } from "./FounderHero";
import { Capabilities } from "./Capabilities";
import { OwnershipPanel } from "./OwnershipPanel";
import { ConnectSection } from "./ConnectSection";
import { FounderFooter } from "./FounderFooter";

export function buildFounderCardMetadata(card: FounderCardData): Metadata {
  const title = `${card.name} | ${card.title}, Aurexis Solution`;
  const description = `Connect with ${card.name}, ${card.title} of Aurexis Solution. Aurexis helps growing businesses reduce manual work, improve visibility and operate with greater control.`;

  return {
    metadataBase: new URL(SITE_URL),
    title,
    description,
    alternates: { canonical: card.cardPath },
    // index/follow only on the confirmed production host; noindex everywhere else.
    robots: IS_PRODUCTION
      ? { index: true, follow: true }
      : { index: false, follow: false },
    openGraph: {
      type: "profile",
      title,
      description,
      url: card.cardPath,
      siteName: "Aurexis Solution",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export const founderCardViewport: Viewport = {
  themeColor: "#050709",
  colorScheme: "dark",
};

function structuredData(card: FounderCardData) {
  const portraitUrl = card.portrait ? `${SITE_URL}${card.portrait}` : undefined;
  return [
    {
      "@context": "https://schema.org",
      "@type": "Person",
      "@id": `${card.cardUrl}#person`,
      name: card.name,
      givenName: card.firstName,
      familyName: card.lastName,
      jobTitle: card.title,
      url: card.cardUrl,
      ...(portraitUrl ? { image: portraitUrl } : {}),
      email: `mailto:${card.email}`,
      telephone: card.phoneLink,
      worksFor: { "@id": `${SITE_URL}#organization` },
      address: { "@type": "PostalAddress", addressCountry: "MY" },
      ...(card.linkedinIsPersonal ? { sameAs: [card.linkedin] } : {}),
    },
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": `${SITE_URL}#organization`,
      name: card.company,
      url: SITE_URL,
      logo: `${SITE_URL}/brand/aurexis-logo-transparent.png`,
      description: card.positioning,
      email: card.email,
      areaServed: ["Malaysia", "Singapore"],
      ...(card.isFounder ? { founder: { "@id": `${card.cardUrl}#person` } } : {}),
      sameAs: ["https://www.linkedin.com/company/aurexissolution/"],
    },
  ];
}

/** A section wrapper that applies a subtle, staggered one-time load reveal
 * (disabled entirely under prefers-reduced-motion via the .fc-rise rule). */
function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <div className={`fc-rise ${className ?? ""}`} style={{ animationDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

export function FounderCardPage({ card }: { card: FounderCardData }) {
  return (
    <>
      <div className="fc-page">
        <FounderCardBackground />
        <main className="fc-root fc-main relative z-10">
          <FounderHero card={card} />
          <div className="fc-content-shell">
            <Reveal delay={80} className="fc-section fc-capabilities-section">
              <Capabilities />
            </Reveal>
            <Reveal delay={140} className="fc-section fc-ownership-section">
              <OwnershipPanel />
            </Reveal>
            <Reveal delay={200} className="fc-section fc-connect-section">
              <ConnectSection card={card} />
            </Reveal>
            <Reveal delay={240}>
              <FounderFooter card={card} />
            </Reveal>
          </div>
        </main>
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData(card)) }}
      />
    </>
  );
}
