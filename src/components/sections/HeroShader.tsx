"use client";

import { MeshGradient } from "@paper-design/shaders-react";
import { useEffect, useRef, useState } from "react";

const SHADER_COLORS = ["#010204", "#00F0FF", "#0047FF", "#001E5C", "#0080FF"];
const ACTIVE_SPEED = 0.3;

export default function HeroShader() {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [mounted, setMounted] = useState(false);
  const [active, setActive] = useState(true);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    const node = wrapperRef.current;
    if (!node) return;

    const onVisibility = () => setActive(!document.hidden);
    document.addEventListener("visibilitychange", onVisibility);

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          setActive(entry.isIntersecting && !document.hidden);
        }
      },
      { threshold: 0 },
    );
    observer.observe(node);

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={wrapperRef}
      className="absolute inset-0 h-full w-full transition-opacity duration-[250ms] ease-out"
      style={{ opacity: mounted ? 0.2 : 0 }}
    >
      <MeshGradient
        className="h-full w-full"
        colors={SHADER_COLORS}
        speed={active ? ACTIVE_SPEED : 0}
      />
    </div>
  );
}
