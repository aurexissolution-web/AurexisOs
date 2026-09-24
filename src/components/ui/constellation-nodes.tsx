"use client";

import { cn } from "@/lib/utils";

type Corner = "tl" | "tr" | "bl" | "br";

type Node = {
  color: string;
  corner: Corner;
  pulseDelay: string;
};

const NODES: Node[] = [
  { color: "#00F0FF", corner: "tl", pulseDelay: "0s" },
  { color: "#8B5CF6", corner: "tr", pulseDelay: "0.9s" },
  { color: "#10B981", corner: "bl", pulseDelay: "1.8s" },
  { color: "#F59E0B", corner: "br", pulseDelay: "2.7s" },
];

const CORNER_POS: Record<Corner, { top?: string; right?: string; bottom?: string; left?: string }> = {
  tl: { top: "44px", left: "44px" },
  tr: { top: "44px", right: "44px" },
  bl: { bottom: "44px", left: "44px" },
  br: { bottom: "44px", right: "44px" },
};

export function ConstellationNodes({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "constellation-nodes pointer-events-none absolute inset-0 hidden md:block",
        className,
      )}
    >
      <style>{`
        @keyframes nodeCorePulse {
          0%, 100% { opacity: 0.7; transform: scale(1); }
          50%      { opacity: 1;   transform: scale(1.18); }
        }
        @keyframes nodeHaloBreath {
          0%, 100% { opacity: 0.35; }
          50%      { opacity: 0.6;  }
        }
        @media (prefers-reduced-motion: no-preference) {
          .constellation-nodes .node-core { animation: nodeCorePulse 3.6s ease-in-out infinite; }
          .constellation-nodes .node-halo { animation: nodeHaloBreath 3.6s ease-in-out infinite; }
        }
      `}</style>

      {NODES.map((node) => {
        const pos = CORNER_POS[node.corner];
        return (
          <div
            key={node.corner}
            className="absolute"
            style={{
              top: pos.top,
              right: pos.right,
              bottom: pos.bottom,
              left: pos.left,
            }}
          >
            <div className="relative flex items-center justify-center w-3 h-3">
              <div
                className="node-halo absolute inset-[-10px] rounded-full"
                style={{
                  background: `radial-gradient(circle, ${node.color} 0%, transparent 70%)`,
                  filter: "blur(6px)",
                  animationDelay: node.pulseDelay,
                }}
              />
              <div
                className="node-core relative w-2 h-2 rounded-full"
                style={{
                  backgroundColor: node.color,
                  boxShadow: `0 0 10px ${node.color}, 0 0 20px ${node.color}80`,
                  animationDelay: node.pulseDelay,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
