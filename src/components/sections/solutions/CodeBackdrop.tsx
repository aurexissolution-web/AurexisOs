// src/components/sections/solutions/CodeBackdrop.tsx
// Slow-scrolling, dimmed code behind a section's cards. Columns are passed in
// so each solutions page can show code that matches what it sells.
import { SOLUTION_NOISE } from './SolutionGlow';

const TOKEN_RE =
  /(\/\/.*$|'[^']*'|"[^"]*"|\b(?:import|export|from|const|await|async|function|return|default|if)\b|<\/?[A-Za-z]+|\/?>)/g;

function CodeLine({ line, rgb }: { line: string; rgb: string }) {
  const accent = (a: number) => `rgba(${rgb},${a})`;
  if (!line) return <div className="h-[1.9em]" />;
  const parts = line.split(TOKEN_RE);
  return (
    <div className="whitespace-pre">
      {parts.map((part, i) => {
        if (!part) return null;
        let color = 'rgba(255,255,255,0.7)';
        if (part.startsWith('//')) color = 'rgba(255,255,255,0.4)';
        else if (part.startsWith("'") || part.startsWith('"')) color = accent(0.75);
        else if (/^(import|export|from|const|await|async|function|return|default|if)$/.test(part))
          color = accent(1);
        else if (part.startsWith('<') || part.endsWith('>')) color = 'rgba(130,200,255,0.75)';
        return (
          <span key={i} style={{ color }}>
            {part}
          </span>
        );
      })}
    </div>
  );
}

export function CodeBackdrop({ columns, rgb }: { columns: string[][]; rgb: string }) {
  const accent = (a: number) => `rgba(${rgb},${a})`;
  const speeds = ['90s', '120s', '105s'];
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 select-none overflow-hidden">
      <div
        className="absolute inset-0 grid grid-cols-1 gap-10 px-6 opacity-[0.16] md:grid-cols-2 lg:grid-cols-3"
        style={{
          maskImage: 'linear-gradient(to bottom, transparent, black 6%, black 96%, transparent)',
        }}
      >
        {columns.map((lines, c) => (
          <div
            key={c}
            className={`overflow-hidden font-mono text-[14px] leading-[1.9] ${
              c === 1 ? 'hidden md:block' : c === 2 ? 'hidden lg:block' : ''
            }`}
          >
            <div
              className="animate-presence-scroll will-change-transform motion-reduce:animate-none"
              style={{ animationDuration: speeds[c], marginTop: `${c * -120}px` }}
            >
              {Array.from({ length: 4 }, (_, copy) => (
                <div key={copy} className="pb-[1.9em]">
                  {lines.map((line, i) => (
                    <CodeLine key={i} line={line} rgb={rgb} />
                  ))}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Darken so the cards and heading stay the focus */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(50% 30% at 18% 6%, rgba(2,4,10,0.88), transparent 75%), radial-gradient(40% 18% at 72% 8%, rgba(2,4,10,0.85), transparent 80%), radial-gradient(60% 40% at 90% 0%, ${accent(0.12)}, transparent 70%)`,
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.1] mix-blend-overlay"
        style={{ backgroundImage: SOLUTION_NOISE }}
      />
    </div>
  );
}
