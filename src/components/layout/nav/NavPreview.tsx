// src/components/layout/nav/NavPreview.tsx
// Hover preview inside the menu overlay — one real snapshot per destination.
import Image from "next/image";
import { SERVICES } from "@/data/solutions-services";
import { PRESENCE_HERO_SHOWCASE } from "@/data/presence-config";

function Caption({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#010204] via-[#010204]/80 to-transparent p-6 pt-16">
      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#5EE3DA]">
        {eyebrow}
      </p>
      <p className="mt-1.5 font-serif text-[22px] italic leading-tight text-white">
        {title}
      </p>
    </div>
  );
}

function SolutionsPreview() {
  return (
    <div className="absolute inset-0 flex flex-col gap-1.5 p-5 pb-28">
      {SERVICES.map((s) => (
        <div
          key={s.name}
          className="flex items-center gap-3 rounded-xl border px-3.5 py-2"
          style={{ borderColor: `${s.accent}40`, background: `${s.accent}0D` }}
        >
          <span
            className="h-2 w-2 shrink-0 rounded-full"
            style={{ background: s.accent, boxShadow: `0 0 10px ${s.accent}` }}
          />
          <span className="text-[13px] font-semibold text-white">{s.name}</span>
          <span
            className="ml-auto font-serif text-[14px] italic"
            style={{ color: s.accent }}
          >
            {s.pricePrefix} {s.priceAmount}
          </span>
        </div>
      ))}
      <Caption
        eyebrow="Five solutions"
        title="Websites, automation, systems, WhatsApp, AI."
      />
    </div>
  );
}

function WorkPreview() {
  const { client, imageSrc } = PRESENCE_HERO_SHOWCASE;
  return (
    <>
      {imageSrc && (
        <Image
          src={imageSrc}
          alt=""
          fill
          sizes="460px"
          className="object-cover object-top"
        />
      )}
      <Caption eyebrow="Recent work" title={client} />
    </>
  );
}

function AboutPreview() {
  return (
    <>
      <Image
        src="/images/nav/about-team.webp"
        alt=""
        fill
        sizes="460px"
        className="object-cover"
      />
      <Caption eyebrow="The team" title="Sanjay & Nemila" />
    </>
  );
}

function InsightsPreview() {
  return (
    <>
      <Image
        src="/images/nav/insights.webp"
        alt=""
        fill
        sizes="460px"
        className="object-cover"
      />
      <Caption
        eyebrow="Insights"
        title="Notes on running a Malaysian business better."
      />
    </>
  );
}

function IdlePreview() {
  return (
    <>
      <Image
        src="/images/klcc-dusk.jpg"
        alt=""
        fill
        sizes="460px"
        className="object-cover"
        priority
      />
      <Caption
        eyebrow="Aurexis Solution"
        title="Built in Malaysia, for Malaysian businesses."
      />
    </>
  );
}

export function NavPreview({ href }: { href: string | null }) {
  switch (href) {
    case "/solutions":
      return <SolutionsPreview />;
    case "/work":
      return <WorkPreview />;
    case "/about":
      return <AboutPreview />;
    case "/insights":
      return <InsightsPreview />;
    default:
      return <IdlePreview />;
  }
}
