/**
 * Date difference calculator — calendar years/months/days, total days and total
 * weeks between two dates, with optional inclusive counting of the end date.
 */

import {
  type DateOnly,
  addDays,
  compareDates,
  diffCalendar,
  diffDays,
  formatLong,
  parseISODate,
} from "./date";

export type DateDiffSuccess = {
  ok: true;
  /** The earlier date — after any automatic swap. */
  from: DateOnly;
  /** The later date — after any automatic swap. */
  to: DateOnly;
  /** The visitor typed the later date first. */
  swapped: boolean;
  /** Whether the end date is counted. */
  inclusive: boolean;
  years: number;
  months: number;
  days: number;
  totalDays: number;
  weeks: number;
  leftoverDays: number;
  /** Plain sentence stating whether the end date is counted. */
  note: string;
  /** The two dates are the same calendar day. */
  sameDay: boolean;
};

export type DateDiffFailure = {
  ok: false;
  start?: string;
  end?: string;
  error: string;
};

export type DateDiffOutcome = DateDiffSuccess | DateDiffFailure;

export function dateDifference(
  startRaw: string,
  endRaw: string,
  includeEnd: boolean,
): DateDiffOutcome {
  const start = parseISODate(startRaw, "start date");
  const end = parseISODate(endRaw, "end date");

  if (!start.ok || !end.ok) {
    return {
      ok: false,
      start: start.ok ? undefined : start.error,
      end: end.ok ? undefined : end.error,
      error: "Check the highlighted date to see the difference.",
    };
  }

  const swapped = compareDates(start.value, end.value) > 0;
  const from = swapped ? end.value : start.value;
  const to = swapped ? start.value : end.value;

  // Inclusive counting means the end date itself is part of the span, which is
  // the same as counting up to the day after it.
  const spanEnd = includeEnd ? addDays(to, 1) : to;
  const ymd = diffCalendar(from, spanEnd);
  const totalDays = diffDays(from, spanEnd);

  return {
    ok: true,
    from,
    to,
    swapped,
    inclusive: includeEnd,
    years: ymd.years,
    months: ymd.months,
    days: ymd.days,
    totalDays,
    weeks: Math.floor(totalDays / 7),
    leftoverDays: totalDays % 7,
    note: includeEnd
      ? `${totalDays} days — the end date (${formatLong(to)}) is included in the count.`
      : `${totalDays} days — the end date (${formatLong(to)}) is not included in the count.`,
    sameDay: compareDates(start.value, end.value) === 0,
  };
}

/** Swaps a reversed pair so the UI can offer one-click fixing. */
export function swapPair(startRaw: string, endRaw: string): { start: string; end: string } {
  return { start: endRaw, end: startRaw };
}
