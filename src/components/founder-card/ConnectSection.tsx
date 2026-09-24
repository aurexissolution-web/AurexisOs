"use client";

import { Globe2, Instagram, Linkedin, Mail, MapPin } from "lucide-react";
import type { FounderCardData } from "@/data/founder-cards";
import { track } from "@/lib/founder-card/analytics";
import { SectionLabel } from "./SectionLabel";
import type { FounderCardEvent } from "@/lib/founder-card/analytics";

function buildContactItems(card: FounderCardData): ReadonlyArray<{
  label: string;
  value: string;
  href: string;
  icon: typeof Mail;
  event: FounderCardEvent;
  external?: boolean;
}> {
  return [
    {
      label: "Email",
      value: card.email,
      href: `mailto:${card.email}`,
      icon: Mail,
      event: "email_click",
    },
    {
      label: "Website",
      value: card.websiteDisplay,
      href: card.website,
      icon: Globe2,
      event: "website_click",
      external: true,
    },
    {
      label: "LinkedIn",
      value: card.linkedinIsPersonal ? card.name : card.company,
      href: card.linkedin,
      icon: Linkedin,
      event: "linkedin_click",
      external: true,
    },
    {
      label: "Instagram",
      value: card.instagramDisplay,
      href: card.instagramUrl,
      icon: Instagram,
      event: "instagram_click",
      external: true,
    },
  ];
}

export function ConnectSection({ card }: { card: FounderCardData }) {
  const contactItems = buildContactItems(card);
  return (
    <section aria-label={`Contact ${card.name}`}>
      <SectionLabel>Let&apos;s Connect</SectionLabel>
      <div className="fc-contact-grid">
        {contactItems.map(({ label, value, href, icon: Icon, event, external }) => (
          <a
            key={label}
            href={href}
            onClick={() => track(event, { card: card.slug })}
            {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            className="fc-contact-item fc-focus"
            aria-label={`${label}: ${value}`}
          >
            <Icon aria-hidden className="fc-contact-icon" strokeWidth={1.55} />
            <span className="fc-contact-label">{label}</span>
            <span className="fc-contact-value">{value}</span>
          </a>
        ))}
      </div>

      <div className="fc-service-area">
        <span>
          <MapPin aria-hidden strokeWidth={1.6} />
          {card.publicLocation}
        </span>
        <i aria-hidden />
        <span>
          <Globe2 aria-hidden strokeWidth={1.5} />
          Serving Malaysia &amp; Singapore
        </span>
      </div>
    </section>
  );
}
