"use client";

import { CalendarDays, MessageCircle, UserRoundPlus, ArrowRight } from "lucide-react";
import type { FounderCardData } from "@/data/founder-cards";
import { track } from "@/lib/founder-card/analytics";

export function PrimaryActions({ card }: { card: FounderCardData }) {
  return (
    <section aria-label="Primary actions" className="flex flex-col gap-3">
      <a
        href={card.bookingUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => track("book_discovery_click", { card: card.slug })}
        aria-label={`Book a discovery call with ${card.name}`}
        className="fc-focus fc-primary-action group flex min-h-[58px] items-center gap-3 rounded-[12px] px-5 text-[14px] font-semibold transition duration-200 hover:-translate-y-[1px] sm:text-[15px]"
      >
        <CalendarDays className="h-[18px] w-[18px] shrink-0" aria-hidden strokeWidth={1.7} />
        <span className="flex-1 text-center">Book a Discovery Call</span>
        <ArrowRight
          className="h-[17px] w-[17px] shrink-0 transition-transform duration-200 group-hover:translate-x-1"
          aria-hidden
          strokeWidth={1.7}
        />
      </a>

      <div className="grid grid-cols-2 gap-3">
        <a
          href={card.whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => track("whatsapp_click", { card: card.slug })}
          aria-label={`Message ${card.firstName} on WhatsApp`}
          className="fc-focus fc-secondary-action flex min-h-[54px] items-center justify-center gap-2.5 rounded-[11px] px-3 text-[13px] font-semibold transition duration-200 hover:-translate-y-[1px] min-[375px]:text-[14px]"
        >
          <MessageCircle
            className="h-[18px] w-[18px]"
            style={{ color: "var(--fc-accent)" }}
            aria-hidden
            strokeWidth={1.8}
          />
          WhatsApp
        </a>

        <a
          href={`/api/vcard/${card.slug}`}
          download={card.vcardFileName}
          onClick={() => track("save_contact_click", { card: card.slug })}
          aria-label={`Save ${card.name}'s contact card`}
          className="fc-focus fc-secondary-action flex min-h-[54px] items-center justify-center gap-2.5 rounded-[11px] px-3 text-[13px] font-semibold transition duration-200 hover:-translate-y-[1px] min-[375px]:text-[14px]"
        >
          <UserRoundPlus
            className="h-[18px] w-[18px]"
            style={{ color: "var(--fc-accent)" }}
            aria-hidden
            strokeWidth={1.8}
          />
          Save Contact
        </a>
      </div>
    </section>
  );
}
