"use client";

import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface NavLogoProps {
  mode?: "lockup" | "mark" | "auto";
  collapsed?: boolean;
  className?: string;
  onNavigate?: () => void;
}

export function NavLogo({
  mode = "auto",
  collapsed = false,
  className,
  onNavigate,
}: NavLogoProps) {
  const resolved = mode === "auto" ? (collapsed ? "mark" : "lockup") : mode;

  return (
    <Link
      href="/"
      onClick={onNavigate}
      aria-label="Aurexis Solution — Home"
      className={cn(
        "group inline-flex flex-shrink-0 items-center outline-none focus-visible:ring-2 focus-visible:ring-[#00F0FF]/60 focus-visible:ring-offset-4 focus-visible:ring-offset-transparent rounded-sm",
        className,
      )}
    >
      {resolved === "mark" ? (
        <Image
          src="/brand/aurexis-mark.png"
          alt=""
          width={340}
          height={312}
          priority
          sizes="28px"
          className="h-7 w-auto object-contain transition-opacity duration-200 group-hover:opacity-90"
        />
      ) : (
        <Image
          src="/brand/aurexis-lockup.png"
          alt=""
          width={902}
          height={186}
          priority
          sizes="146px"
          className="h-7 w-auto object-contain transition-opacity duration-200 group-hover:opacity-90"
        />
      )}
    </Link>
  );
}

export default NavLogo;
