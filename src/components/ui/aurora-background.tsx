"use client";

import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

interface AuroraBackgroundProps extends HTMLAttributes<HTMLDivElement> {
  showRadialGradient?: boolean;
}

export function AuroraBackground({
  className,
  showRadialGradient = true,
  ...props
}: AuroraBackgroundProps) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className,
      )}
      {...props}
    >
      <div
        className={cn(
          `[--dark-gradient:repeating-linear-gradient(100deg,#010204_0%,#010204_7%,transparent_10%,transparent_12%,#010204_16%)]
           [--aurora:repeating-linear-gradient(100deg,#0047FF_10%,#8FE9FF_15%,#00F0FF_20%,#8B5CF6_25%,#0047FF_30%)]
           [background-image:var(--dark-gradient),var(--aurora)]
           [background-size:300%,_200%]
           [background-position:50%_50%,50%_50%]
           blur-[10px]
           after:content-[""] after:absolute after:inset-0
           after:[background-image:var(--dark-gradient),var(--aurora)]
           after:[background-size:200%,_100%]
           after:animate-aurora after:[background-attachment:fixed] after:mix-blend-difference
           pointer-events-none
           absolute -inset-[10px] opacity-60 will-change-transform`,
          showRadialGradient &&
            "[mask-image:radial-gradient(ellipse_at_100%_0%,black_10%,transparent_70%)]",
        )}
      />
    </div>
  );
}
