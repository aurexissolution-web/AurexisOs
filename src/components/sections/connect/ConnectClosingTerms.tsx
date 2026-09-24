// src/components/sections/connect/ConnectClosingTerms.tsx
import { CLOSING_TERMS } from '@/data/connect-config';

export function ConnectClosingTerms() {
  return (
    <section className="border-t border-white/[0.08] px-6 py-10 md:py-12">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-1.5">
          {CLOSING_TERMS.map((line) => (
            <p key={line} className="text-[12px] leading-[1.6] text-white/35">
              {line}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
