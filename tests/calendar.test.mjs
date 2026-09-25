import assert from 'node:assert/strict';
import test from 'node:test';
import {
  dateKeyOf,
  minutesOf,
  fromMyt,
  addDays,
  weekStart,
  monthGrid,
  layoutDay,
  dueReminders,
  snap,
  defaultEnd,
  alreadyPast,
} from '../src/lib/admin/calendar.ts';

// 2026-09-25 is a Friday. MYT is UTC+8 with no daylight saving.
test('malaysia time conversions round-trip and cross midnight correctly', () => {
  // 20:30 UTC on the 24th is 04:30 MYT on the 25th.
  assert.equal(dateKeyOf('2026-09-24T20:30:00Z'), '2026-09-25');
  assert.equal(minutesOf('2026-09-24T20:30:00Z'), 4 * 60 + 30);
  assert.equal(fromMyt('2026-09-25', 9 * 60 + 15), '2026-09-25T01:15:00.000Z');
  assert.equal(dateKeyOf(fromMyt('2026-12-31', 23 * 60 + 59)), '2026-12-31');
  assert.equal(minutesOf(fromMyt('2026-12-31', 23 * 60 + 59)), 23 * 60 + 59);
});

test('addDays and weekStart work across month and year ends, weeks start Monday', () => {
  assert.equal(addDays('2026-09-30', 1), '2026-10-01');
  assert.equal(addDays('2026-01-01', -1), '2025-12-31');
  assert.equal(weekStart('2026-09-25'), '2026-09-21'); // Friday -> Monday
  assert.equal(weekStart('2026-09-27'), '2026-09-21'); // Sunday -> previous Monday
  assert.equal(weekStart('2026-09-21'), '2026-09-21');
});

test('month grid is 6 weeks of 7 days covering the month, Monday first', () => {
  const g = monthGrid(2026, 8); // September (0-based month)
  assert.equal(g.length, 42);
  assert.equal(g[0], '2026-08-31'); // Sep 1 2026 is a Tuesday
  assert.ok(g.includes('2026-09-30'));
  assert.equal(g[41], '2026-10-11');
});

test('snap rounds to the nearest 15 minutes', () => {
  assert.equal(snap(7), 0);
  assert.equal(snap(8), 15);
  assert.equal(snap(62), 60);
  assert.equal(snap(68), 75);
});

test('defaultEnd gives meetings an hour and tasks half an hour', () => {
  assert.equal(defaultEnd('meeting', 600), 660);
  assert.equal(defaultEnd('task', 600), 630);
});

test('overlapping events split the column; separate ones stay full width', () => {
  const ev = (id, s, e) => ({ id, s, e });
  const out = layoutDay([ev('a', 540, 630), ev('b', 600, 660), ev('c', 720, 780)]);
  const by = Object.fromEntries(out.map((o) => [o.id, o]));
  assert.equal(by.a.cols, 2);
  assert.equal(by.b.cols, 2);
  assert.notEqual(by.a.col, by.b.col);
  assert.equal(by.c.cols, 1);
  assert.equal(by.c.col, 0);
});

const base = {
  status: 'scheduled',
  reminders: [30],
  reminders_sent: [],
  starts_at: '2026-09-25T02:00:00Z',
};
const at = (iso) => new Date(iso).getTime();

test('a reminder becomes due at its offset and not before', () => {
  assert.equal(dueReminders([{ id: 1, ...base }], at('2026-09-25T01:29:00Z')).length, 0);
  const due = dueReminders([{ id: 1, ...base }], at('2026-09-25T01:30:00Z'));
  assert.equal(due.length, 1);
  assert.deepEqual(due[0].offsets, [30]);
  assert.equal(due[0].minutesLeft, 30);
});

test('already-sent, cancelled and done events are skipped', () => {
  const now = at('2026-09-25T01:45:00Z');
  assert.equal(dueReminders([{ id: 1, ...base, reminders_sent: [30] }], now).length, 0);
  assert.equal(dueReminders([{ id: 1, ...base, status: 'cancelled' }], now).length, 0);
  assert.equal(dueReminders([{ id: 1, ...base, status: 'done' }], now).length, 0);
});

test('a late reminder still fires until 15 minutes after the start, then goes stale', () => {
  assert.equal(dueReminders([{ id: 1, ...base }], at('2026-09-25T02:10:00Z')).length, 1);
  assert.equal(dueReminders([{ id: 1, ...base }], at('2026-09-25T02:16:00Z')).length, 0);
});

test('when several reminders are due at once they are merged into one message', () => {
  const ev = { id: 1, ...base, reminders: [15, 60, 1440] };
  const due = dueReminders([ev], at('2026-09-25T01:50:00Z')); // 10 min before
  assert.equal(due.length, 1);
  assert.deepEqual(due[0].offsets.sort((a, b) => a - b), [15, 60, 1440]);
  assert.equal(due[0].minutesLeft, 10);
});

test('offsets already in the past when an event is saved are pre-marked as sent', () => {
  // Saving at 14:00 MYT for tomorrow 09:00 MYT: the 1-day reminder time has passed.
  const start = fromMyt('2026-09-26', 9 * 60);
  const now = at(fromMyt('2026-09-25', 14 * 60));
  assert.deepEqual(alreadyPast(start, [15, 60, 1440], now), [1440]);
  assert.deepEqual(alreadyPast(start, [15], now), []);
});
