// src/app/admin/layout.tsx
import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Control Room — Aurexis',
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-screen bg-[#03050A]">{children}</div>;
}
