import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Accounts — Aurexis',
  robots: { index: false, follow: false },
};

export default function AccountsRootLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-screen bg-[#03050A] text-white">{children}</div>;
}
