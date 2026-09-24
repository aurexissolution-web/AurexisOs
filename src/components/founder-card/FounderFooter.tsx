import Image from "next/image";
import type { FounderCardData } from "@/data/founder-cards";

export function FounderFooter({ card }: { card: FounderCardData }) {
  return (
    <footer className="fc-footer">
      <Image
        src="/brand/aurexis-logo-transparent.png"
        alt="Aurexis Solution"
        width={1546}
        height={368}
        sizes="(min-width: 768px) 154px, 132px"
        className="h-auto w-[132px] object-contain opacity-90 md:w-[154px]"
      />
      <div className="fc-footer-links">
        <a
          href={card.website}
          target="_blank"
          rel="noopener noreferrer"
          className="fc-focus"
        >
          {card.websiteDisplay}
        </a>
      </div>
      <p className="fc-footer-copy">
        © 2026 Aurexis Solution. All rights reserved.
      </p>
    </footer>
  );
}
