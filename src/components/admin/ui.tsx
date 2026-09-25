'use client';

// src/components/admin/ui.tsx
// Design primitives for /admin. Same language as the public site: near-black,
// glass surfaces, cyan accent, serif-italic accent words, mono eyebrows.
import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useState,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type TextareaHTMLAttributes,
} from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, TriangleAlert } from 'lucide-react';
import { cn } from '@/lib/utils';

export const ACCENT = '#5EE3DA';
export const ACCENT_RGB = '94,227,218';

// ── Layout ───────────────────────────────────────────────────────────────────

export function PageHeader({
  eyebrow,
  title,
  accent,
  description,
  actions,
}: {
  eyebrow: string;
  title: string;
  accent?: string;
  description?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <header className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.28em] text-[#5EE3DA]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#5EE3DA] shadow-[0_0_8px_rgba(94,227,218,0.8)]" />
          {eyebrow}
        </p>
        <h1 className="mt-3 text-[30px] font-extrabold leading-[1.05] tracking-[-0.03em] text-white md:text-[40px]">
          {title}
          {accent && (
            <>
              {' '}
              <span className="font-serif font-normal italic text-[#5EE3DA]">{accent}</span>
            </>
          )}
        </h1>
        {description && (
          <p className="mt-2 max-w-xl text-[14px] leading-[1.6] text-white/50">{description}</p>
        )}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-white/[0.14] bg-white/[0.025] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  meta,
  action,
}: {
  title: string;
  meta?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-white/[0.12] px-5 py-3.5">
      <div className="flex items-baseline gap-2.5">
        <h2 className="text-[13.5px] font-semibold text-white">{title}</h2>
        {meta && (
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/35">
            {meta}
          </span>
        )}
      </div>
      {action}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  body,
  action,
}: {
  icon: ReactNode;
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <span className="grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-white/[0.03] text-white/40">
        {icon}
      </span>
      <p className="mt-4 text-[15px] font-semibold text-white">{title}</p>
      <p className="mt-1 max-w-sm text-[13px] leading-[1.6] text-white/45">{body}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

// ── Controls ─────────────────────────────────────────────────────────────────

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

export const Button = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant; size?: 'sm' | 'md' }
>(function Button({ variant = 'secondary', size = 'md', className, ...props }, ref) {
  return (
    <button
      ref={ref}
      {...props}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl font-semibold outline-none transition-all duration-200 focus-visible:ring-2 focus-visible:ring-[#5EE3DA]/60 disabled:pointer-events-none disabled:opacity-50',
        size === 'sm' ? 'h-8 px-3 text-[12px]' : 'h-10 px-4 text-[13px]',
        variant === 'primary' &&
          'bg-[#5EE3DA] text-[#02040A] shadow-[0_0_24px_-6px_rgba(94,227,218,0.7)] hover:brightness-110',
        variant === 'secondary' &&
          'border border-white/[0.12] bg-white/[0.04] text-white/85 hover:border-white/25 hover:bg-white/[0.07]',
        variant === 'ghost' && 'text-white/60 hover:bg-white/[0.05] hover:text-white',
        variant === 'danger' &&
          'border border-red-400/25 bg-red-400/[0.06] text-red-300 hover:bg-red-400/[0.12]',
        className,
      )}
    />
  );
});

export function ButtonLink({
  href,
  children,
  variant = 'secondary',
  external,
  className,
}: {
  href: string;
  children: ReactNode;
  variant?: ButtonVariant;
  external?: boolean;
  className?: string;
}) {
  return (
    <a
      href={href}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      className={cn(
        'inline-flex h-10 items-center justify-center gap-2 rounded-xl px-4 text-[13px] font-semibold outline-none transition-all duration-200 focus-visible:ring-2 focus-visible:ring-[#5EE3DA]/60',
        variant === 'primary' &&
          'bg-[#5EE3DA] text-[#02040A] shadow-[0_0_24px_-6px_rgba(94,227,218,0.7)] hover:brightness-110',
        variant === 'secondary' &&
          'border border-white/[0.12] bg-white/[0.04] text-white/85 hover:border-white/25 hover:bg-white/[0.07]',
        variant === 'ghost' && 'text-white/60 hover:bg-white/[0.05] hover:text-white',
        className,
      )}
    >
      {children}
    </a>
  );
}

export function Label({
  children,
  hint,
  htmlFor,
}: {
  children: ReactNode;
  hint?: ReactNode;
  htmlFor?: string;
}) {
  return (
    <div className="mb-1.5 flex items-baseline justify-between gap-3">
      <label
        htmlFor={htmlFor}
        className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/45"
      >
        {children}
      </label>
      {hint && <span className="text-[11px] text-white/30">{hint}</span>}
    </div>
  );
}

const fieldBase =
  'w-full rounded-xl border border-white/[0.1] bg-white/[0.03] px-3.5 text-[14px] text-white placeholder:text-white/25 outline-none transition-colors focus:border-[#5EE3DA]/50 focus:bg-white/[0.045] focus:ring-2 focus:ring-[#5EE3DA]/15';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    return <input ref={ref} {...props} className={cn(fieldBase, 'h-10', className)} />;
  },
);

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className, ...props }, ref) {
  return (
    <textarea ref={ref} {...props} className={cn(fieldBase, 'py-2.5 leading-[1.6]', className)} />
  );
});

export function Segmented<T extends string>({
  value,
  options,
  onChange,
  size = 'md',
}: {
  value: T;
  options: { value: T; label: ReactNode; color?: string }[];
  onChange: (v: T) => void;
  size?: 'sm' | 'md';
}) {
  return (
    <div className="inline-flex flex-wrap gap-1 rounded-xl border border-white/[0.14] bg-white/[0.02] p-1">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            aria-pressed={active}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-lg font-medium outline-none transition-all focus-visible:ring-2 focus-visible:ring-[#5EE3DA]/50',
              size === 'sm' ? 'h-7 px-2.5 text-[11.5px]' : 'h-8 px-3 text-[12.5px]',
              active
                ? 'bg-white/[0.09] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]'
                : 'text-white/50 hover:text-white/80',
            )}
          >
            {o.color && (
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: o.color, opacity: active ? 1 : 0.6 }}
              />
            )}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

export function Pill({
  color,
  children,
  solid,
}: {
  color: string;
  children: ReactNode;
  solid?: boolean;
}) {
  return (
    <span
      className="inline-flex h-6 items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 text-[11px] font-medium"
      style={{
        color: solid ? '#02040A' : color,
        background: solid ? color : `${color}1A`,
        boxShadow: solid ? undefined : `inset 0 0 0 1px ${color}33`,
      }}
    >
      {!solid && <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />}
      {children}
    </span>
  );
}

export function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="inline-flex items-center gap-2.5 text-[13px] text-white/75 outline-none"
    >
      <span
        className={cn(
          'relative h-5 w-9 rounded-full border transition-colors',
          checked ? 'border-[#5EE3DA]/60 bg-[#5EE3DA]/25' : 'border-white/15 bg-white/[0.06]',
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 h-3.5 w-3.5 rounded-full transition-all',
            checked
              ? 'left-[18px] bg-[#5EE3DA] shadow-[0_0_10px_rgba(94,227,218,0.8)]'
              : 'left-0.5 bg-white/50',
          )}
        />
      </span>
      {label}
    </button>
  );
}

// ── Toasts ───────────────────────────────────────────────────────────────────

type Toast = { id: number; kind: 'ok' | 'error'; text: string };
const ToastCtx = createContext<(kind: Toast['kind'], text: string) => void>(() => {});

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const push = useCallback((kind: Toast['kind'], text: string) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, kind, text }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  }, []);
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed bottom-20 right-4 z-[80] flex flex-col items-end gap-2 md:bottom-6 md:right-6">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 12, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6 }}
              role="status"
              className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-[#0B0F17]/95 px-4 py-2.5 text-[13px] text-white shadow-2xl backdrop-blur"
            >
              {t.kind === 'ok' ? (
                <Check className="h-4 w-4 text-[#5EE3DA]" />
              ) : (
                <TriangleAlert className="h-4 w-4 text-red-300" />
              )}
              {t.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastCtx.Provider>
  );
}

export const useToast = () => useContext(ToastCtx);

// ── Formatting ───────────────────────────────────────────────────────────────

export function timeAgo(iso: string | null | undefined): string {
  if (!iso) return '';
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 86400 * 7) return `${Math.floor(s / 86400)}d ago`;
  return new Date(iso).toLocaleDateString('en-MY', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}
