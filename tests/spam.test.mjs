import test from 'node:test';
import assert from 'node:assert/strict';
import { cap, isHoneypot, rateLimited } from '../src/lib/spam.ts';
import { toTelegramHtml } from '../src/lib/telegram.ts';

test('rate limiter allows the limit then blocks, per key', () => {
  const key = `k-${Math.random()}`;
  assert.deepEqual([1, 2, 3, 4].map(() => rateLimited(key, 3, 60_000)), [false, false, false, true]);
  assert.equal(rateLimited(`other-${Math.random()}`, 3, 60_000), false);
});

test('honeypot and cap', () => {
  assert.equal(isHoneypot({ website: 'http://spam' }), true);
  assert.equal(isHoneypot({ website: '  ' }), false);
  assert.equal(isHoneypot({}), false);
  assert.equal(cap('  hello world  ', 5), 'hello');
  assert.equal(cap(42, 5), '');
});

test('telegram text is escaped and stray markers cannot break it', () => {
  assert.equal(toTelegramHtml('*Name:* Sam'), '<b>Name:</b> Sam');
  assert.equal(toTelegramHtml('*Name:* a*b _c'), '<b>Name:</b> a*b _c');
  assert.equal(toTelegramHtml('<a href="x">hi</a> & bye'), '&lt;a href="x"&gt;hi&lt;/a&gt; &amp; bye');
});
