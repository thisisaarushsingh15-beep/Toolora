/**
 * Age calculator — calendar-accurate years, months and days between a date of
 * birth and a reference date (today by default).
 */

import {
  type DateOnly,
  compareDates,
  diffCalendar,
  diffDays,
  formatLong,
  nextBirthday,
  parseISODate,
} from "./date";

export type AgeSuccess = {
  ok: true;
  birth: DateOnly;
  reference: DateOnly;
  years: number;
  months: number;
  days: number;
  totalDays: number;
  totalMonths: number;
  totalWeeks: number;
  leftoverDays: number;
  nextBirthday: DateOnly;
  daysUntilNextBirthday: number;
  /** The age reached on the next birthday. */
  turning: number;
  isBirthdayToday: boolean;
  /** 29 February birthday observed on 28 February because the year is not a leap year. */
  observedOnFeb28: boolean;
  /** The birth date itself is 29 February. */
  bornOnLeapDay: boolean;
  /** The reference date is later than the real today. */
  referenceInFuture: boolean;
  /** The reference date is the real today. */
  referenceIsToday: boolean;
};

export type AgeFailure = {
  ok: false;
  birth?: string;
  reference?: string;
  error: string;
};

export type AgeOutcome = AgeSuccess | AgeFailure;

export function computeAge(
  birthRaw: string,
  referenceRaw: string,
  today?: DateOnly | null,
): AgeOutcome {
  const birth = parseISODate(birthRaw, "date of birth");
  const reference = parseISODate(referenceRaw, "reference date");

  if (!birth.ok || !reference.ok) {
    return {
      ok: false,
      birth: birth.ok ? undefined : birth.error,
      reference: reference.ok ? undefined : reference.error,
      error: "Check the highlighted date to see the age.",
    };
  }

  if (compareDates(birth.value, reference.value) > 0) {
    return {
      ok: false,
      birth: "This date of birth is after the reference date.",
      error: `The date of birth (${formatLong(birth.value)}) is after the reference date (${formatLong(
        reference.value,
      )}). An age cannot be negative — correct one of the two dates.`,
    };
  }

  const ymd = diffCalendar(birth.value, reference.value);
  const totalDays = diffDays(birth.value, reference.value);
  const totalMonths = ymd.years * 12 + ymd.months;
  const upcoming = nextBirthday(birth.value, reference.value);

  return {
    ok: true,
    birth: birth.value,
    reference: reference.value,
    years: ymd.years,
    months: ymd.months,
    days: ymd.days,
    totalDays,
    totalMonths,
    totalWeeks: Math.floor(totalDays / 7),
    leftoverDays: totalDays % 7,
    nextBirthday: upcoming.date,
    daysUntilNextBirthday: upcoming.daysUntil,
    turning: upcoming.turning,
    isBirthdayToday: upcoming.isToday,
    observedOnFeb28: upcoming.clampedFromFeb29,
    bornOnLeapDay: birth.value.m === 2 && birth.value.d === 29,
    referenceInFuture: today ? compareDates(reference.value, today) > 0 : false,
    referenceIsToday: today ? compareDates(reference.value, today) === 0 : false,
  };
}

/** The sentence shown above the numbers, stating which reference date was used. */
export function describeAge(outcome: AgeSuccess): string {
  const yearsText = `${outcome.years} year${outcome.years === 1 ? "" : "s"}`;
  const monthsText = `${outcome.months} month${outcome.months === 1 ? "" : "s"}`;
  const daysText = `${outcome.days} day${outcome.days === 1 ? "" : "s"}`;
  return `${yearsText}, ${monthsText} and ${daysText} on ${formatLong(outcome.reference)}.`;
}
