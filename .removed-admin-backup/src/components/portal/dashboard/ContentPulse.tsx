import Link from "next/link";
import Image from "next/image";
import type { DashboardOverview } from "@/lib/portal/dashboard-data";
import { MetricCard } from "./MetricCard";

const MONO = "var(--font-geist-mono), ui-monospace, monospace";
const SERIF = "var(--font-instrument-serif), ui-serif, Georgia, serif";

interface ContentPulseProps {
  data: DashboardOverview["content"];
}

export function ContentPulse({ data }: ContentPulseProps) {
  const isEmpty =
    data.blogPublished === 0 &&
    data.blogDrafts === 0 &&
    data.portfolioTotal === 0;

  return (
    <MetricCard
      eyebrow="Content"
      accent="violet"
      className="lg:col-span-3"
      emptyHint={isEmpty ? "No posts or projects yet" : undefined}
    >
      <div className="mt-2 flex flex-1 flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <StatBlock
            label="Blog"
            primary={data.blogPublished}
            secondary={data.blogDrafts > 0 ? `${data.blogDrafts} draft${data.blogDrafts === 1 ? "" : "s"}` : "published"}
            href="/portal/admin/blog"
          />
          <StatBlock
            label="Portfolio"
            primary={data.portfolioTotal}
            secondary={data.portfolioFeatured > 0 ? `${data.portfolioFeatured} featured` : "total"}
            href="/portal/admin/portfolio"
          />
        </div>

        {data.latestPortfolio.length > 0 && (
          <div className="mt-1">
            <p
              style={{
                fontFamily: MONO,
                fontSize: 9,
                letterSpacing: "0.24em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.30)",
                margin: 0,
                marginBottom: 8,
              }}
            >
              Latest Projects
            </p>
            <div className="flex gap-2">
              {data.latestPortfolio.slice(0, 2).map((p) => {
                const cover = p.images?.[0];
                return (
                  <div
                    key={p.id}
                    className="relative overflow-hidden rounded-md border border-white/[0.06]"
                    style={{ width: 56, height: 56, background: "#0a1020" }}
                    title={p.title}
                  >
                    {cover ? (
                      <Image src={cover} alt={p.title} fill className="object-cover" sizes="56px" />
                    ) : (
                      <span
                        className="absolute inset-0 flex items-center justify-center"
                        style={{
                          fontFamily: SERIF,
                          fontStyle: "italic",
                          fontSize: 22,
                          color: "rgba(255,255,255,0.25)",
                        }}
                      >
                        {p.title?.[0] ?? "·"}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </MetricCard>
  );
}

function StatBlock({
  label,
  primary,
  secondary,
  href,
}: {
  label: string;
  primary: number;
  secondary: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group block rounded-lg border border-white/[0.04] bg-white/[0.01] p-3 transition-all hover:border-white/[0.12] hover:bg-white/[0.03]"
    >
      <p
        style={{
          fontFamily: MONO,
          fontSize: 9,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.40)",
          margin: 0,
        }}
      >
        {label}
      </p>
      <p
        className="mt-2 leading-none"
        style={{
          fontFamily: SERIF,
          fontStyle: "italic",
          fontSize: 32,
          color: "white",
          margin: 0,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {primary}
      </p>
      <p
        style={{
          fontFamily: MONO,
          fontSize: 9.5,
          letterSpacing: "0.12em",
          color: "rgba(255,255,255,0.35)",
          margin: 0,
          marginTop: 8,
        }}
      >
        {secondary}
      </p>
    </Link>
  );
}
