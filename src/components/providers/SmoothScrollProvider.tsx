"use client";

import { ReactLenis } from 'lenis/react';
import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { isFounderCardRoute } from '@/lib/founder-card/routes';

export default function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  if (isFounderCardRoute(pathname)) {
    return children;
  }

  return (
    <ReactLenis
      root
      options={{
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Expo.easeOut
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 2,
      }}
    >
      {children}
    </ReactLenis>
  );
}
