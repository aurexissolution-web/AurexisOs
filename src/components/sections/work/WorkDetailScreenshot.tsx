// src/components/sections/work/WorkDetailScreenshot.tsx
export function WorkDetailScreenshot({
  screenshotUrl,
  clientName,
}: {
  screenshotUrl: string;
  clientName: string;
}) {
  return (
    <section className="border-t border-white/[0.08] px-6 py-16 md:py-20">
      <div className="mx-auto max-w-5xl">
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/40">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={screenshotUrl}
            alt={clientName}
            className="w-full object-cover"
            loading="lazy"
          />
        </div>
      </div>
    </section>
  );
}
