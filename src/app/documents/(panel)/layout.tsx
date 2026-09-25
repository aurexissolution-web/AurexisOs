import type { ReactNode } from 'react';
import { getDocsUser } from '@/lib/documents/access';
import { PasswordGate } from '@/components/documents/PasswordGate';
import { docsSignIn } from '@/app/documents/access-actions';
import { DocumentsShell } from '@/components/documents/DocumentsShell';

export const dynamic = 'force-dynamic';

export default async function DocumentsPanelLayout({ children }: { children: ReactNode }) {
  const user = await getDocsUser();
  if (!user) return <PasswordGate action={docsSignIn} />;
  return <DocumentsShell user={{ name: user.name, email: user.email }}>{children}</DocumentsShell>;
}
