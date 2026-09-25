import type { ReactNode } from 'react';
import { getAccountsUser } from '@/lib/accounts/access';
import { PasswordGate } from '@/components/documents/PasswordGate';
import { AccountsShell } from '@/components/accounts/AccountsShell';
import { accountsSignIn } from '@/app/accounts/access-actions';

export const dynamic = 'force-dynamic';

export default async function AccountsPanelLayout({ children }: { children: ReactNode }) {
  const user = await getAccountsUser();
  if (!user) {
    return <PasswordGate action={accountsSignIn} label="Accounts" blurb="Sign in to track income, expenses and referrals." />;
  }
  return <AccountsShell user={{ name: user.name, email: user.email }}>{children}</AccountsShell>;
}
