import { FOUNDER_CARDS } from "@/data/founder-cards";
import {
  founderOgAlt,
  ogImageSize,
  ogImageContentType,
  renderFounderOgImage,
} from "@/lib/founder-card/og-image";

const card = FOUNDER_CARDS.vasshanraj;

export const alt = founderOgAlt(card);
export const size = ogImageSize;
export const contentType = ogImageContentType;

export default function OpenGraphImage() {
  return renderFounderOgImage(card);
}
