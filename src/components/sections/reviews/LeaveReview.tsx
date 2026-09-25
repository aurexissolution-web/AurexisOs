'use client';

// src/components/sections/reviews/LeaveReview.tsx
// "Leave a review" button + dialog. Submits to /api/reviews as pending; an
// admin approves it in /admin/reviews before it appears on the homepage.
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { CheckCircle2, Loader2, X } from 'lucide-react';
import type { ReviewAvatarKey } from '@/types/portal';
import { StarRating } from './StarRating';
import { AvatarPicker } from './AvatarPicker';

const input =
  'w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-[14px] text-white outline-none transition-colors placeholder:text-white/25 focus:border-[#00F0FF]/50 focus:ring-2 focus:ring-[#00F0FF]/15';
const label = 'mb-1.5 block font-mono text-[10px] uppercase tracking-[0.18em] text-white/45';

export function LeaveReview({ variant = 'link' }: { variant?: 'link' | 'button' }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [rating, setRating] = useState(5);
  const [avatar, setAvatar] = useState<ReviewAvatarKey>('cyan');
  const [content, setContent] = useState('');

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setState('sending');
    setErrors({});
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fd.get('name'),
          role: fd.get('role'),
          email: fd.get('email'),
          website: fd.get('website'),
          content,
          rating,
          avatarKey: avatar,
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (res.ok) return setState('sent');
      setErrors(
        body.errors ?? {
          form: body.error ?? 'Something went wrong. Please try again.',
        },
      );
      setState('idle');
    } catch {
      setErrors({ form: 'Network error. Please try again.' });
      setState('idle');
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          variant === 'button'
            ? 'inline-flex items-center gap-2 rounded-full border border-[var(--color-electric-cyan)]/40 bg-[var(--color-electric-cyan)]/[0.06] px-6 py-3 text-[14px] font-semibold text-white transition-all hover:-translate-y-0.5 hover:border-[var(--color-electric-cyan)]/70'
            : 'rounded text-[var(--color-electric-cyan)]/80 underline-offset-4 transition-colors hover:text-[var(--color-electric-cyan)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-electric-cyan)]/60'
        }
      >
        Leave a review
      </button>

      <dialog
        ref={dialog}
        onClose={() => setOpen(false)}
        onClick={(e) => e.target === e.currentTarget && setOpen(false)}
        data-lenis-prevent
        aria-labelledby="leave-review-title"
        className="m-auto max-h-[92vh] w-[min(560px,calc(100%-2rem))] overflow-y-auto rounded-3xl text-left border border-white/10 bg-[#070B12] p-0 text-white shadow-[0_40px_120px_-30px_rgba(0,0,0,0.9)] backdrop:bg-black/70 backdrop:backdrop-blur-sm"
      >
        <div className="relative p-6 md:p-8">
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close"
            className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full text-white/50 hover:bg-white/[0.06] hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>

          {state === 'sent' ? (
            <div className="flex flex-col items-center py-8 text-center">
              <CheckCircle2 className="h-12 w-12 text-[#00F0FF]" />
              <h2 id="leave-review-title" className="mt-4 text-[22px] font-bold">
                Thank you!
              </h2>
              <p className="mt-2 max-w-sm text-[14px] leading-[1.6] text-white/60">
                Your review is with us for a quick check. Once approved, it’ll appear on our
                homepage.
              </p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="mt-6 rounded-full border border-white/15 px-6 py-2.5 text-[13px] font-semibold hover:border-white/30"
              >
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={submit} noValidate>
              <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#00F0FF]">
                Client review
              </p>
              <h2
                id="leave-review-title"
                className="mt-2 text-[24px] font-extrabold tracking-[-0.02em]"
              >
                How was working with{' '}
                <span className="font-serif font-normal italic text-[#00F0FF]">us?</span>
              </h2>

              <div className="mt-6 space-y-4">
                <div>
                  <span className={label}>Your rating</span>
                  <StarRating value={rating} onChange={setRating} size={28} />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="rv-name" className={label}>
                      Name or business *
                    </label>
                    <input
                      id="rv-name"
                      name="name"
                      maxLength={80}
                      required
                      className={input}
                      placeholder="Kerala Ayurvedic Lifestyle"
                    />
                    {errors.name && <p className="mt-1 text-[12px] text-red-300">{errors.name}</p>}
                  </div>
                  <div>
                    <label htmlFor="rv-role" className={label}>
                      Role
                    </label>
                    <input
                      id="rv-role"
                      name="role"
                      maxLength={80}
                      className={input}
                      placeholder="Founder · Clinic"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="rv-content" className={label}>
                    Your review *
                    <span className="float-right normal-case tracking-normal text-white/30">
                      {content.length}/320
                    </span>
                  </label>
                  <textarea
                    id="rv-content"
                    rows={4}
                    maxLength={320}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className={input}
                    placeholder="What changed for your business after working with us?"
                  />
                  {errors.content && (
                    <p className="mt-1 text-[12px] text-red-300">{errors.content}</p>
                  )}
                </div>
                <div>
                  <span className={label}>Pick an avatar</span>
                  <AvatarPicker value={avatar} onChange={setAvatar} />
                </div>
                <div>
                  <label htmlFor="rv-email" className={label}>
                    Email{' '}
                    <span className="normal-case tracking-normal text-white/30">
                      (optional, never shown)
                    </span>
                  </label>
                  <input
                    id="rv-email"
                    name="email"
                    type="email"
                    maxLength={160}
                    className={input}
                    placeholder="you@business.com"
                  />
                  {errors.email && <p className="mt-1 text-[12px] text-red-300">{errors.email}</p>}
                </div>
                {/* Honeypot: hidden from people, irresistible to bots. */}
                <input
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden
                  className="absolute -left-[9999px] h-0 w-0 opacity-0"
                />
              </div>

              {errors.form && (
                <p
                  role="alert"
                  className="mt-4 rounded-xl border border-red-400/25 bg-red-400/[0.07] px-3.5 py-2.5 text-[13px] text-red-300"
                >
                  {errors.form}
                </p>
              )}

              <button
                type="submit"
                disabled={state === 'sending'}
                className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#00F0FF] text-[14px] font-semibold text-[#02040A] shadow-[0_0_30px_-8px_rgba(0,240,255,0.7)] transition hover:brightness-110 disabled:opacity-60"
              >
                {state === 'sending' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Submit review'
                )}
              </button>
              <p className="mt-3 text-center text-[11.5px] text-white/35">
                Reviews are checked before they go live.
              </p>
            </form>
          )}
        </div>
      </dialog>
    </>
  );
}
