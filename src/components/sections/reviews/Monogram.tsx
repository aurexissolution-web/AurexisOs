import { cn } from "@/lib/utils";

function getInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

interface MonogramProps {
  name: string;
  size?: number;
  className?: string;
}

/**
 * Clean typographic monogram derived from the client/company name.
 * No colored orb, no gradient glow — just initials in a bordered mark.
 */
export function Monogram({ name, size = 40, className }: MonogramProps) {
  return (
    <div
      aria-hidden
      className={cn(
        "relative flex shrink-0 items-center justify-center rounded-full border border-white/[0.14] bg-gradient-to-b from-white/[0.05] to-white/[0.01] font-mono font-semibold text-[var(--color-electric-cyan)]/90",
        className
      )}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.34,
        letterSpacing: "0.01em",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06), 0 4px 14px rgba(0,0,0,0.35)",
      }}
    >
      <span
        className="pointer-events-none absolute inset-0 rounded-full"
        style={{ boxShadow: "inset 0 0 0 1px rgba(0,240,255,0.12)" }}
      />
      {getInitials(name)}
    </div>
  );
}
