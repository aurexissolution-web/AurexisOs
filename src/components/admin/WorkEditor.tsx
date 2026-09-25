'use client';

// src/components/admin/WorkEditor.tsx
// Case-study editor in five sections with a sticky outline. Cmd+S saves.
import { useEffect, useRef, useState, useTransition, type ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Eye, ImagePlus, Loader2, Plus, Trash2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { deleteCaseStudy, saveCaseStudy, type CaseStudyInput } from '@/app/admin/actions';
import { Button, ButtonLink, Input, Label, Pill, Switch, Textarea, slugify, useToast } from './ui';
import { ImageUpload, uploadFile } from './ImageUpload';

export interface WorkRow {
  id: string;
  slug: string;
  client_name: string;
  industry: string;
  location: string;
  outcome_headline: string;
  summary: string;
  problem: string;
  what_was_built: string;
  result: string;
  metrics: { value: string; label: string }[];
  services: string[];
  tech_tags: string[];
  timeline: string;
  live_url: string | null;
  cover_image_url: string | null;
  gallery: string[];
  testimonial_quote: string;
  testimonial_author: string;
  status: 'draft' | 'published';
  featured: boolean;
  display_order: number;
}

const SERVICES = [
  { key: 'presence', label: 'Presence', accent: '#5EE3DA' },
  { key: 'flow', label: 'Flow', accent: '#7FE8C4' },
  { key: 'core', label: 'Core', accent: '#8FA8F0' },
  { key: 'connect', label: 'Connect', accent: '#B08FF0' },
  { key: 'audit', label: 'AI Audit', accent: '#F0C88F' },
];

const SECTIONS = [
  ['basics', 'Basics'],
  ['story', 'The story'],
  ['proof', 'Results & proof'],
  ['media', 'Images'],
  ['publish', 'Publishing'],
] as const;

type Draft = Omit<CaseStudyInput, 'id' | 'status'>;

function fromRow(r: WorkRow | null): Draft {
  return {
    slug: r?.slug ?? '',
    clientName: r?.client_name ?? '',
    industry: r?.industry ?? '',
    location: r?.location ?? '',
    outcomeHeadline: r?.outcome_headline ?? '',
    summary: r?.summary ?? '',
    problem: r?.problem ?? '',
    whatWasBuilt: r?.what_was_built ?? '',
    result: r?.result ?? '',
    metrics: r?.metrics?.length ? r.metrics : [{ value: '', label: '' }],
    services: r?.services ?? [],
    techTags: r?.tech_tags ?? [],
    timeline: r?.timeline ?? '',
    liveUrl: r?.live_url ?? '',
    coverImageUrl: r?.cover_image_url ?? null,
    gallery: r?.gallery ?? [],
    testimonialQuote: r?.testimonial_quote ?? '',
    testimonialAuthor: r?.testimonial_author ?? '',
    featured: r?.featured ?? false,
    displayOrder: r?.display_order ?? 0,
  };
}

function Section({
  id,
  title,
  hint,
  children,
}: {
  id: string;
  title: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className="scroll-mt-24 rounded-2xl border border-white/[0.14] bg-white/[0.025] p-5 md:p-6"
    >
      <h2 className="text-[15px] font-semibold text-white">{title}</h2>
      {hint && <p className="mt-0.5 text-[12.5px] text-white/40">{hint}</p>}
      <div className="mt-5 space-y-4">{children}</div>
    </section>
  );
}

export function WorkEditor({ row }: { row: WorkRow | null }) {
  const router = useRouter();
  const toast = useToast();
  const [d, setD] = useState<Draft>(() => fromRow(row));
  const [saved, setSaved] = useState(() => JSON.stringify(fromRow(row)));
  const [status, setStatus] = useState<'draft' | 'published'>(row?.status ?? 'draft');
  const [slugTouched, setSlugTouched] = useState(Boolean(row));
  const [tagInput, setTagInput] = useState('');
  const [pending, start] = useTransition();
  const [uploading, setUploading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const galleryInput = useRef<HTMLInputElement>(null);
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((x) => ({ ...x, [k]: v }));
  const dirty = JSON.stringify(d) !== saved || (row?.status ?? 'draft') !== status;

  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (dirty) e.preventDefault();
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  function save(nextStatus: 'draft' | 'published') {
    start(async () => {
      const res = await saveCaseStudy({ ...d, id: row?.id, status: nextStatus });
      if (!res.ok) return toast('error', res.error);
      setStatus(nextStatus);
      setSaved(JSON.stringify(d));
      toast(
        'ok',
        nextStatus === 'published'
          ? row?.status === 'published'
            ? 'Case study updated'
            : 'Published — it’s live on /work'
          : 'Draft saved',
      );
      if (!row) router.replace(`/admin/work/${res.id}`);
      else router.refresh();
    });
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        save(status);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  async function addGallery(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    const urls: string[] = [];
    for (const f of Array.from(files).slice(0, 12 - d.gallery.length)) {
      const res = await uploadFile(f, 'work');
      if (res.ok) urls.push(res.url);
      else toast('error', res.error);
    }
    setUploading(false);
    set('gallery', [...d.gallery, ...urls]);
  }

  function addTag(raw: string) {
    const t = raw.trim().replace(/,$/, '');
    if (t && !d.techTags.includes(t)) set('techTags', [...d.techTags, t].slice(0, 16));
    setTagInput('');
  }

  const field = (
    key: keyof Draft,
    label: string,
    props: { placeholder?: string; rows?: number; hint?: string; max?: number } = {},
  ) => {
    const v = String(d[key] ?? '');
    return (
      <div>
        <Label htmlFor={key} hint={props.max ? `${v.length}/${props.max}` : props.hint}>
          {label}
        </Label>
        {props.rows ? (
          <Textarea
            id={key}
            rows={props.rows}
            maxLength={props.max}
            value={v}
            placeholder={props.placeholder}
            onChange={(e) => set(key, e.target.value as never)}
          />
        ) : (
          <Input
            id={key}
            maxLength={props.max}
            value={v}
            placeholder={props.placeholder}
            onChange={(e) => set(key, e.target.value as never)}
          />
        )}
      </div>
    );
  };

  return (
    <div className="space-y-5">
      <div className="sticky top-14 z-30 -mx-4 -mt-6 flex flex-wrap items-center gap-2 border-b border-white/[0.12] bg-[#03050A]/85 px-4 py-3 backdrop-blur-xl md:-mx-8 md:-mt-9 md:px-8 lg:top-0">
        <Link
          href="/admin/work"
          className="grid h-9 w-9 place-items-center rounded-lg text-white/50 hover:bg-white/[0.05] hover:text-white"
          aria-label="Back to case studies"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <span className="max-w-[40vw] truncate text-[14px] font-semibold text-white">
          {d.clientName || 'New case study'}
        </span>
        {status === 'published' ? (
          <Pill color="#7FE8C4">Live</Pill>
        ) : (
          <Pill color="#F0C88F">Draft</Pill>
        )}
        <span className="hidden text-[12px] text-white/35 sm:inline">
          {dirty ? 'Unsaved changes' : 'All changes saved'}
        </span>
        <div className="ml-auto flex flex-wrap gap-2">
          {row?.status === 'published' && (
            <ButtonLink href={`/work/${row.slug}`} external variant="ghost">
              <Eye className="h-4 w-4" /> View live
            </ButtonLink>
          )}
          {status === 'published' ? (
            <>
              <Button onClick={() => save('draft')} disabled={pending}>
                Unpublish
              </Button>
              <Button
                variant="primary"
                onClick={() => save('published')}
                disabled={pending || !dirty}
              >
                {pending && <Loader2 className="h-4 w-4 animate-spin" />} Update
              </Button>
            </>
          ) : (
            <>
              <Button onClick={() => save('draft')} disabled={pending}>
                {pending && <Loader2 className="h-4 w-4 animate-spin" />} Save draft
              </Button>
              <Button variant="primary" onClick={() => save('published')} disabled={pending}>
                Publish
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[180px_1fr]">
        <nav className="hidden lg:block" aria-label="Sections">
          <ul className="sticky top-24 space-y-1">
            {SECTIONS.map(([id, label]) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  className="block rounded-lg px-3 py-1.5 text-[13px] text-white/45 transition-colors hover:bg-white/[0.04] hover:text-white"
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="max-w-3xl space-y-4">
          <Section id="basics" title="Basics" hint="Who the client is and what we did for them.">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="clientName">Client name</Label>
                <Input
                  id="clientName"
                  value={d.clientName}
                  placeholder="Ayurveda Wellness Centre"
                  onChange={(e) => {
                    set('clientName', e.target.value);
                    if (!slugTouched) set('slug', slugify(e.target.value));
                  }}
                />
              </div>
              <div>
                <Label htmlFor="slug" hint="/work/…">
                  URL
                </Label>
                <Input
                  id="slug"
                  className="font-mono text-[13px]"
                  value={d.slug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    set('slug', slugify(e.target.value));
                  }}
                />
              </div>
              {field('industry', 'Industry', { placeholder: 'Wellness clinic', max: 120 })}
              {field('location', 'Location', {
                placeholder: 'Brickfields, Kuala Lumpur',
                max: 120,
              })}
              {field('timeline', 'Timeline', { placeholder: '3 weeks', max: 80 })}
            </div>
            <div>
              <Label>Solutions used</Label>
              <div className="flex flex-wrap gap-2">
                {SERVICES.map((s) => {
                  const on = d.services.includes(s.key);
                  return (
                    <button
                      key={s.key}
                      type="button"
                      aria-pressed={on}
                      onClick={() =>
                        set(
                          'services',
                          on ? d.services.filter((x) => x !== s.key) : [...d.services, s.key],
                        )
                      }
                      className="inline-flex h-9 items-center gap-2 rounded-full border px-3.5 text-[12.5px] transition-colors"
                      style={
                        on
                          ? {
                              borderColor: `${s.accent}88`,
                              background: `${s.accent}1F`,
                              color: '#fff',
                            }
                          : { borderColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }
                      }
                    >
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ background: s.accent, opacity: on ? 1 : 0.4 }}
                      />
                      {s.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </Section>

          <Section
            id="story"
            title="The story"
            hint="Plain language. Written for the next business owner who looks like this client."
          >
            {field('outcomeHeadline', 'Outcome headline', {
              placeholder: 'From a notebook to one screen the whole team runs on',
              max: 240,
            })}
            {field('summary', 'One-line summary', {
              rows: 2,
              placeholder: 'Shown on the Work page card.',
              max: 600,
            })}
            {field('problem', 'The problem', {
              rows: 4,
              placeholder: 'What was broken before we arrived?',
            })}
            {field('whatWasBuilt', 'What we built', {
              rows: 4,
              placeholder: 'The system, in their words — not ours.',
            })}
            {field('result', 'The result', {
              rows: 4,
              placeholder: 'What changed for them, with numbers if you have them.',
            })}
          </Section>

          <Section
            id="proof"
            title="Results & proof"
            hint="Numbers and a quote do more selling than any paragraph."
          >
            <div>
              <Label hint="up to 4">Key numbers</Label>
              <div className="space-y-2">
                {d.metrics.map((m, i) => (
                  <div key={i} className="grid grid-cols-[110px_1fr_auto] gap-2">
                    <Input
                      aria-label={`Number ${i + 1}`}
                      value={m.value}
                      placeholder="3×"
                      className="font-serif text-[18px] italic"
                      onChange={(e) =>
                        set(
                          'metrics',
                          d.metrics.map((x, j) => (j === i ? { ...x, value: e.target.value } : x)),
                        )
                      }
                    />
                    <Input
                      aria-label={`Label ${i + 1}`}
                      value={m.label}
                      placeholder="more enquiries in the first month"
                      onChange={(e) =>
                        set(
                          'metrics',
                          d.metrics.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)),
                        )
                      }
                    />
                    <button
                      type="button"
                      aria-label="Remove number"
                      onClick={() =>
                        set(
                          'metrics',
                          d.metrics.filter((_, j) => j !== i),
                        )
                      }
                      className="grid h-10 w-10 place-items-center rounded-xl text-white/35 hover:bg-white/[0.05] hover:text-white"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                {d.metrics.length < 4 && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => set('metrics', [...d.metrics, { value: '', label: '' }])}
                  >
                    <Plus className="h-3.5 w-3.5" /> Add number
                  </Button>
                )}
              </div>
            </div>
            {field('testimonialQuote', 'Client quote', {
              rows: 3,
              placeholder: 'In their own words.',
              max: 600,
            })}
            {field('testimonialAuthor', 'Quote by', {
              placeholder: 'Dr. Priya · Founder',
              max: 160,
            })}
            {field('liveUrl', 'Live site', { placeholder: 'https://', hint: 'optional' })}
            <div>
              <Label hint="Enter to add">Tech tags</Label>
              <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-white/[0.1] bg-white/[0.03] p-1.5 focus-within:border-[#5EE3DA]/50">
                {d.techTags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex h-7 items-center gap-1 rounded-lg bg-white/[0.07] pl-2.5 pr-1 font-mono text-[11.5px] text-white/80"
                  >
                    {t}
                    <button
                      type="button"
                      aria-label={`Remove ${t}`}
                      onClick={() =>
                        set(
                          'techTags',
                          d.techTags.filter((x) => x !== t),
                        )
                      }
                      className="grid h-5 w-5 place-items-center rounded text-white/40 hover:text-white"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                <input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ',') {
                      e.preventDefault();
                      addTag(tagInput);
                    } else if (e.key === 'Backspace' && !tagInput && d.techTags.length) {
                      set('techTags', d.techTags.slice(0, -1));
                    }
                  }}
                  onBlur={() => tagInput && addTag(tagInput)}
                  placeholder={d.techTags.length ? '' : 'Next.js, Supabase, WhatsApp API…'}
                  className="h-7 min-w-[140px] flex-1 bg-transparent px-1.5 text-[13px] text-white outline-none placeholder:text-white/25"
                />
              </div>
            </div>
          </Section>

          <Section
            id="media"
            title="Images"
            hint="The cover shows on the Work page. Gallery images appear at the end of the case study."
          >
            <div>
              <Label>Cover</Label>
              <ImageUpload
                value={d.coverImageUrl}
                onChange={(u) => set('coverImageUrl', u)}
                folder="work"
                aspect="aspect-[21/9] max-h-60"
              />
            </div>
            <div>
              <Label hint={`${d.gallery.length}/12`}>Gallery</Label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {d.gallery.map((src, i) => (
                  <div
                    key={src}
                    className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-white/10"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element -- uploaded image */}
                    <img src={src} alt="" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      aria-label="Remove image"
                      onClick={() =>
                        set(
                          'gallery',
                          d.gallery.filter((_, j) => j !== i),
                        )
                      }
                      className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-lg bg-black/70 text-white opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
                {d.gallery.length < 12 && (
                  <button
                    type="button"
                    onClick={() => galleryInput.current?.click()}
                    className={cn(
                      'flex aspect-[4/3] flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-white/15 text-[12px] text-white/45 hover:border-white/30 hover:text-white/70',
                    )}
                  >
                    {uploading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <ImagePlus className="h-4 w-4" />
                    )}
                    {uploading ? 'Uploading…' : 'Add images'}
                  </button>
                )}
              </div>
              <input
                ref={galleryInput}
                type="file"
                accept="image/*"
                multiple
                hidden
                onChange={(e) => addGallery(e.target.files)}
              />
            </div>
          </Section>

          <Section id="publish" title="Publishing">
            <Switch
              checked={d.featured}
              onChange={(v) => set('featured', v)}
              label="Feature this at the top of the Work page"
            />
            <div className="max-w-[200px]">
              <Label htmlFor="order" hint="lower = earlier">
                Display order
              </Label>
              <Input
                id="order"
                type="number"
                value={d.displayOrder}
                onChange={(e) => set('displayOrder', Number(e.target.value))}
              />
            </div>
            {row && (
              <div className="flex items-center justify-between rounded-xl border border-red-400/15 bg-red-400/[0.03] px-4 py-3">
                <span className="text-[12.5px] text-white/50">
                  Delete this case study permanently
                </span>
                {confirmDelete ? (
                  <span className="flex gap-2">
                    <Button size="sm" variant="ghost" onClick={() => setConfirmDelete(false)}>
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() =>
                        start(async () => {
                          const res = await deleteCaseStudy(row.id);
                          if (!res.ok) return toast('error', 'Couldn’t delete');
                          toast('ok', 'Case study deleted');
                          router.replace('/admin/work');
                        })
                      }
                    >
                      Delete for good
                    </Button>
                  </span>
                ) : (
                  <Button size="sm" variant="danger" onClick={() => setConfirmDelete(true)}>
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </Button>
                )}
              </div>
            )}
          </Section>
        </div>
      </div>
    </div>
  );
}
