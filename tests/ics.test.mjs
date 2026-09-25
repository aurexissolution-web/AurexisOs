import assert from 'node:assert/strict';
import test from 'node:test';
import { buildIcs } from '../src/lib/email/ics.ts';

const unfold = (s) => s.replace(/\r\n /g, '');

const base = {
  uid: 'abc-123@aurexissolution.com',
  sequence: 2,
  title: 'Call with Aisyah, Dental Clinic',
  startsAt: '2026-09-25T02:00:00.000Z',
  endsAt: '2026-09-25T03:00:00.000Z',
  location: 'Google Meet',
  url: 'https://meet.google.com/abc-defg-hij',
  description: 'Line one\nLine two; with, punctuation',
  organizerEmail: 'hello@aurexissolution.com',
  attendeeEmail: 'me@gmail.com',
  alarmMinutes: 15,
};

test('an invite is a valid iCalendar request with the right times and identity', () => {
  const ics = unfold(buildIcs({ ...base, method: 'REQUEST' }));
  assert.ok(ics.startsWith('BEGIN:VCALENDAR\r\n'));
  assert.ok(ics.trimEnd().endsWith('END:VCALENDAR'));
  assert.match(ics, /METHOD:REQUEST\r\n/);
  assert.match(ics, /UID:abc-123@aurexissolution\.com\r\n/);
  assert.match(ics, /SEQUENCE:2\r\n/);
  assert.match(ics, /DTSTART:20260925T020000Z\r\n/);
  assert.match(ics, /DTEND:20260925T030000Z\r\n/);
  assert.match(ics, /STATUS:CONFIRMED\r\n/);
  assert.match(ics, /ATTENDEE[^\r\n]*mailto:me@gmail\.com/);
  assert.match(ics, /ORGANIZER[^\r\n]*mailto:hello@aurexissolution\.com/);
  assert.match(ics, /TRIGGER:-PT15M\r\n/);
});

test('text is escaped and long lines are folded under 75 characters', () => {
  const ics = buildIcs({ ...base, method: 'REQUEST' });
  assert.match(ics, /SUMMARY:Call with Aisyah\\, Dental Clinic/);
  assert.ok(ics.includes('Line one\\nLine two\; with\\, punctuation'));
  for (const line of ics.split('\r\n')) assert.ok(Buffer.byteLength(line) <= 75, line);
});

test('a cancellation keeps the same UID and marks the event cancelled', () => {
  const ics = buildIcs({ ...base, method: 'CANCEL', sequence: 3 });
  assert.match(ics, /METHOD:CANCEL\r\n/);
  assert.match(ics, /STATUS:CANCELLED\r\n/);
  assert.match(ics, /SEQUENCE:3\r\n/);
  assert.match(ics, /UID:abc-123@aurexissolution\.com\r\n/);
});

test('no alarm is written when none was chosen', () => {
  const ics = buildIcs({ ...base, method: 'REQUEST', alarmMinutes: null });
  assert.doesNotMatch(ics, /VALARM/);
});
