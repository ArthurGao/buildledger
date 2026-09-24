/**
 * New Zealand working days, as the Construction Contracts Act 2002 defines them.
 *
 * A working day is any day that is NOT:
 *   - a Saturday or Sunday
 *   - a public holiday (national, plus the region's anniversary day)
 *   - any day in the period 24 December to 5 January inclusive
 *
 * That last exclusion is the one generic business-day helpers get wrong: the
 * whole Christmas shutdown drops out, not just the two statutory days. A
 * payment claim served in mid-December is not due until well into February.
 *
 * Holidays are a hand-maintained table rather than a computation. Mondayisation,
 * Easter and the legislated Matariki dates all move for reasons a formula does
 * not capture, and a statutory deadline is not a place to be clever. Extend the
 * table each year; `isCalendarCovered` tells callers when a date falls outside it.
 */

export type Region = "Auckland" | "Wellington";

/** Public holidays as actually observed, already mondayised. */
const NATIONAL_HOLIDAYS: Record<number, string[]> = {
  2026: [
    "2026-01-01", // New Year's Day (Thu)
    "2026-01-02", // Day after New Year's Day (Fri)
    "2026-02-06", // Waitangi Day (Fri)
    "2026-04-03", // Good Friday
    "2026-04-06", // Easter Monday
    "2026-04-27", // ANZAC Day observed — 25 Apr falls on a Saturday
    "2026-06-01", // King's Birthday
    "2026-07-10", // Matariki
    "2026-10-26", // Labour Day
    "2026-12-25", // Christmas Day (Fri)
    "2026-12-28", // Boxing Day observed — 26 Dec falls on a Saturday
  ],
  2027: [
    "2027-01-01",
    "2027-01-04", // Day after New Year's observed — 2 Jan falls on a Saturday
    "2027-02-08", // Waitangi Day observed — 6 Feb falls on a Saturday
    "2027-03-26", // Good Friday
    "2027-03-29", // Easter Monday
    "2027-04-26", // ANZAC Day observed — 25 Apr falls on a Sunday
    "2027-06-07", // King's Birthday
    "2027-06-25", // Matariki
    "2027-10-25", // Labour Day
    "2027-12-27", // Christmas Day observed — 25 Dec falls on a Saturday
    "2027-12-28", // Boxing Day observed
  ],
};

/** Anniversary days differ by region — Auckland and Wellington are never the same day. */
const REGIONAL_HOLIDAYS: Record<Region, Record<number, string[]>> = {
  Auckland: {
    2026: ["2026-01-26"], // Monday nearest 29 January
    2027: ["2027-02-01"],
  },
  Wellington: {
    2026: ["2026-01-19"], // Monday nearest 22 January
    2027: ["2027-01-25"],
  },
};

export const DEFAULT_REGION: Region = "Auckland";

/** Years the holiday table covers. Outside these, results are not trustworthy. */
export const COVERED_YEARS = Object.keys(NATIONAL_HOLIDAYS).map(Number);

/** Parse a YYYY-MM-DD date without letting the local timezone shift the day. */
function parseDate(iso: string): { y: number; m: number; d: number } {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  return { y, m, d };
}

function toIso(y: number, m: number, d: number): string {
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

/** Day of week for a calendar date, 0 = Sunday. Pure arithmetic, no Date object. */
function dayOfWeek(y: number, m: number, d: number): number {
  const t = [0, 3, 2, 5, 0, 3, 5, 1, 4, 6, 2, 4];
  const yy = m < 3 ? y - 1 : y;
  return (yy + Math.floor(yy / 4) - Math.floor(yy / 100) + Math.floor(yy / 400) + t[m - 1] + d) % 7;
}

function daysInMonth(y: number, m: number): number {
  if (m === 2) return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0 ? 29 : 28;
  return [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][m - 1];
}

/** The next calendar day. */
function nextDay(iso: string): string {
  const { y, m, d } = parseDate(iso);
  if (d < daysInMonth(y, m)) return toIso(y, m, d + 1);
  if (m < 12) return toIso(y, m + 1, 1);
  return toIso(y + 1, 1, 1);
}

function holidaysFor(year: number, region: Region): string[] {
  return [...(NATIONAL_HOLIDAYS[year] ?? []), ...(REGIONAL_HOLIDAYS[region][year] ?? [])];
}

/** True when the holiday table covers this date's year. */
export function isCalendarCovered(iso: string): boolean {
  return COVERED_YEARS.includes(parseDate(iso).y);
}

/**
 * The Christmas shutdown: 24 December to 5 January inclusive is never a working
 * day, whatever day of the week it falls on.
 */
export function isInChristmasShutdown(iso: string): boolean {
  const { m, d } = parseDate(iso);
  return (m === 12 && d >= 24) || (m === 1 && d <= 5);
}

export function isWorkingDay(iso: string, region: Region = DEFAULT_REGION): boolean {
  const { y, m, d } = parseDate(iso);
  const dow = dayOfWeek(y, m, d);
  if (dow === 0 || dow === 6) return false;
  if (isInChristmasShutdown(iso)) return false;
  return !holidaysFor(y, region).includes(iso);
}

/**
 * The statutory due date: `count` working days after `from`.
 * The trigger day itself is not counted — the clock starts the next working day.
 */
export function addWorkingDays(from: string, count: number, region: Region = DEFAULT_REGION): string {
  let cursor = from.slice(0, 10);
  let remaining = count;
  // A 20-working-day span can cross the whole shutdown, so allow a wide walk.
  let guard = 0;
  while (remaining > 0 && guard < 400) {
    cursor = nextDay(cursor);
    if (isWorkingDay(cursor, region)) remaining -= 1;
    guard += 1;
  }
  return cursor;
}

/** Working days elapsed from `from` up to and including `to`. Never negative. */
export function workingDaysBetween(from: string, to: string, region: Region = DEFAULT_REGION): number {
  let cursor = from.slice(0, 10);
  const end = to.slice(0, 10);
  if (cursor >= end) return 0;
  let n = 0;
  let guard = 0;
  while (cursor < end && guard < 2000) {
    cursor = nextDay(cursor);
    if (isWorkingDay(cursor, region)) n += 1;
    guard += 1;
  }
  return n;
}

/**
 * Where a statutory clock stands on a given day.
 * `remaining` is negative once the deadline has passed.
 */
export interface ClockPosition {
  dueOn: string;
  elapsed: number;
  remaining: number;
  overdue: boolean;
  /** True when the holiday table does not cover the whole span. */
  uncertain: boolean;
}

export function clockPosition(
  triggeredOn: string,
  workingDays: number,
  today: string,
  region: Region = DEFAULT_REGION
): ClockPosition {
  const dueOn = addWorkingDays(triggeredOn, workingDays, region);
  const elapsed = workingDaysBetween(triggeredOn, today, region);
  return {
    dueOn,
    elapsed,
    remaining: workingDays - elapsed,
    overdue: elapsed > workingDays,
    uncertain: !isCalendarCovered(triggeredOn) || !isCalendarCovered(dueOn),
  };
}
