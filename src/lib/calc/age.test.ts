import { describe, expect, test } from "bun:test";
import { computeAge, describeAge } from "./age";

const today = { y: 2024, m: 10, d: 1 };

describe("computeAge — normal cases", () => {
  test("years, months and days with totals and the next birthday", () => {
    const out = computeAge("1990-03-15", "2024-10-01", today);
    expect(out.ok).toBe(true);
    if (out.ok) {
      expect(out.years).toBe(34);
      expect(out.months).toBe(6);
      expect(out.days).toBe(16);
      expect(out.totalDays).toBe(12619);
      expect(out.totalMonths).toBe(34 * 12 + 6);
      expect(out.totalWeeks).toBe(Math.floor(12619 / 7));
      expect(out.nextBirthday).toEqual({ y: 2025, m: 3, d: 15 });
      expect(out.daysUntilNextBirthday).toBe(165);
      expect(out.turning).toBe(35);
      expect(out.referenceIsToday).toBe(true);
      expect(out.referenceInFuture).toBe(false);
    }
  });

  test("an optional reference date other than today is labelled honestly", () => {
    const out = computeAge("2000-01-01", "2020-01-01", today);
    expect(out.ok).toBe(true);
    if (out.ok) {
      expect(out.years).toBe(20);
      expect(out.referenceIsToday).toBe(false);
      expect(out.referenceInFuture).toBe(false);
    }
  });

  test("a reference date in the future is flagged, not refused", () => {
    const out = computeAge("2000-01-01", "2030-01-01", today);
    expect(out.ok).toBe(true);
    if (out.ok) expect(out.referenceInFuture).toBe(true);
  });
});

describe("computeAge — leap-day birthdays", () => {
  test("29 February is observed on 28 February in a non-leap year", () => {
    const out = computeAge("2000-02-29", "2025-01-01", today);
    expect(out.ok).toBe(true);
    if (out.ok) {
      expect(out.bornOnLeapDay).toBe(true);
      expect(out.years).toBe(24);
      expect(out.nextBirthday).toEqual({ y: 2025, m: 2, d: 28 });
      expect(out.daysUntilNextBirthday).toBe(58);
      expect(out.turning).toBe(25);
      expect(out.observedOnFeb28).toBe(true);
    }
  });

  test("on 28 February 2025 a 29 Feb 2000 birth is 25 years old, on the birthday", () => {
    const out = computeAge("2000-02-29", "2025-02-28", today);
    expect(out.ok).toBe(true);
    if (out.ok) {
      expect(out.years).toBe(25);
      expect(out.months).toBe(0);
      expect(out.days).toBe(0);
      expect(out.isBirthdayToday).toBe(true);
      expect(out.observedOnFeb28).toBe(true);
    }
  });

  test("in a leap year the real 29 February is used", () => {
    const out = computeAge("2000-02-29", "2024-02-29", today);
    expect(out.ok).toBe(true);
    if (out.ok) {
      expect(out.years).toBe(24);
      expect(out.isBirthdayToday).toBe(true);
      expect(out.observedOnFeb28).toBe(false);
    }
  });
});

describe("computeAge — boundaries and invalid input", () => {
  test("newborn on the same day is 0 years, 0 months, 0 days", () => {
    const out = computeAge("2024-10-01", "2024-10-01", today);
    expect(out.ok).toBe(true);
    if (out.ok) {
      expect([out.years, out.months, out.days]).toEqual([0, 0, 0]);
      expect(out.totalDays).toBe(0);
      expect(out.isBirthdayToday).toBe(true);
    }
  });

  test("the day before the first birthday is 11 months and 28 days (2024 is a leap year)", () => {
    const out = computeAge("2023-03-15", "2024-03-14", null);
    expect(out.ok).toBe(true);
    if (out.ok) expect([out.years, out.months, out.days]).toEqual([0, 11, 28]);
  });

  test("a birth date after the reference date is an explicit error, never a negative age", () => {
    const out = computeAge("2030-01-01", "2020-01-01", today);
    expect(out.ok).toBe(false);
    if (!out.ok) {
      expect(out.error).toContain("cannot be negative");
      expect(out.birth).toContain("after the reference date");
      expect(out.error).not.toContain("NaN");
    }
  });

  test("empty and impossible dates are reported per field", () => {
    const emptyBirth = computeAge("", "2024-01-01", today);
    expect(emptyBirth.ok).toBe(false);
    if (!emptyBirth.ok) {
      expect(emptyBirth.birth).toContain("date of birth");
      expect(emptyBirth.reference).toBeUndefined();
    }

    const impossible = computeAge("1990-02-30", "2024-01-01", today);
    expect(impossible.ok).toBe(false);
    if (!impossible.ok) expect(impossible.birth).toContain("28 days");

    const badReference = computeAge("1990-01-01", "2023-02-29", today);
    expect(badReference.ok).toBe(false);
    if (!badReference.ok) {
      expect(badReference.reference).toContain("not a real date");
      expect(badReference.birth).toBeUndefined();
    }
  });
});

describe("describeAge", () => {
  test("summarises the result in words with correct plurals", () => {
    const out = computeAge("1990-03-15", "2024-10-01", today);
    expect(out.ok).toBe(true);
    if (out.ok) {
      expect(describeAge(out)).toBe("34 years, 6 months and 16 days on 1 October 2024.");
    }
    const oneDay = computeAge("2024-09-30", "2024-10-01", today);
    if (oneDay.ok) expect(describeAge(oneDay)).toContain("0 years, 0 months and 1 day");
  });
});
