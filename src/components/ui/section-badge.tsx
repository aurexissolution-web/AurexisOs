import React from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface SectionBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  themeColor?: string;
}

export function SectionBadge({
  title,
  themeColor = "#00F0FF",
  className,
  ...props
}: SectionBadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-4 px-4 py-2 rounded-full border border-white/[0.08] bg-[#02040A]/80 backdrop-blur-sm",
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-4">
        {/* Glowing dot */}
        <div
          className="w-2.5 h-2.5 rounded-full"
          style={{
            backgroundColor: themeColor,
            boxShadow: `0 0 10px ${themeColor}, 0 0 20px ${themeColor}80`,
          }}
        />
        {/* Vertical divider */}
        <div className="h-4 w-[1px] bg-white/[0.15]" />
      </div>

      {/* Text */}
      <span
        className="text-[11px] font-mono tracking-[0.2em] font-semibold uppercase text-white"
      >
        {title}
      </span>

      {/* Chevron */}
      <ChevronRight className="w-3.5 h-3.5 text-white/40 ml-1" />
    </div>
  );
}
