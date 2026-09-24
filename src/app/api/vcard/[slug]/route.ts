import { NextResponse } from "next/server";
import { buildVCard } from "@/lib/founder-card/vcard";
import { getFounderCard } from "@/data/founder-cards";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const card = getFounderCard(slug);

  if (!card) {
    return NextResponse.json({ error: "Unknown card." }, { status: 404 });
  }

  try {
    const vcard = buildVCard(card);
    return new NextResponse(vcard, {
      status: 200,
      headers: {
        // Explicit type required — the site sets X-Content-Type-Options: nosniff.
        "Content-Type": "text/vcard; charset=utf-8",
        "Content-Disposition": `attachment; filename="${card.vcardFileName}"`,
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (err) {
    console.error("[/api/vcard] failed to build vCard", err);
    return NextResponse.json(
      { error: "Unable to generate contact card." },
      { status: 500 },
    );
  }
}
