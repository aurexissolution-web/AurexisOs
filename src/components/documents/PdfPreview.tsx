'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Card } from '@/components/admin/ui';

/** Renders the real PDF for the form as it stands (debounced), in a frame. */
export function PdfPreview({ payload, onError }: { payload: string; onError?: (e: string | null) => void }) {
  const [state, setState] = useState<{ url: string | null; error: string | null; busy: boolean }>({ url: null, error: null, busy: true });
  const urlRef = useRef<string | null>(null);
  const report = useRef(onError);
  useEffect(() => {
    report.current = onError;
  });

  useEffect(() => {
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      try {
        setState((p) => ({ ...p, busy: true }));
        const res = await fetch('/api/documents/pdf', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: payload, signal: ctrl.signal,
        });
        if (!res.ok) {
          const j = (await res.json().catch(() => ({}))) as { error?: string };
          const error = j.error ?? 'Preview failed.';
          setState((p) => ({ ...p, error, busy: false }));
          report.current?.(error);
          return;
        }
        const url = URL.createObjectURL(await res.blob());
        if (urlRef.current) URL.revokeObjectURL(urlRef.current);
        urlRef.current = url;
        setState({ url, error: null, busy: false });
        report.current?.(null);
      } catch (e) {
        if ((e as Error).name !== 'AbortError') {
          setState((p) => ({ ...p, error: 'Preview failed.', busy: false }));
          report.current?.('Preview failed.');
        }
      }
    }, 700);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [payload]);

  useEffect(
    () => () => {
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    },
    [],
  );

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-white/[0.12] px-4 py-2.5 text-[11px] uppercase tracking-[0.16em] text-white/40">
        <span>Live preview</span>
        {state.busy && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
      </div>
      {state.error ? (
        <p className="p-6 text-[13px] text-amber-300/90">{state.error}</p>
      ) : state.url ? (
        <iframe title="PDF preview" src={`${state.url}#toolbar=0&navpanes=0&view=FitH`} className="h-[80vh] w-full bg-white" />
      ) : (
        <div className="h-[80vh]" />
      )}
    </Card>
  );
}
