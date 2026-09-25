'use client';

// src/components/admin/RelativeTime.tsx
// "5m ago" computed in the browser, so server/client clocks can't disagree.
import { useEffect, useState } from 'react';
import { timeAgo } from './ui';

export function RelativeTime({ iso, className }: { iso: string; className?: string }) {
  const [label, setLabel] = useState('');
  useEffect(() => {
    const tick = () => setLabel(timeAgo(iso));
    tick();
    const t = setInterval(tick, 60_000);
    return () => clearInterval(t);
  }, [iso]);
  return (
    <time dateTime={iso} className={className} suppressHydrationWarning>
      {label}
    </time>
  );
}
