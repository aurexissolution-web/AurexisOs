import React from "react";
import { cn } from "@/lib/utils";

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hoverEffect?: boolean;
}

export function GlassCard({ children, className, hoverEffect = false, ...props }: GlassCardProps) {
  return (
    <div
      className={cn(
        "glass rounded-2xl p-6 md:p-8 transition-all duration-300",
        hoverEffect && "hover:border-[#00F0FF]/50 hover:shadow-[0_0_30px_rgba(0,240,255,0.15)] hover:-translate-y-1 group",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
