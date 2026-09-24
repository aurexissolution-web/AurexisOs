import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

// Mirrors src/lib/calculator.ts. The guard test at the bottom fails if the
// shipped implementation drifts away from this reference.
const HOURS_PER_MONTH = 173;
const WEEKS_PER_YEAR = 52;
const FULL_WEEK_HOURS = 40;
const HOURS_PER_DAY = 8;
const WORKING_DAYS_PER_YEAR = 260;

function computeCapacityCost(people, monthlySalary, hoursPerPersonPerWeek) {
  const hourlyRate = monthlySalary / HOURS_PER_MONTH;
  const annualHours = people * hoursPerPersonPerWeek * WEEKS_PER_YEAR;
  const annualCost = annualHours * hourlyRate;
  return {
    hourlyRate,
    annualHours,
    annualCost,
    monthlyCost: annualCost / 12,
    percentOfWeek: (hoursPerPersonPerWeek / FULL_WEEK_HOURS) * 100,
    daysPerYear: annualHours / HOURS_PER_DAY,
    perPersonDaysLost:
      (hoursPerPersonPerWeek / FULL_WEEK_HOURS) * WORKING_DAYS_PER_YEAR,
  };
}

const r = (n) => Math.round(n);

test("defaults produce the hand-verified figure", () => {
  const c = computeCapacityCost(3, 2500, 8);
  // Rounding the hourly rate first (14.45) gives 18,036 — one ringgit out.
  // Full precision to the end is the correct answer.
  assert.equal(r(c.annualCost), 18035);
  assert.equal(r(c.monthlyCost), 1503);
  assert.equal(r(c.percentOfWeek), 20);
  assert.equal(r(c.daysPerYear), 156);
});

test("monthly x 12 equals annual — no double-rounding drift", () => {
  for (const [p, s, h] of [
    [3, 2500, 8],
    [7, 3300, 13],
    [1, 1500, 1],
    [23, 9700, 37],
  ]) {
    const c = computeCapacityCost(p, s, h);
    assert.ok(
      Math.abs(c.monthlyCost * 12 - c.annualCost) < 1e-9,
      `monthly x 12 !== annual for ${p}/${s}/${h}`,
    );
  }
});

test("upper bound stays sane", () => {
  const c = computeCapacityCost(50, 15000, 40);
  assert.equal(r(c.annualCost), 9017341);
  assert.equal(r(c.percentOfWeek), 100);
  assert.equal(r(c.daysPerYear), 13000);
});

test("zero admin hours costs nothing", () => {
  const c = computeCapacityCost(10, 5000, 0);
  assert.equal(c.annualCost, 0);
  assert.equal(c.monthlyCost, 0);
  assert.equal(c.percentOfWeek, 0);
  assert.equal(c.daysPerYear, 0);
});

test("cost scales linearly with each input", () => {
  const base = computeCapacityCost(3, 2500, 8).annualCost;
  assert.ok(Math.abs(computeCapacityCost(6, 2500, 8).annualCost - base * 2) < 1e-9);
  assert.ok(Math.abs(computeCapacityCost(3, 5000, 8).annualCost - base * 2) < 1e-9);
  assert.ok(Math.abs(computeCapacityCost(3, 2500, 16).annualCost - base * 2) < 1e-9);
});

test("per-person days can never overflow the 260-block year strip", () => {
  // The visual is a 260-day calendar. `daysPerYear` is team-wide and passes 260
  // as soon as the team does (a 5-person clinic hits 325), which would peg the
  // strip at full and make 325 look identical to 13,000.
  for (let people = 1; people <= 50; people += 7) {
    for (let hours = 0; hours <= FULL_WEEK_HOURS; hours += 5) {
      const c = computeCapacityCost(people, 3000, hours);
      assert.ok(
        c.perPersonDaysLost >= 0 && c.perPersonDaysLost <= WORKING_DAYS_PER_YEAR,
        `perPersonDaysLost out of range at ${people}p/${hours}h: ${c.perPersonDaysLost}`,
      );
    }
  }
  // Only a full 40-hour admin week fills the year completely.
  assert.equal(computeCapacityCost(9, 3000, 40).perPersonDaysLost, WORKING_DAYS_PER_YEAR);
  assert.equal(computeCapacityCost(3, 2500, 8).perPersonDaysLost, 52);
});

test("presets all clear RM10k, where the argument starts to hold", () => {
  const presets = [
    ["Kedai", 2, 2000, 10],
    ["Klinik", 4, 3000, 12],
    ["Kontraktor", 6, 3200, 10],
    ["Agensi", 8, 4500, 12],
  ];
  for (const [name, p, s, h] of presets) {
    const { annualCost } = computeCapacityCost(p, s, h);
    assert.ok(annualCost > 10_000, `${name} lands at only RM${Math.round(annualCost)}`);
  }
});

test("the shipped helper matches this reference implementation", () => {
  const src = readFileSync("src/lib/calculator.ts", "utf8");
  for (const marker of [
    "const hourlyRate = monthlySalary / HOURS_PER_MONTH;",
    "const annualHours = people * hoursPerPersonPerWeek * WEEKS_PER_YEAR;",
    "const annualCost = annualHours * hourlyRate;",
    "monthlyCost: annualCost / 12,",
    "percentOfWeek: (hoursPerPersonPerWeek / FULL_WEEK_HOURS) * 100,",
    "daysPerYear: annualHours / HOURS_PER_DAY,",
    "(hoursPerPersonPerWeek / FULL_WEEK_HOURS) * WORKING_DAYS_PER_YEAR,",
    "export const HOURS_PER_MONTH = 173;",
    "export const WORKING_DAYS_PER_YEAR = 260;",
  ]) {
    assert.ok(src.includes(marker), `calculator.ts drifted: missing ${marker}`);
  }
});
