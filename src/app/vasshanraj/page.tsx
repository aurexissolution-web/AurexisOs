import type { Metadata, Viewport } from "next";
import { FOUNDER_CARDS } from "@/data/founder-cards";
import {
  buildFounderCardMetadata,
  founderCardViewport,
  FounderCardPage,
} from "@/components/founder-card/FounderCardPage";

const card = FOUNDER_CARDS.vasshanraj;

export const metadata: Metadata = buildFounderCardMetadata(card);
export const viewport: Viewport = founderCardViewport;

export default function VasshanFounderCardPage() {
  return <FounderCardPage card={card} />;
}
