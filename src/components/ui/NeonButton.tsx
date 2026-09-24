import React from "react";
import { cn } from "@/lib/utils";

export interface NeonButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  href?: string;
  asChild?: boolean;
}

export function NeonButton({ children, className, variant = "primary", href, ...props }: NeonButtonProps) {
  const baseStyles = "relative inline-flex items-center justify-center font-bold tracking-wide transition-all duration-300 rounded-lg group overflow-hidden";
  
  const variants = {
    primary: "bg-[#00F0FF] text-[#02040A] px-8 py-4 hover:neon-glow hover:-translate-y-1 shadow-[0_0_15px_rgba(0,240,255,0.4)]",
    secondary: "bg-transparent text-[#00F0FF] border border-[#00F0FF] px-8 py-4 hover:bg-[#00F0FF]/10 hover:neon-glow",
    ghost: "bg-transparent text-white hover:text-[#00F0FF] px-4 py-2 hover:bg-white/5",
  };

  if (href) {
    return (
      <a
        href={href}
        className={cn(baseStyles, variants[variant], className)}
        {...(props as unknown as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
      >
        <span className="relative z-10">{children}</span>
        {variant === "primary" && (
          <div className="absolute inset-0 bg-white/20 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300 ease-in-out" />
        )}
      </a>
    );
  }

  return (
    <button className={cn(baseStyles, variants[variant], className)} {...props}>
      <span className="relative z-10">{children}</span>
      {variant === "primary" && (
        <div className="absolute inset-0 bg-white/20 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300 ease-in-out" />
      )}
    </button>
  );
}
