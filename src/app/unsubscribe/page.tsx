import type { Metadata } from 'next';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { UnsubscribeButton } from './UnsubscribeButton';

export const metadata: Metadata = {
  title: 'Unsubscribe | Aurexis Solution',
  robots: { index: false, follow: false },
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function UnsubscribePage({ searchParams }: { searchParams: Promise<{ t?: string }> }) {
  const { t } = await searchParams;
  const valid = typeof t === 'string' && UUID_RE.test(t);
  return (
    <div className="flex min-h-screen flex-col" style={{ background: '#02040A', color: '#f5f5f7' }}>
      <Navbar />
      <main id="main" className="flex flex-1 items-center justify-center px-6 py-32">
        <div className="max-w-lg text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.26em] text-[#00F0FF]">Email preferences</p>
          <h1 className="mt-6 text-4xl font-extrabold tracking-[-0.03em] md:text-5xl">
            {valid ? 'Stop our emails?' : 'This link is not valid.'}
          </h1>
          <p className="mx-auto mt-5 max-w-md text-[16px] leading-relaxed text-[#94a3b8]">
            {valid
              ? 'You will stop getting tips and updates from Aurexis. You can sign up again any time.'
              : 'Open the unsubscribe link from one of our emails, or reply to that email and we will remove you.'}
          </p>
          {valid ? (
            <UnsubscribeButton token={t} />
          ) : (
            <Link href="/" className="mt-8 inline-block rounded-full border border-white/20 px-6 py-3 text-[14px] font-medium text-white/90 hover:border-white/40">
              Back to home
            </Link>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
