/**
 * Cost of repetitive admin work, derived only from what the user enters.
 *
 *   hourlyRate = monthlySalary / HOURS_PER_MONTH
 *   annualCost = people × hoursPerPersonPerWeek × WEEKS_PER_YEAR × hourlyRate
 *
 * Every figure is returned unrounded so callers round once at the display
 * boundary. Rounding mid-chain is what made the old version's monthly × 12
 * disagree with its own annual figure.
 */

export const HOURS_PER_MONTH = 173; // contracted working hours in a month
export const WEEKS_PER_YEAR = 52;
export const FULL_WEEK_HOURS = 40;
export const HOURS_PER_DAY = 8;
export const WORKING_DAYS_PER_YEAR = 260; // 52 weeks × 5 days

export interface CapacityCost {
  /** Cost of one working hour, from the monthly salary. */
  hourlyRate: number;
  /** Admin hours the whole team burns in a year. */
  annualHours: number;
  annualCost: number;
  monthlyCost: number;
  /** Share of one person's 40-hour week spent on admin, 0–100. */
  percentOfWeek: number;
  /** Team-wide working days a year, at 8 hours a day. */
  daysPerYear: number;
  /**
   * Days one person loses out of their own 260-day year. Bounded by 260 by
   * construction, so a calendar visual built on it can never overflow —
   * unlike `daysPerYear`, which passes 260 as soon as the team does.
   */
  perPersonDaysLost: number;
}

export function computeCapacityCost(
  people: number,
  monthlySalary: number,
  hoursPerPersonPerWeek: number,
): CapacityCost {
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

const MYR = new Intl.NumberFormat("en-MY", { maximumFractionDigits: 0 });

/** Thousands-separated, no decimals — e.g. 18035 → "18,035". */
export function formatMYR(value: number): string {
  return MYR.format(Math.round(value));
}

export const CALCULATOR_DEFAULTS = {
  people: 3,
  salary: 2500,
  hours: 8,
} as const;

/**
 * Starting points, not claims — typical Malaysian SME shapes. Every one lands
 * above RM10k a year, which is where the argument for a system starts to hold.
 */
export const CALCULATOR_PRESETS = [
  { label: "Kedai", people: 2, salary: 2000, hours: 10 },
  { label: "Klinik", people: 4, salary: 3000, hours: 12 },
  { label: "Kontraktor", people: 6, salary: 3200, hours: 10 },
  { label: "Agensi", people: 8, salary: 4500, hours: 12 },
] as const;

export const CALCULATOR_BOUNDS = {
  people: { min: 1, max: 50, step: 1 },
  salary: { min: 1500, max: 15000, step: 100 },
  hours: { min: 0, max: 40, step: 1 },
} as const;
