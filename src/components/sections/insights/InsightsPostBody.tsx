// src/components/sections/insights/InsightsPostBody.tsx
import ReactMarkdown, { type Components } from 'react-markdown';
import { INSIGHTS_ACCENT } from '@/data/insights-config';

const components: Components = {
  h1: ({ children }) => (
    <h2 className="mt-10 font-serif text-2xl italic leading-[1.2] tracking-[-0.01em] text-white first:mt-0 md:text-3xl">
      {children}
    </h2>
  ),
  h2: ({ children }) => (
    <h2 className="mt-10 font-serif text-2xl italic leading-[1.2] tracking-[-0.01em] text-white first:mt-0 md:text-3xl">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mt-8 text-lg font-semibold tracking-[-0.01em] text-white">{children}</h3>
  ),
  p: ({ children }) => (
    <p className="mt-5 text-[15px] leading-[1.75] text-white/65 first:mt-0 md:text-[16px]">
      {children}
    </p>
  ),
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="underline decoration-white/25 underline-offset-4 transition-colors hover:decoration-current"
      style={{ color: INSIGHTS_ACCENT }}
    >
      {children}
    </a>
  ),
  strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
  em: ({ children }) => (
    <em className="font-serif italic" style={{ color: INSIGHTS_ACCENT }}>
      {children}
    </em>
  ),
  ul: ({ children }) => <ul className="mt-5 flex flex-col gap-2.5">{children}</ul>,
  ol: ({ children }) => <ol className="mt-5 flex flex-col gap-2.5">{children}</ol>,
  li: ({ children }) => (
    <li className="flex items-start gap-3 text-[15px] leading-[1.65] text-white/65 md:text-[16px]">
      <span aria-hidden className="mt-[9px] h-1 w-1 shrink-0 rounded-full bg-white/35" />
      <span>{children}</span>
    </li>
  ),
  blockquote: ({ children }) => (
    <blockquote
      className="mt-6 border-l-2 pl-5 font-serif text-lg italic leading-[1.5] text-white/75"
      style={{ borderColor: INSIGHTS_ACCENT }}
    >
      {children}
    </blockquote>
  ),
  code: ({ children }) => (
    <code className="rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-[13px] text-white/85">
      {children}
    </code>
  ),
  pre: ({ children }) => (
    <pre className="mt-5 overflow-x-auto rounded-xl border border-white/10 bg-black/40 p-4 font-mono text-[13px] leading-[1.6] text-white/80">
      {children}
    </pre>
  ),
};

export function InsightsPostBody({ body }: { body: string }) {
  return (
    <section className="border-t border-white/[0.08] px-6 py-16 md:py-20">
      <div className="mx-auto max-w-3xl">
        <ReactMarkdown components={components}>{body}</ReactMarkdown>
      </div>
    </section>
  );
}
