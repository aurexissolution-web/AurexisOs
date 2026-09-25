// src/app/admin/(panel)/layout.tsx
// Every page inside the panel is gated here; actions re-check on their own.
import type { ReactNode } from 'react';
import { requireAdmin } from '@/lib/auth/admin';
import { getNavCounts } from '@/lib/admin/stats';
import { AdminShell } from '@/components/admin/AdminShell';

export const dynamic = 'force-dynamic';

export default async function PanelLayout({ children }: { children: ReactNode }) {
  const user = await requireAdmin();
  const counts = await getNavCounts();
  return (
    <AdminShell user={{ name: user.name, email: user.email }} counts={counts}>
      {children}
    </AdminShell>
  );
}
