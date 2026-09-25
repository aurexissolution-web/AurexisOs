import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Documents — Aurexis',
  robots: { index: false, follow: false },
};

export default function DocumentsRootLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#03050A] text-white">
      {children}
    </div>
  );
}
