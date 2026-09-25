// src/app/admin/login/page.tsx
import Image from 'next/image';
import { redirect } from 'next/navigation';
import { getAdminUser } from '@/lib/auth/admin';
import { LoginForm } from '@/components/admin/LoginForm';
import { DarkGradientBg } from '@/components/admin/DarkGradientBg';

export const dynamic = 'force-dynamic';

export default async function AdminLoginPage() {
  if (await getAdminUser()) redirect('/admin');

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden px-5 text-white">
      <DarkGradientBg />

      <div className="relative w-full max-w-[400px]">
        <div className="mb-8 flex flex-col items-center text-center">
          <Image
            src="/brand/aurexis-mark.png"
            alt="Aurexis"
            width={48}
            height={44}
            className="h-11 w-auto"
            priority
          />
          <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.3em] text-[#5EE3DA]">
            Control room
          </p>
          <h1 className="mt-2 text-[28px] font-extrabold tracking-[-0.03em]">
            Welcome <span className="font-serif font-normal italic text-[#5EE3DA]">back.</span>
          </h1>
          <p className="mt-1.5 text-[13.5px] text-white/70 [text-shadow:0_0_12px_rgba(0,0,0,0.8)]">
            Sign in to manage leads, posts, work and reviews.
          </p>
        </div>

        <div className="rounded-3xl border border-white/[0.1] bg-[#05070C]/70 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_40px_120px_-30px_rgba(0,0,0,0.95)] backdrop-blur-xl">
          <LoginForm />
        </div>

        <p className="mt-6 text-center text-[12px] text-white/50 [text-shadow:0_0_10px_rgba(0,0,0,0.8)]">
          Admin accounts only. Access is checked on every page.
        </p>
      </div>
    </main>
  );
}
