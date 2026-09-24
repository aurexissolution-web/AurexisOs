import { ImageResponse } from "next/og";
import type { FounderCardData } from "@/data/founder-cards";

export const ogImageSize = { width: 1200, height: 630 };
export const ogImageContentType = "image/png";

export function founderOgAlt(card: FounderCardData): string {
  return `${card.name} — ${card.title}, Aurexis Solution`;
}

/** Premium, Aurexis-branded social card. Typographic (no external assets) so it
 * renders reliably at build/runtime. Dark canvas, restrained cyan detail. */
export function renderFounderOgImage(card: FounderCardData) {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(160deg, #070c10 0%, #050709 60%)",
          padding: "76px 84px",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            background:
              "radial-gradient(58% 62% at 50% -6%, rgba(66,213,215,0.16), transparent 60%)",
          }}
        />
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              background: "#42D5D7",
              display: "flex",
              boxShadow: "0 0 26px rgba(66,213,215,0.6)",
            }}
          />
          <div
            style={{
              color: "#cbd5e1",
              fontSize: 24,
              letterSpacing: 9,
              textTransform: "uppercase",
              display: "flex",
            }}
          >
            Aurexis Solution
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              color: "#42D5D7",
              fontSize: 24,
              letterSpacing: 7,
              textTransform: "uppercase",
              marginBottom: 20,
              display: "flex",
            }}
          >
            {card.title}
          </div>
          <div
            style={{
              color: "#ffffff",
              fontSize: 100,
              fontWeight: 700,
              lineHeight: 1,
              letterSpacing: -2,
              display: "flex",
            }}
          >
            {card.name}
          </div>
        </div>

        <div
          style={{
            color: "#94a3b8",
            fontSize: 31,
            lineHeight: 1.35,
            maxWidth: 940,
            display: "flex",
          }}
        >
          {card.positioning}
        </div>
      </div>
    ),
    { ...ogImageSize },
  );
}
