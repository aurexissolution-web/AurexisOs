'use client';

// src/components/admin/ReviewsBoard.tsx
import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, ExternalLink, Mail, Pin, PinOff, RotateCcw, Star, Trash2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Review } from '@/types/portal';
import { ReviewAvatar } from '@/components/sections/reviews/ReviewAvatar';
import { deleteReview, setReviewFeatured, setReviewStatus } from '@/app/admin/actions';
import { Button, ButtonLink, EmptyState, PageHeader, Segmented, useToast } from './ui';
import { RelativeTime } from './RelativeTime';

type Tab = 'pending' | 'approved' | 'rejected';

function Stars({ n }: { n: number }) {
  return (
    <span className="flex gap-0.5" aria-label={`${n} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={cn('h-3.5 w-3.5', i <= n ? 'fill-[#F0C88F] text-[#F0C88F]' : 'text-white/15')}
        />
      ))}
    </span>
  );
}

export function ReviewsBoard({ reviews: initial }: { reviews: Review[] }) {
  const router = useRouter();
  const toast = useToast();
  const [reviews, setReviews] = useState(initial);
  const [tab, setTab] = useState<Tab>(
    initial.some((r) => r.status === 'pending') ? 'pending' : 'approved',
  );
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [, start] = useTransition();
  useEffect(() => setReviews(initial), [initial]);

  const count = (t: Tab) => reviews.filter((r) => r.status === t).length;
  const shown = reviews.filter((r) => r.status === tab);
  const avg = (() => {
    const a = reviews.filter((r) => r.status === 'approved');
    return a.length ? (a.reduce((s, r) => s + r.rating, 0) / a.length).toFixed(1) : '—';
  })();

  function mutate(
    id: string,
    patch: Partial<Review>,
    run: () => Promise<{ ok: boolean }>,
    msg: string,
  ) {
    const before = reviews;
    setReviews((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));
    start(async () => {
      const res = await run();
      if (!res.ok) {
        setReviews(before);
        toast('error', 'Something went wrong');
      } else {
        toast('ok', msg);
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Homepage social proof"
        title="Client"
        accent="reviews."
        description="Approved reviews appear on the homepage. Pin your best ones to show them first."
        actions={
          <ButtonLink href="/#reviews" external>
            View on homepage <ExternalLink className="h-3.5 w-3.5" />
          </ButtonLink>
        }
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Segmented<Tab>
          value={tab}
          onChange={setTab}
          options={[
            { value: 'pending', label: `Pending · ${count('pending')}`, color: '#F0C88F' },
            { value: 'approved', label: `Live · ${count('approved')}`, color: '#7FE8C4' },
            { value: 'rejected', label: `Rejected · ${count('rejected')}`, color: '#F08F8F' },
          ]}
        />
        <p className="flex items-center gap-2 text-[13px] text-white/50">
          <Star className="h-4 w-4 fill-[#F0C88F] text-[#F0C88F]" />
          <span className="font-semibold text-white">{avg}</span> average from {count('approved')}{' '}
          live
        </p>
      </div>

      {shown.length === 0 ? (
        <div className="rounded-2xl border border-white/[0.14] bg-white/[0.02]">
          <EmptyState
            icon={<Star className="h-5 w-5" />}
            title={
              tab === 'pending'
                ? 'No reviews waiting'
                : tab === 'approved'
                  ? 'No live reviews yet'
                  : 'Nothing rejected'
            }
            body={
              tab === 'pending'
                ? 'When a client leaves a review from the homepage, it waits here for your approval.'
                : 'Approve a pending review and it will show here and on the homepage.'
            }
          />
        </div>
      ) : (
        <ul className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
          <AnimatePresence initial={false}>
            {shown.map((r) => (
              <motion.li
                key={r.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                className={cn(
                  'flex flex-col rounded-2xl border bg-white/[0.025] p-5',
                  r.featured ? 'border-[#F0C88F]/40' : 'border-white/[0.14]',
                )}
              >
                <div className="flex items-start gap-3">
                  <ReviewAvatar avatarKey={r.avatar_key} size={40} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[14px] font-semibold text-white">{r.name}</p>
                    <p className="truncate text-[12px] text-white/45">{r.role || '—'}</p>
                  </div>
                  {r.featured && (
                    <span className="flex items-center gap-1 rounded-full bg-[#F0C88F]/15 px-2 py-0.5 text-[10.5px] font-medium text-[#F0C88F]">
                      <Pin className="h-3 w-3" /> Pinned
                    </span>
                  )}
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <Stars n={r.rating} />
                  <RelativeTime iso={r.created_at} className="text-[11.5px] text-white/35" />
                </div>
                <blockquote className="mt-3 flex-1 text-[14px] leading-[1.65] text-white/80">
                  &ldquo;{r.content}&rdquo;
                </blockquote>
                {r.email && (
                  <a
                    href={`mailto:${r.email}`}
                    className="mt-3 flex items-center gap-1.5 text-[12px] text-white/40 hover:text-white/70"
                  >
                    <Mail className="h-3.5 w-3.5" /> {r.email}
                  </a>
                )}

                <div className="mt-4 flex flex-wrap gap-2 border-t border-white/[0.12] pt-4">
                  {r.status === 'pending' && (
                    <>
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() =>
                          mutate(
                            r.id,
                            { status: 'approved' },
                            () => setReviewStatus(r.id, 'approved'),
                            'Approved — now live',
                          )
                        }
                      >
                        <Check className="h-3.5 w-3.5" /> Approve
                      </Button>
                      <Button
                        size="sm"
                        onClick={() =>
                          mutate(
                            r.id,
                            { status: 'rejected' },
                            () => setReviewStatus(r.id, 'rejected'),
                            'Rejected',
                          )
                        }
                      >
                        <X className="h-3.5 w-3.5" /> Reject
                      </Button>
                    </>
                  )}
                  {r.status === 'approved' && (
                    <>
                      <Button
                        size="sm"
                        onClick={() =>
                          mutate(
                            r.id,
                            { featured: !r.featured },
                            () => setReviewFeatured(r.id, !r.featured),
                            r.featured ? 'Unpinned' : 'Pinned to the front',
                          )
                        }
                      >
                        {r.featured ? (
                          <PinOff className="h-3.5 w-3.5" />
                        ) : (
                          <Pin className="h-3.5 w-3.5" />
                        )}
                        {r.featured ? 'Unpin' : 'Pin'}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          mutate(
                            r.id,
                            { status: 'pending', featured: false },
                            () => setReviewStatus(r.id, 'pending'),
                            'Taken off the homepage',
                          )
                        }
                      >
                        <RotateCcw className="h-3.5 w-3.5" /> Unpublish
                      </Button>
                    </>
                  )}
                  {r.status === 'rejected' && (
                    <Button
                      size="sm"
                      onClick={() =>
                        mutate(
                          r.id,
                          { status: 'pending' },
                          () => setReviewStatus(r.id, 'pending'),
                          'Moved back to pending',
                        )
                      }
                    >
                      <RotateCcw className="h-3.5 w-3.5" /> Reconsider
                    </Button>
                  )}
                  <span className="ml-auto">
                    {confirmDelete === r.id ? (
                      <span className="flex gap-1.5">
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => {
                            setConfirmDelete(null);
                            const before = reviews;
                            setReviews((rs) => rs.filter((x) => x.id !== r.id));
                            start(async () => {
                              const res = await deleteReview(r.id);
                              if (!res.ok) {
                                setReviews(before);
                                toast('error', 'Couldn’t delete');
                              } else {
                                toast('ok', 'Deleted');
                                router.refresh();
                              }
                            });
                          }}
                        >
                          Delete
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setConfirmDelete(null)}>
                          Cancel
                        </Button>
                      </span>
                    ) : (
                      <Button
                        size="sm"
                        variant="ghost"
                        aria-label="Delete review"
                        onClick={() => setConfirmDelete(r.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </span>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
    </div>
  );
}
