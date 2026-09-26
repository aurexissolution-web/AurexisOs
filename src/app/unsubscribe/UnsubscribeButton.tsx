'use client';

import { useState } from 'react';

export function UnsubscribeButton({ token }: { token: string }) {
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');

  if (state === 'done') {
    return <p className="mt-8 text-[16px] text-[#00F0FF]">You are unsubscribed. We will not email you again.</p>;
  }
  return (
    <div className="mt-8">
      <button
        type="button"
        disabled={state === 'sending'}
        onClick={async () => {
          setState('sending');
          try {
            const res = await fetch(`/api/unsubscribe?t=${encodeURIComponent(token)}`, { method: 'POST' });
            setState(res.ok ? 'done' : 'error');
          } catch {
            setState('error');
          }
        }}
        className="rounded-full bg-[#00F0FF] px-6 py-3 text-[14px] font-semibold text-[#02040A] transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white disabled:opacity-60"
      >
        {state === 'sending' ? 'Unsubscribing...' : 'Yes, unsubscribe me'}
      </button>
      {state === 'error' && (
        <p role="alert" className="mt-3 text-[13px] text-red-300">
          Something went wrong. Please try again, or reply to any of our emails and we will remove you.
        </p>
      )}
    </div>
  );
}
