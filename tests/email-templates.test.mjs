import assert from 'node:assert/strict';
import test from 'node:test';
import {
  quoteConfirmation,
  contactConfirmation,
  calculatorReport,
  reviewThanks,
  teamLeadAlert,
} from '../src/lib/email/templates.ts';

const hasTag = (s) => /<\/?[a-z][^>]*>/i.test(s);

test('quote confirmation names the service, choice and WhatsApp number', () => {
  const e = quoteConfirmation({
    service: 'flow',
    name: 'Aisyah',
    choice: 'Flow Starter',
    whatsapp: '+60 12-345 6789',
    rows: [{ label: 'Timeline', value: 'Within a month' }],
  });
  assert.match(e.subject, /Flow/);
  assert.match(e.html, /Flow Starter/);
  assert.match(e.html, /\+60 12-345 6789/);
  assert.match(e.html, /Within a month/);
  assert.match(e.html, /#7FE8C4/i, 'uses the Flow accent');
  assert.match(e.text, /Aisyah/);
  assert.ok(!hasTag(e.text), 'plain-text part has no HTML');
});

test('every service gets its own accent', () => {
  const accents = {
    presence: /#5EE3DA/i,
    core: /#8FA8F0/i,
    connect: /#B08FF0/i,
    audit: /#F0C88F/i,
  };
  for (const [service, re] of Object.entries(accents)) {
    const e = quoteConfirmation({ service, name: 'A', choice: 'X', whatsapp: '1', rows: [] });
    assert.match(e.html, re, service);
  }
});

test('user input is HTML-escaped everywhere', () => {
  const evil = '<script>alert(1)</script>';
  const emails = [
    quoteConfirmation({
      service: 'presence',
      name: evil,
      choice: evil,
      whatsapp: evil,
      rows: [{ label: 'Notes', value: evil }],
    }),
    contactConfirmation({ name: evil, intent: 'new-project', message: evil }),
    reviewThanks({ name: evil }),
    teamLeadAlert({
      source: 'Contact',
      name: evil,
      email: 'a@b.co',
      rows: [{ label: 'Message', value: evil }],
      adminUrl: 'https://x.test/admin/command',
    }),
  ];
  for (const e of emails) {
    assert.ok(!e.html.includes('<script>'), e.subject);
    assert.match(e.html, /&lt;script&gt;/);
  }
});

test('newlines in long answers survive as line breaks', () => {
  const e = contactConfirmation({ name: 'A', intent: 'ai-agent', message: 'line one\nline two' });
  assert.match(e.html, /line one<br>line two/);
  assert.match(e.text, /line one\nline two/);
});

test('contact confirmation reads the intent in plain words', () => {
  const e = contactConfirmation({ name: 'Jason', intent: 'press-partnerships', message: 'Hi' });
  assert.match(e.html, /press or partnership/i);
  assert.doesNotMatch(e.html, /press-partnerships/);
});

test('calculator report shows the figures in ringgit', () => {
  const e = calculatorReport({ annualWaste: 48000, staff: 3, wage: 3000, hours: 10 });
  assert.match(e.subject, /RM\s?48,000/);
  assert.match(e.html, /RM\s?4,000/, 'monthly figure');
  assert.match(e.html, /3 people/);
});

test('team alert links to the Command Center and sets the lead as reply-to', () => {
  const e = teamLeadAlert({
    source: 'Presence',
    name: 'Farah',
    email: 'farah@clinic.my',
    phone: '+60 12 222 3333',
    rows: [{ label: 'Budget', value: 'RM3k-8k' }],
    adminUrl: 'https://aurexissolution.com/admin/command',
  });
  assert.match(e.subject, /Presence/);
  assert.match(e.subject, /Farah/);
  assert.match(e.html, /href="https:\/\/aurexissolution\.com\/admin\/command"/);
  assert.match(e.html, /wa\.me\/60122223333/);
  assert.match(e.html, /RM3k-8k/);
});

test('rows with empty values are left out', () => {
  const e = quoteConfirmation({
    service: 'core',
    name: 'A',
    choice: 'X',
    whatsapp: '1',
    rows: [
      { label: 'Kept', value: 'yes' },
      { label: 'Dropped', value: '' },
    ],
  });
  assert.match(e.html, /Kept/);
  assert.doesNotMatch(e.html, /Dropped/);
});

test('plain-text part shows names as typed, not HTML-escaped', () => {
  const e = teamLeadAlert({
    source: 'Contact',
    name: "O'Brien & Co",
    email: 'a@b.co',
    phone: '0123456789',
    rows: [],
    adminUrl: 'https://x.test',
  });
  assert.match(e.text, /Reply to this email to answer O'Brien & Co directly/);
  assert.match(e.html, /wa\.me\/60123456789/, 'local 0-prefixed number gets the 60 country code');
});
