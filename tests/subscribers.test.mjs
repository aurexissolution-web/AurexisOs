import test from 'node:test';
import assert from 'node:assert/strict';
import { DRIP_STEPS, nextDripAt, bodyToBlocks } from '../src/lib/subscribers/drip.ts';
import { dripEmail, broadcastEmail } from '../src/lib/email/templates.ts';

const signup = '2026-09-28T02:00:00.000Z';

test('follow-up schedule is measured from sign-up: day 0, 3, 7, 14', () => {
  assert.equal(DRIP_STEPS.length, 4);
  assert.equal(nextDripAt(signup, 0), signup);
  assert.equal(nextDripAt(signup, 1), '2026-10-01T02:00:00.000Z');
  assert.equal(nextDripAt(signup, 2), '2026-10-05T02:00:00.000Z');
  assert.equal(nextDripAt(signup, 3), '2026-10-12T02:00:00.000Z');
  assert.equal(nextDripAt(signup, 4), null);
});

test('newsletter body becomes paragraphs and drops empty ones', () => {
  assert.deepEqual(bodyToBlocks('Hello there\n\n\nSecond  paragraph\nsame para\n\n  '), ['Hello there', 'Second  paragraph\nsame para']);
});

test('every follow-up email renders with an unsubscribe link and safe HTML', () => {
  for (let i = 0; i < DRIP_STEPS.length; i++) {
    const e = dripEmail(i, { name: '<b>Sam</b>', unsubUrl: 'https://aurexissolution.com/unsubscribe?t=abc' });
    assert.ok(e.subject.length > 5);
    assert.ok(e.html.includes('unsubscribe?t=abc'), `step ${i} html unsub`);
    assert.ok(e.text.includes('unsubscribe?t=abc'), `step ${i} text unsub`);
    assert.ok(!e.html.includes('<b>Sam</b>'), 'name is escaped');
  }
});

test('broadcast escapes the message and keeps the unsubscribe link', () => {
  const e = broadcastEmail({ subject: 'News', paragraphs: ['Hi <script>x</script>', 'Bye'], unsubUrl: 'https://aurexissolution.com/unsubscribe?t=z' });
  assert.ok(!e.html.includes('<script>'));
  assert.ok(e.html.includes('unsubscribe?t=z'));
  assert.equal(e.subject, 'News');
});
