type TechItem = {
  name: string;
  src: string;
  /** Wordmark SVGs already include the brand name; icon-only SVGs need a text label beside them. */
  showLabel: boolean;
};

const tech: TechItem[] = [
  { name: "Vercel", src: "/tech/vercel.svg", showLabel: false },
  { name: "TypeScript", src: "/tech/typescript.svg", showLabel: true },
  { name: "Tailwind CSS", src: "/tech/tailwindcss.svg", showLabel: false },
  { name: "React", src: "/tech/react.svg", showLabel: true },
  { name: "Supabase", src: "/tech/supabase.svg", showLabel: false },
  { name: "GitHub", src: "/tech/github.svg", showLabel: false },
  { name: "Bun", src: "/tech/bun.svg", showLabel: true },
  { name: "Next.js", src: "/tech/nextjs.svg", showLabel: true },
];

export function TechStackMarquee() {
  return (
    <section className="relative pt-16 pb-12 bg-[var(--color-background)] overflow-hidden">
      <div className="mb-10 text-center">
        <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/35">
          Powered by
        </span>
      </div>

      <div className="group relative overflow-hidden">
        <div className="flex shrink-0 items-center [gap:var(--gap)] animate-marquee group-hover:[animation-play-state:paused] motion-reduce:[animation-play-state:paused] [--gap:4rem] [--duration:42s]">
          {Array.from({ length: 3 }).flatMap((_, setIdx) =>
            tech.map((item) => (
              <div
                key={`${setIdx}-${item.name}`}
                className="group/item flex flex-shrink-0 items-center gap-3 transition-transform duration-300 hover:scale-[1.06]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.src}
                  alt={item.name}
                  className="h-5 w-auto opacity-50 brightness-0 invert transition-all duration-300 group-hover/item:opacity-100 group-hover/item:drop-shadow-[0_0_14px_rgba(0,240,255,0.45)] md:h-6"
                />
                {item.showLabel && (
                  <span className="whitespace-nowrap text-[15px] font-semibold text-white/45 transition-colors duration-300 group-hover/item:text-white">
                    {item.name}
                  </span>
                )}
              </div>
            )),
          )}
        </div>

        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-32 backdrop-blur-sm md:w-48"
          style={{
            maskImage: "linear-gradient(to right, black, transparent)",
            WebkitMaskImage: "linear-gradient(to right, black, transparent)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-32 backdrop-blur-sm md:w-48"
          style={{
            maskImage: "linear-gradient(to left, black, transparent)",
            WebkitMaskImage: "linear-gradient(to left, black, transparent)",
          }}
        />
      </div>
    </section>
  );
}
