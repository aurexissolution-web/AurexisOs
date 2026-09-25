'use client';

// src/components/admin/ImageUpload.tsx
// Drag-and-drop (or click) image upload into the site-media bucket.
import { useRef, useState } from 'react';
import { ImagePlus, Loader2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { uploadImage } from '@/app/admin/actions';
import { useToast } from './ui';

export async function uploadFile(file: File, folder: 'insights' | 'work') {
  const fd = new FormData();
  fd.append('file', file);
  fd.append('folder', folder);
  return uploadImage(fd);
}

export function ImageUpload({
  value,
  onChange,
  folder,
  aspect = 'aspect-[21/9] max-h-60',
  label = 'Drop an image or click to upload',
}: {
  value: string | null;
  onChange: (url: string | null) => void;
  folder: 'insights' | 'work';
  aspect?: string;
  label?: string;
}) {
  const toast = useToast();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [drag, setDrag] = useState(false);

  async function handle(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    const res = await uploadFile(file, folder);
    setBusy(false);
    if (res.ok) onChange(res.url);
    else toast('error', res.error);
  }

  if (value) {
    return (
      <div
        className={cn('group relative overflow-hidden rounded-xl border border-white/10', aspect)}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- uploaded image of unknown size */}
        <img src={value} alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 flex items-end justify-end gap-2 bg-gradient-to-t from-black/60 to-transparent p-3 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            type="button"
            onClick={() => input.current?.click()}
            className="h-8 rounded-lg bg-white/90 px-3 text-[12px] font-semibold text-black"
          >
            Replace
          </button>
          <button
            type="button"
            onClick={() => onChange(null)}
            aria-label="Remove image"
            className="grid h-8 w-8 place-items-center rounded-lg bg-black/70 text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <input
          ref={input}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => handle(e.target.files?.[0])}
        />
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => input.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          handle(e.dataTransfer.files?.[0]);
        }}
        className={cn(
          'flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed text-[12.5px] transition-colors',
          aspect,
          drag
            ? 'border-[#5EE3DA]/70 bg-[#5EE3DA]/[0.06] text-[#5EE3DA]'
            : 'border-white/15 bg-white/[0.02] text-white/45 hover:border-white/30 hover:text-white/70',
        )}
      >
        {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImagePlus className="h-5 w-5" />}
        {busy ? 'Uploading…' : label}
        <span className="text-[11px] text-white/30">JPG, PNG, WebP · up to 5 MB</span>
      </button>
      <input
        ref={input}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => handle(e.target.files?.[0])}
      />
    </>
  );
}
