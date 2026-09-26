import Link from 'next/link';
import type { Metadata } from 'next';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'Page not found | Aurexis Solution',
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col" style={{ background: '#02040A', color: '#f5f5f7' }}>
      <Navbar />
      <main id="main" className="flex flex-1 items-center justify-center px-6 py-32">
        <div className="max-w-xl text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.26em] text-[#00F0FF]">Error 404</p>
          <h1 className="mt-6 text-5xl font-extrabold leading-[1.02] tracking-[-0.04em] md:text-7xl">
            This page <span className="font-serif font-normal italic text-[#00F0FF]">wandered off.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-md text-[16px] leading-relaxed text-[#94a3b8]">
            The link may be old or mistyped. Head back to the homepage, or tell us what you were looking for and we will point you the right way.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link href="/" className="rounded-full bg-[#00F0FF] px-6 py-3 text-[14px] font-semibold text-[#02040A] transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
              Back to home
            </Link>
            <Link href="/contact" className="rounded-full border border-white/20 px-6 py-3 text-[14px] font-medium text-white/90 transition-colors hover:border-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00F0FF]">
              Contact us
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
