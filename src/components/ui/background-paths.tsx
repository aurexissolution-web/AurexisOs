"use client";

import { motion } from "framer-motion";

interface FloatingPathsProps {
  position: number;
  themeColor?: string;
}

/**
 * Convert hex like "#00F0FF" to an RGB string like "0, 240, 255" for rgba() use
 */
function hexToRgbString(hex?: string): string {
  if (!hex) return "255, 255, 255"; // fallback to white
  const clean = hex.replace("#", "");
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return `${r}, ${g}, ${b}`;
}

export function FloatingPaths({ position, themeColor }: FloatingPathsProps) {
  const rgbString = hexToRgbString(themeColor);

  const paths = Array.from({ length: 36 }, (_, i) => ({
    id: i,
    d: `M-${380 - i * 5 * position} -${189 + i * 6}C-${
      380 - i * 5 * position
    } -${189 + i * 6} -${312 - i * 5 * position} ${216 - i * 6} ${
      152 - i * 5 * position
    } ${343 - i * 6}C${616 - i * 5 * position} ${470 - i * 6} ${
      684 - i * 5 * position
    } ${875 - i * 6} ${684 - i * 5 * position} ${875 - i * 6}`,
    color: `rgba(${rgbString}, ${0.1 + i * 0.03})`,
    width: 0.5 + i * 0.03,
  }));

  return (
    <div className="absolute inset-0 pointer-events-none">
      <svg
        className="w-full h-full text-white"
        viewBox="0 0 696 316"
        fill="none"
      >
        <title>Background Paths</title>
        {paths.map((path) => (
          <motion.path
            key={path.id}
            d={path.d}
            stroke={path.color}
            strokeWidth={path.width}
            strokeOpacity={0.1 + path.id * 0.03}
            initial={{ pathLength: 0.3, opacity: 0.6 }}
            animate={{
              pathLength: 1,
              opacity: [0.3, 0.6, 0.3],
              pathOffset: [0, 1, 0],
            }}
            transition={{
              duration: 20 + ((path.id * 17) % 10),
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
          />
        ))}
      </svg>
    </div>
  );
}

interface BackgroundPathsProps {
  className?: string;
  themeColor?: string;
}

export function BackgroundPaths({ className = "", themeColor }: BackgroundPathsProps) {
  return (
    <div className={`absolute inset-0 w-full h-full flex items-center justify-center overflow-hidden pointer-events-none ${className}`}>
      {/* Container holding the animated paths behind everything else */}
      <div className="absolute inset-0">
        <FloatingPaths position={1} themeColor={themeColor} />
        <FloatingPaths position={-1} themeColor={themeColor} />
      </div>
    </div>
  );
}
