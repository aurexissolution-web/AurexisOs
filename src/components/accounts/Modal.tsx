'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';

export function Modal({ open, title, description, onClose, children, footer }: {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
  footer: ReactNode;
}) {
  const panel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panel.current?.querySelector<HTMLElement>('input, select, textarea')?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center p-0 sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-label={title}>
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div ref={panel} className="relative flex max-h-[92vh] w-full max-w-xl flex-col overflow-hidden rounded-t-2xl border border-white/[0.14] bg-[#070a10] shadow-[0_40px_120px_-30px_rgba(0,0,0,0.95)] sm:rounded-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-white/[0.1] px-6 py-5">
          <div>
            <h2 className="text-[18px] font-semibold tracking-[-0.01em] text-white">{title}</h2>
            {description && <p className="mt-1 text-[13px] text-white/50">{description}</p>}
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="grid h-8 w-8 place-items-center rounded-lg text-white/50 hover:bg-white/[0.06] hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="overflow-y-auto px-6 py-6">{children}</div>
        <div className="flex justify-end gap-2 border-t border-white/[0.1] bg-white/[0.02] px-6 py-4">{footer}</div>
      </div>
    </div>
  );
}

export const selectCls = 'h-10 w-full rounded-xl border border-white/[0.1] bg-[#0b0d14] px-3 text-[14px] text-white outline-none focus:border-[#5EE3DA]/50';
