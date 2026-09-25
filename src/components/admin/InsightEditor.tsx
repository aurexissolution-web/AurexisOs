'use client';

// src/components/admin/InsightEditor.tsx
// Markdown editor with a live preview that uses the exact same renderer as
// /insights/[slug]. Cmd+S saves, Cmd+B / Cmd+I format.
import { useEffect, useMemo, useRef, useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import {
  ArrowLeft,
  Bold,
  Code,
  Eye,
  Heading2,
  Heading3,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  Loader2,
  PenLine,
  Quote,
  Trash2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { InsightPost } from '@/types/insights';
import { insightsMarkdownComponents } from '@/components/sections/insights/InsightsPostBody';
import { deleteInsight, saveInsight } from '@/app/admin/actions';
import { Button, ButtonLink, Input, Label, Pill, Textarea, slugify, useToast } from './ui';
import { ImageUpload, uploadFile } from './ImageUpload';

type Draft = {
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  coverImageUrl: string | null;
  publishedAt: string;
};

// action: "line|prefix" or "wrap|before|after|placeholder"
const TOOLS = [
  { icon: Heading2, label: 'Heading', action: 'line|## ' },
  { icon: Heading3, label: 'Subheading', action: 'line|### ' },
  { icon: Bold, label: 'Bold (⌘B)', action: 'wrap|**' },
  { icon: Italic, label: 'Italic (⌘I)', action: 'wrap|*' },
  { icon: Link2, label: 'Link', action: 'wrap|[|](https://)|link text' },
  { icon: List, label: 'Bullet list', action: 'line|- ' },
  { icon: ListOrdered, label: 'Numbered list', action: 'line|1. ' },
  { icon: Quote, label: 'Quote', action: 'line|> ' },
  { icon: Code, label: 'Code', action: 'wrap|`' },
];

const toLocalInput = (iso: string) => {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

export function InsightEditor({ post }: { post: InsightPost | null }) {
  const router = useRouter();
  const toast = useToast();
  const initial: Draft = {
    title: post?.title ?? '',
    slug: post?.slug ?? '',
    excerpt: post?.excerpt ?? '',
    body: post?.body ?? '',
    coverImageUrl: post?.cover_image_url ?? null,
    publishedAt: toLocalInput(post?.published_at ?? new Date().toISOString()),
  };
  const [d, setD] = useState<Draft>(initial);
  const [saved, setSaved] = useState(JSON.stringify(initial));
  const [status, setStatus] = useState<'draft' | 'published'>(post?.status ?? 'draft');
  const [slugTouched, setSlugTouched] = useState(Boolean(post));
  const [pane, setPane] = useState<'write' | 'preview'>('write');
  const [pending, start] = useTransition();
  const [uploading, setUploading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const imgInput = useRef<HTMLInputElement>(null);

  const dirty = JSON.stringify(d) !== saved || (post?.status ?? 'draft') !== status;
  const words = useMemo(() => d.body.trim().split(/\s+/).filter(Boolean).length, [d.body]);

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((x) => ({ ...x, [k]: v }));

  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (dirty) e.preventDefault();
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  function save(nextStatus: 'draft' | 'published') {
    start(async () => {
      const res = await saveInsight({
        id: post?.id,
        slug: d.slug,
        title: d.title,
        excerpt: d.excerpt,
        body: d.body,
        coverImageUrl: d.coverImageUrl,
        status: nextStatus,
        publishedAt: new Date(`${d.publishedAt}T09:00:00`).toISOString(),
      });
      if (!res.ok) {
        toast('error', res.error);
        return;
      }
      setStatus(nextStatus);
      setSaved(JSON.stringify(d));
      toast(
        'ok',
        nextStatus === 'published'
          ? post?.status === 'published'
            ? 'Post updated'
            : 'Published — it’s live'
          : 'Draft saved',
      );
      if (!post) router.replace(`/admin/insights/${res.id}`);
      else router.refresh();
    });
  }

  // Keyboard: Cmd+S save (keeps current status).
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

  function wrap(before: string, after = before, placeholder = 'text') {
    const el = bodyRef.current;
    if (!el) return;
    const { selectionStart: a, selectionEnd: b, value } = el;
    const sel = value.slice(a, b) || placeholder;
    const next = value.slice(0, a) + before + sel + after + value.slice(b);
    set('body', next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(a + before.length, a + before.length + sel.length);
    });
  }

  function linePrefix(prefix: string) {
    const el = bodyRef.current;
    if (!el) return;
    const { selectionStart: a, selectionEnd: b, value } = el;
    const start = value.lastIndexOf('\n', a - 1) + 1;
    const block = value.slice(start, b);
    const out = block
      .split('\n')
      .map((l, i) => (prefix === '1. ' ? `${i + 1}. ${l}` : `${prefix}${l}`))
      .join('\n');
    set('body', value.slice(0, start) + out + value.slice(b));
    requestAnimationFrame(() => el.focus());
  }

  async function insertImage(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    const res = await uploadFile(file, 'insights');
    setUploading(false);
    if (!res.ok) return toast('error', res.error);
    wrap('\n![', `](${res.url})\n`, 'describe the image');
  }

  function runTool(action: string) {
    const [kind, x, y, z] = action.split('|');
    if (kind === 'line') linePrefix(x);
    else wrap(x, y || x, z || 'text');
  }

  const preview = (
    <div className="rounded-2xl border border-white/[0.14] bg-[#02040A] p-6 md:p-8">
      <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#5EE3DA]">
        {new Date(`${d.publishedAt}T09:00:00`).toLocaleDateString('en-MY', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })}
      </p>
      <h1 className="mt-3 font-serif text-[34px] italic leading-[1.15] text-white">
        {d.title || 'Your title'}
      </h1>
      {d.coverImageUrl && (
        // eslint-disable-next-line @next/next/no-img-element -- preview
        <img
          src={d.coverImageUrl}
          alt=""
          className="mt-6 aspect-[16/9] w-full rounded-2xl border border-white/10 object-cover"
        />
      )}
      <div className="mt-8 border-t border-white/[0.14] pt-8">
        {d.body.trim() ? (
          <ReactMarkdown components={insightsMarkdownComponents}>{d.body}</ReactMarkdown>
        ) : (
          <p className="text-[14px] text-white/30">
            Start writing and your post appears here, exactly as readers will see it.
          </p>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-5">
      {/* Top bar */}
      <div className="sticky top-14 z-30 -mx-4 -mt-6 flex flex-wrap items-center gap-2 border-b border-white/[0.12] bg-[#03050A]/85 px-4 py-3 backdrop-blur-xl md:-mx-8 md:-mt-9 md:px-8 lg:top-0">
        <Link
          href="/admin/insights"
          className="grid h-9 w-9 place-items-center rounded-lg text-white/50 hover:bg-white/[0.05] hover:text-white"
          aria-label="Back to posts"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        {status === 'published' ? (
          <Pill color="#7FE8C4">Published</Pill>
        ) : (
          <Pill color="#F0C88F">Draft</Pill>
        )}
        <span className="text-[12px] text-white/35">
          {dirty ? 'Unsaved changes' : 'All changes saved'}
        </span>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          {post?.status === 'published' && (
            <ButtonLink href={`/insights/${post.slug}`} external variant="ghost">
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

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="space-y-5">
          <input
            value={d.title}
            onChange={(e) => {
              set('title', e.target.value);
              if (!slugTouched) set('slug', slugify(e.target.value));
            }}
            placeholder="Post title"
            aria-label="Post title"
            className="w-full bg-transparent font-serif text-[34px] italic leading-tight text-white outline-none placeholder:text-white/20 md:text-[40px]"
          />

          <div className="grid gap-4 sm:grid-cols-[1fr_160px]">
            <div>
              <Label htmlFor="slug" hint="aurexissolution.com/insights/…">
                URL
              </Label>
              <Input
                id="slug"
                value={d.slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  set('slug', slugify(e.target.value));
                }}
                placeholder="your-post-url"
                className="font-mono text-[13px]"
              />
            </div>
            <div>
              <Label htmlFor="date">Publish date</Label>
              <Input
                id="date"
                type="date"
                value={d.publishedAt}
                onChange={(e) => set('publishedAt', e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="excerpt" hint={`${d.excerpt.length}/400`}>
              Excerpt
            </Label>
            <Textarea
              id="excerpt"
              rows={2}
              maxLength={400}
              value={d.excerpt}
              onChange={(e) => set('excerpt', e.target.value)}
              placeholder="One or two sentences shown on the Insights page and in Google results."
            />
          </div>

          <div>
            <Label>Cover image</Label>
            <ImageUpload
              value={d.coverImageUrl}
              onChange={(u) => set('coverImageUrl', u)}
              folder="insights"
            />
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <Label>Body</Label>
              <div className="flex rounded-lg border border-white/[0.14] p-0.5 xl:hidden">
                {(['write', 'preview'] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPane(p)}
                    className={cn(
                      'flex h-7 items-center gap-1.5 rounded-md px-2.5 text-[12px] capitalize',
                      pane === p ? 'bg-white/[0.08] text-white' : 'text-white/45',
                    )}
                  >
                    {p === 'write' ? (
                      <PenLine className="h-3.5 w-3.5" />
                    ) : (
                      <Eye className="h-3.5 w-3.5" />
                    )}
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <div className={cn(pane === 'preview' && 'hidden xl:block')}>
              <div className="overflow-hidden rounded-xl border border-white/[0.1] bg-white/[0.02] focus-within:border-[#5EE3DA]/50">
                <div className="flex flex-wrap items-center gap-0.5 border-b border-white/[0.12] px-1.5 py-1.5">
                  {TOOLS.map((t) => (
                    <button
                      key={t.label}
                      type="button"
                      title={t.label}
                      aria-label={t.label}
                      onClick={() => runTool(t.action)}
                      className="grid h-8 w-8 place-items-center rounded-lg text-white/50 hover:bg-white/[0.06] hover:text-white"
                    >
                      <t.icon className="h-4 w-4" />
                    </button>
                  ))}
                  <span className="mx-1 h-5 w-px bg-white/10" />
                  <button
                    type="button"
                    title="Insert image"
                    onClick={() => imgInput.current?.click()}
                    className="flex h-8 items-center gap-1.5 rounded-lg px-2 text-[12px] text-white/50 hover:bg-white/[0.06] hover:text-white"
                  >
                    {uploading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <ImagePlus className="h-4 w-4" />
                    )}{' '}
                    Image
                  </button>
                  <input
                    ref={imgInput}
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e) => insertImage(e.target.files?.[0])}
                  />
                  <span className="ml-auto pr-2 font-mono text-[10.5px] text-white/30">
                    {words} words · {Math.max(1, Math.round(words / 220))} min read
                  </span>
                </div>
                <textarea
                  ref={bodyRef}
                  value={d.body}
                  onChange={(e) => set('body', e.target.value)}
                  onKeyDown={(e) => {
                    if (!(e.metaKey || e.ctrlKey)) return;
                    if (e.key === 'b') {
                      e.preventDefault();
                      wrap('**');
                    } else if (e.key === 'i') {
                      e.preventDefault();
                      wrap('*');
                    }
                  }}
                  placeholder={
                    'Write in Markdown.\n\n## A heading\nA paragraph with **bold** and *emphasis*.\n\n- A list item'
                  }
                  className="block min-h-[460px] w-full resize-y bg-transparent px-4 py-3.5 font-mono text-[13.5px] leading-[1.75] text-white/90 outline-none placeholder:text-white/20"
                />
              </div>
            </div>
            <div className={cn('xl:hidden', pane === 'write' && 'hidden')}>{preview}</div>
          </div>

          {post && (
            <div className="flex items-center justify-between rounded-2xl border border-red-400/15 bg-red-400/[0.03] px-4 py-3">
              <span className="text-[12.5px] text-white/50">Delete this post permanently</span>
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
                        const res = await deleteInsight(post.id);
                        if (!res.ok) return toast('error', 'Couldn’t delete');
                        toast('ok', 'Post deleted');
                        router.replace('/admin/insights');
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
        </div>

        <div className="hidden xl:block">
          <div className="sticky top-20">
            <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">
              Live preview
            </p>
            <div className="max-h-[calc(100vh-120px)] overflow-y-auto rounded-2xl">{preview}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
