import assert from 'node:assert/strict';
import test from 'node:test';
import {
  normalizeEmail,
  normalizePhone,
  letterOf,
  groupByLetter,
  matchClient,
  sortClients,
  followUpState,
} from '../src/lib/admin/clients.ts';

test('phones from every common Malaysian format normalise to the same key', () => {
  for (const p of ['012-345 6789', '+60 12 345 6789', '60123456789', '0123456789', '(012) 345-6789', '0060123456789']) {
    assert.equal(normalizePhone(p), '60123456789', p);
  }
  assert.equal(normalizePhone(''), null);
  assert.equal(normalizePhone(null), null);
  assert.equal(normalizePhone('abc'), null);
});

test('emails normalise to lowercase and reject junk', () => {
  assert.equal(normalizeEmail('  Aisyah@Clinic.MY '), 'aisyah@clinic.my');
  assert.equal(normalizeEmail('not-an-email'), null);
  assert.equal(normalizeEmail(''), null);
  assert.equal(normalizeEmail(undefined), null);
});

test('letters: first letter, accents folded, non-letters go under #', () => {
  assert.equal(letterOf('aisyah'), 'A');
  assert.equal(letterOf('  Éclair Bakery'), 'E');
  assert.equal(letterOf('7-Eleven Franchise'), '#');
  assert.equal(letterOf('(Kedai) Aman'), 'K');
  assert.equal(letterOf(''), '#');
});

test('grouping is alphabetical with # last and names sorted case-insensitively inside', () => {
  const list = [{ name: 'zainal' }, { name: 'Aman' }, { name: 'aisyah' }, { name: '7-Eleven' }, { name: 'Zara' }];
  const g = groupByLetter(list);
  assert.deepEqual(g.map((x) => x.letter), ['A', 'Z', '#']);
  assert.deepEqual(g[0].items.map((c) => c.name), ['aisyah', 'Aman']);
  assert.deepEqual(g[1].items.map((c) => c.name), ['Zara', 'zainal'].sort((a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' })));
});

const contacts = [
  { client_id: 'c1', email_key: 'aisyah@clinic.my', phone_key: '60123456789' },
  { client_id: 'c2', email_key: 'farah@bakery.my', phone_key: '60198887777' },
  { client_id: 'c3', email_key: null, phone_key: '60111222333' },
];

test('an enquiry matches an existing client by email first, then by phone', () => {
  assert.deepEqual(matchClient(contacts, { email: 'AISYAH@clinic.my', phone: '0199999999' }), { clientId: 'c1', by: 'email', ambiguous: false });
  assert.deepEqual(matchClient(contacts, { email: 'new@x.my', phone: '011-1222 333' }), { clientId: 'c3', by: 'phone', ambiguous: false });
  assert.equal(matchClient(contacts, { email: 'new@x.my', phone: '0100000000' }), null);
  assert.equal(matchClient(contacts, {}), null);
});

test('email and phone pointing at different clients is flagged ambiguous, email wins', () => {
  const r = matchClient(contacts, { email: 'aisyah@clinic.my', phone: '0198887777' });
  assert.equal(r.clientId, 'c1');
  assert.equal(r.by, 'email');
  assert.equal(r.ambiguous, true);
});

test('sorting: by name, by most recent contact, by newest created', () => {
  const cs = [
    { name: 'B', last_contact_at: '2026-09-01T00:00:00Z', created_at: '2026-01-01T00:00:00Z' },
    { name: 'A', last_contact_at: null, created_at: '2026-03-01T00:00:00Z' },
    { name: 'C', last_contact_at: '2026-09-20T00:00:00Z', created_at: '2026-02-01T00:00:00Z' },
  ];
  assert.deepEqual(sortClients(cs, 'name').map((c) => c.name), ['A', 'B', 'C']);
  assert.deepEqual(sortClients(cs, 'recent').map((c) => c.name), ['C', 'B', 'A']);
  assert.deepEqual(sortClients(cs, 'newest').map((c) => c.name), ['A', 'C', 'B']);
});

test('follow-up state: none, upcoming, due today, overdue', () => {
  const now = new Date('2026-09-25T04:00:00Z').getTime(); // 12:00 MYT on the 25th
  assert.equal(followUpState(null, now), 'none');
  assert.equal(followUpState('2026-09-28T02:00:00Z', now), 'upcoming');
  assert.equal(followUpState('2026-09-25T10:00:00Z', now), 'today');
  assert.equal(followUpState('2026-09-24T02:00:00Z', now), 'overdue');
});
