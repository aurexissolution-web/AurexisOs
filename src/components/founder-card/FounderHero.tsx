import Image from "next/image";
import { MapPin } from "lucide-react";
import type { FounderCardData } from "@/data/founder-cards";
import { PrimaryActions } from "./PrimaryActions";

export function FounderHero({ card }: { card: FounderCardData }) {
  return (
    <section className="fc-hero" aria-labelledby="founder-name">
      <div className="fc-hero-shell">
        <header className="fc-hero-logo fc-rise">
          <Image
            src="/brand/aurexis-logo-transparent.png"
            alt="Aurexis Solution"
            width={1546}
            height={368}
            priority
            sizes="(min-width: 768px) 190px, 142px"
            className="h-auto w-[142px] object-contain md:w-[190px]"
          />
        </header>

        <div className="fc-hero-portrait fc-rise" style={{ animationDelay: "70ms" }}>
          <span aria-hidden className="fc-hero-angle" />
          {card.portrait ? (
            <Image
              src={card.portrait}
              alt={`Portrait of ${card.name}, ${card.title} of ${card.company}`}
              fill
              priority
              sizes="(min-width: 1200px) 610px, (min-width: 768px) 48vw, 280px"
              className="fc-hero-portrait-image object-cover"
            />
          ) : (
            <div className="fc-portrait-fallback" aria-hidden>
              {card.initials}
            </div>
          )}
        </div>

        <div className="fc-hero-copy fc-rise" style={{ animationDelay: "120ms" }}>
          <p className="fc-eyebrow">
            <span>{card.eyebrowLabel}</span>
            <span aria-hidden>•</span>
            <span>Business systems</span>
          </p>

          <h1 id="founder-name" className="fc-founder-name">
            <span>{card.firstName}</span>
            <span>{card.lastName}</span>
          </h1>

          <p className="fc-founder-role">
            <span>{card.title}</span>
            <span aria-hidden className="fc-role-dot">•</span>
            <span>{card.company}</span>
          </p>

          <p className="fc-founder-location">
            <MapPin aria-hidden className="h-[18px] w-[18px] shrink-0" strokeWidth={1.8} />
            <span>{card.publicLocation}</span>
            <span aria-hidden className="fc-location-rule" />
            <span>Serving Malaysia &amp; Singapore</span>
          </p>

          <p className="fc-value-statement">
            Helping growing businesses cut operational waste, recover valuable time and create room for <span className="fc-value-emphasis">more profitable growth</span>.
          </p>

          <div className="fc-hero-actions">
            <PrimaryActions card={card} />
          </div>
        </div>
      </div>
    </section>
  );
}
