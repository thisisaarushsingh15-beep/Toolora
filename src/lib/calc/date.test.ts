import { describe, expect, test } from "bun:test";
import {
  addDays,
  addMonths,
  compareDates,
  dayOfWeek,
  daysInMonth,
  diffCalendar,
  diffDays,
  formatLong,
  isValidDateOnly,
  isLeapYear,
  nextBirthday,
  parseISODate,
  toISODate,
} from "./date";

describe("calendar facts", () => {
  test("leap years follow the real rule, including centuries", () => {
    expect(isLeapYear(2024)).toBe(true);
    expect(isLeapYear(2023)).toBe(false);
    expect(isLeapYear(1900)).toBe(false);
    expect(isLeapYear(2000)).toBe(true);
  });

  test("month lengths are real, never a flat 30", () => {
    expect(daysInMonth(2023, 2)).toBe(28);
    expect(daysInMonth(2024, 2)).toBe(29);
    expect(daysInMonth(2024, 1)).toBe(31);
    expect(daysInMonth(2024, 4)).toBe(30);
    expect(daysInMonth(2024, 12)).toBe(31);
  });

  test("impossible dates are rejected", () => {
    expect(isValidDateOnly({ y: 2023, m: 2, d: 29 })).toBe(false);
    expect(isValidDateOnly({ y: 2024, m: 2, d: 29 })).toBe(true);
    expect(isValidDateOnly({ y: 2024, m: 13, d: 1 })).toBe(false);
    expect(isValidDateOnly({ y: 2024, m: 0, d: 1 })).toBe(false);
    expect(isValidDateOnly({ y: 2024, m: 4, d: 31 })).toBe(false);
  });
});

describe("parseISODate", () => {
  test("parses valid ISO dates", () => {
    const parsed = parseISODate("2024-02-29");
    expect(parsed.ok).toBe(true);
    if (parsed.ok) expect(parsed.value).toEqual({ y: 2024, m: 2, d: 29 });
  });

  test("names the field in every error", () => {
    const empty = parseISODate("", "date of birth");
    expect(empty.ok).toBe(false);
    if (!empty.ok) expect(empty.error).toContain("date of birth");

    const junk = parseISODate("29/02/2024", "start date");
    expect(junk.ok).toBe(false);
    if (!junk.ok) expect(junk.error).toContain("YYYY-MM-DD");

    const impossible = parseISODate("2023-02-29", "reference date");
    expect(impossible.ok).toBe(false);
    if (!impossible.ok) expect(impossible.error).toContain("28 days");

    const month = parseISODate("2024-13-01");
    expect(month.ok).toBe(false);
    if (!month.ok) expect(month.error).toContain("no month 13");
  });
});

describe("day arithmetic", () => {
  test("diffDays crosses leap days and month ends", () => {
    expect(diffDays({ y: 2024, m: 2, d: 28 }, { y: 2024, m: 3, d: 1 })).toBe(2);
    expect(diffDays({ y: 2023, m: 2, d: 28 }, { y: 2023, m: 3, d: 1 })).toBe(1);
    expect(diffDays({ y: 2024, m: 1, d: 1 }, { y: 2025, m: 1, d: 1 })).toBe(366);
    expect(diffDays({ y: 2024, m: 3, d: 1 }, { y: 2024, m: 2, d: 28 })).toBe(-2);
  });

  test("addDays and addMonths clamp to real month lengths", () => {
    expect(addDays({ y: 2024, m: 12, d: 31 }, 1)).toEqual({ y: 2025, m: 1, d: 1 });
    expect(addMonths({ y: 2024, m: 1, d: 31 }, 1)).toEqual({ y: 2024, m: 2, d: 29 });
    expect(addMonths({ y: 2023, m: 1, d: 31 }, 1)).toEqual({ y: 2023, m: 2, d: 28 });
    expect(addMonths({ y: 2023, m: 12, d: 15 }, 1)).toEqual({ y: 2024, m: 1, d: 15 });
  });

  test("date-only values never drift: round trip and weekday are stable", () => {
    expect(toISODate({ y: 2024, m: 2, d: 29 })).toBe("2024-02-29");
    expect(compareDates({ y: 2024, m: 2, d: 29 }, { y: 2024, m: 2, d: 29 })).toBe(0);
    expect(dayOfWeek({ y: 2024, m: 2, d: 29 })).toBe(4); // Thursday
    expect(formatLong({ y: 2024, m: 2, d: 29 })).toBe("29 February 2024");
  });
});

describe("diffCalendar", () => {
  test("walks forward exactly to the end date", () => {
    const cases: [{ y: number; m: number; d: number }, { y: number; m: number; d: number }][] = [
      [{ y: 1990, m: 3, d: 15 }, { y: 2024, m: 10, d: 1 }],
      [{ y: 2023, m: 1, d: 31 }, { y: 2023, m: 3, d: 1 }],
      [{ y: 2024, m: 2, d: 29 }, { y: 2025, m: 2, d: 28 }],
      [{ y: 2024, m: 2, d: 29 }, { y: 2024, m: 3, d: 1 }],
      [{ y: 2000, m: 1, d: 1 }, { y: 2000, m: 1, d: 1 }],
    ];
    for (const [from, to] of cases) {
      const ymd = diffCalendar(from, to);
      const walk = addDays(addMonths(from, ymd.years * 12 + ymd.months), ymd.days);
      expect(walk).toEqual(to);
    }
  });

  test("known values, including month-end starts", () => {
    expect(diffCalendar({ y: 2023, m: 1, d: 31 }, { y: 2023, m: 3, d: 1 })).toEqual({
      years: 0,
      months: 1,
      days: 1,
    });
    expect(diffCalendar({ y: 1990, m: 3, d: 15 }, { y: 2024, m: 9, d: 14 })).toEqual({
      years: 34,
      months: 5,
      days: 30,
    });
    expect(diffCalendar({ y: 2024, m: 2, d: 29 }, { y: 2025, m: 2, d: 28 })).toEqual({
      years: 1,
      months: 0,
      days: 0,
    });
    expect(diffCalendar({ y: 2024, m: 2, d: 29 }, { y: 2025, m: 2, d: 27 })).toEqual({
      years: 0,
      months: 11,
      days: 29,
    });
  });
});

describe("nextBirthday", () => {
  test("finds the upcoming birthday and the age reached", () => {
    const next = nextBirthday({ y: 1990, m: 6, d: 10 }, { y: 2024, m: 6, d: 9 });
    expect(next.date).toEqual({ y: 2024, m: 6, d: 10 });
    expect(next.daysUntil).toBe(1);
    expect(next.turning).toBe(34);
    expect(next.isToday).toBe(false);
  });

  test("a birthday today reports zero days and rolls over after it", () => {
    const today = nextBirthday({ y: 1990, m: 6, d: 10 }, { y: 2024, m: 6, d: 10 });
    expect(today.daysUntil).toBe(0);
    expect(today.isToday).toBe(true);
    expect(today.turning).toBe(34);

    const after = nextBirthday({ y: 1990, m: 6, d: 10 }, { y: 2024, m: 6, d: 11 });
    expect(after.date).toEqual({ y: 2025, m: 6, d: 10 });
    expect(after.turning).toBe(35);
  });

  test("29 February birthdays fall back to 28 February in a non-leap year", () => {
    const inLeapYear = nextBirthday({ y: 2000, m: 2, d: 29 }, { y: 2024, m: 1, d: 1 });
    expect(inLeapYear.date).toEqual({ y: 2024, m: 2, d: 29 });
    expect(inLeapYear.clampedFromFeb29).toBe(false);

    const inCommonYear = nextBirthday({ y: 2000, m: 2, d: 29 }, { y: 2025, m: 1, d: 1 });
    expect(inCommonYear.date).toEqual({ y: 2025, m: 2, d: 28 });
    expect(inCommonYear.clampedFromFeb29).toBe(true);
    expect(inCommonYear.turning).toBe(25);

    const inCommonYearAfter = nextBirthday({ y: 2000, m: 2, d: 29 }, { y: 2025, m: 3, d: 1 });
    expect(inCommonYearAfter.date).toEqual({ y: 2026, m: 2, d: 28 });
    expect(inCommonYearAfter.clampedFromFeb29).toBe(true);
  });
});
