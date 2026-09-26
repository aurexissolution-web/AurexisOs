'use client';

// src/components/admin/SubscribersBoard.tsx
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Send, Trash2 } from 'lucide-react';
import { removeSubscriber, sendBroadcast, sendTestBroadcast } from '@/app/admin/(panel)/subscribers/actions';
import { DRIP_STEPS } from '@/lib/subscribers/drip';
import { Button, Card, CardHeader, EmptyState, Input, Label, PageHeader, Pill, Textarea, useToast } from './ui';
import { RelativeTime } from './RelativeTime';

export type SubscriberItem = { id: string; email: string; name: string; business: string; source: string; status: 'active' | 'unsubscribed'; drip_step: number; created_at: string };
export type BroadcastItem = { id: string; subject: string; recipients: number; created_at: string };

export function SubscribersBoard({ subscribers, broadcasts, thisWeek, missingTable }: { subscribers: SubscriberItem[]; broadcasts: BroadcastItem[]; thisWeek: number; missingTable: boolean }) {
  const router = useRouter();
  const toast = useToast();
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [busy, start] = useTransition();
  const active = subscribers.filter((s) => s.status === 'active').length;

  const send = (kind: 'test' | 'all') => {
    if (kind === 'all' && !window.confirm(`Send this to ${active} active subscriber${active === 1 ? '' : 's'}? This cannot be undone.`)) return;
    start(async () => {
      const res = await (kind === 'test' ? sendTestBroadcast(subject, body) : sendBroadcast(subject, body));
      if (!res.ok) return toast('error', res.error);
      toast('ok', kind === 'test' ? 'Test sent to your inbox' : `Sent to ${res.sent} subscriber${res.sent === 1 ? '' : 's'}`);
      if (kind === 'all') {
        setSubject('');
        setBody('');
        router.refresh();
      }
    });
  };

  if (missingTable) {
    return (
      <div className="space-y-6">
        <PageHeader eyebrow="Publish" title="Subscribers" accent="and newsletters." />
        <EmptyState icon={<Mail className="h-5 w-5" />} title="The subscribers table is not set up yet" body="Run supabase/migrations/039_subscribers.sql in the Supabase SQL editor, then reload this page." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Publish"
        title="Subscribers"
        accent="and newsletters."
        description={`People who signed up on the website get a ${DRIP_STEPS.length}-email series automatically (day ${DRIP_STEPS.map((s) => s.day).join(', ')}). Write a newsletter below to email everyone who is still subscribed.`}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        {[['Active subscribers', active], ['New this week', thisWeek], ['Unsubscribed', subscribers.length - active]].map(([l, v]) => (
          <Card key={l as string} className="p-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/45">{l}</p>
            <p className="mt-2 text-[28px] font-extrabold tracking-[-0.03em] tabular-nums">{v}</p>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader title="Write a newsletter" />
        <div className="space-y-4 p-5">
          <div><Label>Subject</Label><Input value={subject} maxLength={200} onChange={(e) => setSubject(e.target.value)} placeholder="What is this email about?" /></div>
          <div>
            <Label hint="a blank line starts a new paragraph">Message</Label>
            <Textarea rows={9} value={body} maxLength={10000} onChange={(e) => setBody(e.target.value)} placeholder="Write it like you would to one person." />
          </div>
          <p className="text-[12px] text-white/40">Every email gets the Aurexis look and an unsubscribe link automatically. Send a test to yourself first.</p>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => send('test')} disabled={busy || !subject.trim() || !body.trim()}>Send test to me</Button>
            <Button variant="primary" onClick={() => send('all')} disabled={busy || !active || !subject.trim() || !body.trim()}>
              <Send className="h-4 w-4" /> Send to {active} subscriber{active === 1 ? '' : 's'}
            </Button>
          </div>
        </div>
      </Card>

      {broadcasts.length > 0 && (
        <Card>
          <CardHeader title="Sent newsletters" />
          <ul>
            {broadcasts.map((b) => (
              <li key={b.id} className="flex items-center justify-between gap-3 border-b border-white/[0.06] px-5 py-3 last:border-0">
                <span className="truncate text-[13.5px] text-white">{b.subject}</span>
                <span className="shrink-0 text-[12px] text-white/45">{b.recipients} sent · <RelativeTime iso={b.created_at} /></span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Card>
        <CardHeader title={`All subscribers (${subscribers.length})`} />
        {subscribers.length === 0 ? (
          <p className="px-5 py-10 text-center text-[13px] text-white/45">No sign-ups yet. They appear here as soon as someone uses the website pop-up.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-[13px]">
              <thead>
                <tr className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/40">
                  <th className="px-5 py-3 font-normal">Person</th>
                  <th className="px-3 py-3 font-normal">From</th>
                  <th className="px-3 py-3 font-normal">Emails sent</th>
                  <th className="px-3 py-3 font-normal">Joined</th>
                  <th className="px-3 py-3 font-normal">Status</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {subscribers.map((s) => (
                  <tr key={s.id}>
                    <td className="px-5 py-3">
                      <p className="font-medium text-white">{s.name || s.email}</p>
                      <p className="text-[12px] text-white/45">{[s.name && s.email, s.business].filter(Boolean).join(' · ')}</p>
                    </td>
                    <td className="px-3 py-3 text-white/55">{s.source === 'footer' ? 'Footer box' : 'Pop-up'}</td>
                    <td className="px-3 py-3 tabular-nums text-white/55">{Math.min(s.drip_step, DRIP_STEPS.length)} of {DRIP_STEPS.length}</td>
                    <td className="px-3 py-3 text-white/55"><RelativeTime iso={s.created_at} /></td>
                    <td className="px-3 py-3"><Pill color={s.status === 'active' ? '#7FE8C4' : '#9CA3AF'}>{s.status === 'active' ? 'Subscribed' : 'Unsubscribed'}</Pill></td>
                    <td className="px-5 py-3 text-right">
                      <Button size="sm" variant="ghost" aria-label="Delete subscriber" disabled={busy} onClick={() => window.confirm(`Delete ${s.email}?`) && start(async () => { const r = await removeSubscriber(s.id); toast(r.ok ? 'ok' : 'error', r.ok ? 'Deleted' : 'Could not delete'); router.refresh(); })}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
