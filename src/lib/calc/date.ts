/**
 * Calendar-aware, date-only arithmetic in pure TypeScript.
 *
 * Every value is a plain `{ y, m, d }` (month 1-12) and is converted to a UTC
 * timestamp internally, so no timezone, DST or local-clock drift can ever move a
 * date. Nothing here touches React, the DOM or `window`, so it is all testable
 * with `bun test`.
 */

export type DateOnly = { y: number; m: number; d: number };

const DAY_MS = 86_400_000;
const MONTH_LENGTHS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const WEEKDAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export type DateParseResult =
  | { ok: true; value: DateOnly }
  | { ok: false; error: string };

export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/** Real month lengths — February is 29 days in leap years, never a flat 30. */
export function daysInMonth(year: number, month: number): number {
  if (month === 2) return isLeapYear(year) ? 29 : 28;
  return MONTH_LENGTHS[month - 1] ?? 0;
}

export function daysInYear(year: number): number {
  return isLeapYear(year) ? 366 : 365;
}

export function monthName(month: number): string {
  return MONTH_NAMES[month - 1] ?? "";
}

export function weekdayName(date: DateOnly): string {
  return WEEKDAY_NAMES[dayOfWeek(date)] ?? "";
}

export function isValidDateOnly(value: DateOnly): boolean {
  if (!Number.isInteger(value.y) || !Number.isInteger(value.m) || !Number.isInteger(value.d)) {
    return false;
  }
  if (value.y < 1 || value.y > 9999) return false;
  if (value.m < 1 || value.m > 12) return false;
  return value.d >= 1 && value.d <= daysInMonth(value.y, value.m);
}

/** UTC midnight of the given calendar day — the only clock this module uses. */
export function toUTCDate(value: DateOnly): Date {
  return new Date(Date.UTC(value.y, value.m - 1, value.d));
}

function toDayNumber(value: DateOnly): number {
  return Date.UTC(value.y, value.m - 1, value.d) / DAY_MS;
}

export function compareDates(a: DateOnly, b: DateOnly): number {
  return toDayNumber(a) - toDayNumber(b);
}

/** Whole days from `a` to `b`. Negative when `b` is earlier than `a`. */
export function diffDays(a: DateOnly, b: DateOnly): number {
  return toDayNumber(b) - toDayNumber(a);
}

export function addDays(value: DateOnly, days: number): DateOnly {
  const shifted = new Date(Date.UTC(value.y, value.m - 1, value.d) + days * DAY_MS);
  return {
    y: shifted.getUTCFullYear(),
    m: shifted.getUTCMonth() + 1,
    d: shifted.getUTCDate(),
  };
}

/** Adds calendar months, clamping the day to the real length of the target month. */
export function addMonths(value: DateOnly, months: number): DateOnly {
  const total = value.y * 12 + (value.m - 1) + months;
  const y = Math.floor(total / 12);
  const m = (total % 12 + 12) % 12 + 1;
  const d = Math.min(value.d, daysInMonth(y, m));
  return { y, m, d };
}

export function addYears(value: DateOnly, years: number): DateOnly {
  return addMonths(value, years * 12);
}

/** 0 = Sunday … 6 = Saturday, computed from the UTC day number. */
export function dayOfWeek(value: DateOnly): number {
  return ((toDayNumber(value) % 7) + 11) % 7;
}

/**
 * `birth`'s anniversary in `year`, clamping 29 February to 28 February in a
 * non-leap year. One rule, used by both the age and the difference calculators.
 */
export function anniversaryIn(birth: DateOnly, year: number): DateOnly {
  return { y: year, m: birth.m, d: Math.min(birth.d, daysInMonth(year, birth.m)) };
}

/**
 * Calendar difference as whole years, whole months and leftover days.
 *
 * Both steps use `addMonths`, so a month step from 31 January lands on 28
 * February (clamped) rather than an invented 31 February, and a 29 February
 * anniversary is reached on 28 February in non-leap years. The returned triple
 * always walks forward exactly to `to`: start + years + months + days === to.
 * Assumes `to` is not earlier than `from`.
 */
export function diffCalendar(from: DateOnly, to: DateOnly): { years: number; months: number; days: number } {
  let years = to.y - from.y;
  let cursor = anniversaryIn(from, from.y + years);
  if (compareDates(cursor, to) > 0) {
    years -= 1;
    cursor = anniversaryIn(from, from.y + years);
  }

  let months = 0;
  let next = addMonths(cursor, 1);
  while (compareDates(next, to) <= 0) {
    cursor = next;
    months += 1;
    next = addMonths(cursor, 1);
  }

  return { years, months, days: diffDays(cursor, to) };
}

const ISO_PATTERN = /^(\d{4})-(\d{1,2})-(\d{1,2})$/;

/** Parses an ISO `YYYY-MM-DD` value (the format an <input type="date"> gives us). */
export function parseISODate(raw: string, label = "date"): DateParseResult {
  const trimmed = raw.trim();
  if (trimmed === "") return { ok: false, error: `Enter a ${label}.` };

  const match = ISO_PATTERN.exec(trimmed);
  if (!match) return { ok: false, error: `Use a real date in YYYY-MM-DD format for the ${label}.` };

  const y = Number(match[1]);
  const m = Number(match[2]);
  const d = Number(match[3]);
  if (m < 1 || m > 12) {
    return { ok: false, error: `There is no month ${m} — enter a ${label} between January and December.` };
  }
  const limit = daysInMonth(y, m);
  if (d < 1 || d > limit) {
    return {
      ok: false,
      error: `${match[1]}-${match[2].padStart(2, "0")} has ${limit} days, so ${trimmed} is not a real date.`,
    };
  }
  return { ok: true, value: { y, m, d } };
}

export function toISODate(value: DateOnly): string {
  const m = String(value.m).padStart(2, "0");
  const d = String(value.d).padStart(2, "0");
  return `${String(value.y).padStart(4, "0")}-${m}-${d}`;
}

export function formatLong(value: DateOnly): string {
  return `${value.d} ${monthName(value.m)} ${value.y}`;
}

export function formatWithWeekday(value: DateOnly): string {
  return `${weekdayName(value)}, ${formatLong(value)}`;
}

/** Today in the visitor's own timezone, as a date-only value. Browser-side only. */
export function todayDateOnly(): DateOnly {
  const now = new Date();
  return { y: now.getFullYear(), m: now.getMonth() + 1, d: now.getDate() };
}

export type NextBirthday = {
  date: DateOnly;
  daysUntil: number;
  /** Age reached on that birthday. */
  turning: number;
  isToday: boolean;
  /** True when a 29 February birthday had to be observed on 28 February. */
  clampedFromFeb29: boolean;
};

/**
 * The next occurrence of a birthday on or after `reference`. A 29 February
 * birthday is observed on 28 February in a non-leap year (and that is flagged
 * for the UI to explain), never skipped to 1 March.
 */
export function nextBirthday(birth: DateOnly, reference: DateOnly): NextBirthday {
  const clamped = (year: number): DateOnly => {
    const day = Math.min(birth.d, daysInMonth(year, birth.m));
    return { y: year, m: birth.m, d: day };
  };

  let candidate = clamped(reference.y);
  if (compareDates(candidate, reference) < 0) {
    candidate = clamped(reference.y + 1);
  }
  const isToday = compareDates(candidate, reference) === 0;
  const feb29 = birth.m === 2 && birth.d === 29;
  return {
    date: candidate,
    daysUntil: diffDays(reference, candidate),
    turning: candidate.y - birth.y,
    isToday,
    clampedFromFeb29: feb29 && !isLeapYear(candidate.y),
  };
}
