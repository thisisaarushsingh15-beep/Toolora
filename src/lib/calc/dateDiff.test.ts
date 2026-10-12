import { describe, expect, test } from "bun:test";
import { dateDifference, swapPair } from "./dateDiff";

describe("dateDifference — normal cases", () => {
  test("27 days exclusive, 28 inclusive, with the end date named in words", () => {
    const exclusive = dateDifference("2024-01-01", "2024-01-28", false);
    expect(exclusive.ok).toBe(true);
    if (exclusive.ok) {
      expect(exclusive.totalDays).toBe(27);
      expect(exclusive.note).toContain("27 days");
      expect(exclusive.note).toContain("is not included");
      expect(exclusive.inclusive).toBe(false);
      expect(exclusive.weeks).toBe(3);
      expect(exclusive.leftoverDays).toBe(6);
      expect([exclusive.years, exclusive.months, exclusive.days]).toEqual([0, 0, 27]);
    }

    const inclusive = dateDifference("2024-01-01", "2024-01-28", true);
    expect(inclusive.ok).toBe(true);
    if (inclusive.ok) {
      expect(inclusive.totalDays).toBe(28);
      expect(inclusive.note).toContain("28 days");
      expect(inclusive.note).toContain("is included");
      expect([inclusive.years, inclusive.months, inclusive.days]).toEqual([0, 0, 28]);
    }
  });

  test("leap years are counted correctly", () => {
    const acrossLeapDay = dateDifference("2024-02-28", "2024-03-01", false);
    expect(acrossLeapDay.ok && acrossLeapDay.totalDays).toBe(2);

    const commonYear = dateDifference("2023-02-28", "2023-03-01", false);
    expect(commonYear.ok && commonYear.totalDays).toBe(1);

    const wholeLeapYear = dateDifference("2024-01-01", "2025-01-01", false);
    expect(wholeLeapYear.ok && wholeLeapYear.totalDays).toBe(366);

    const wholeCommonYear = dateDifference("2023-01-01", "2024-01-01", false);
    expect(wholeCommonYear.ok && wholeCommonYear.totalDays).toBe(365);
  });

  test("month-end start dates stay calendar-correct", () => {
    const out = dateDifference("2023-01-31", "2023-03-01", false);
    expect(out.ok).toBe(true);
    if (out.ok) {
      expect([out.years, out.months, out.days]).toEqual([0, 1, 1]);
      expect(out.totalDays).toBe(29);
    }

    const long = dateDifference("2019-11-30", "2024-03-01", false);
    expect(long.ok).toBe(true);
    if (long.ok) expect([long.years, long.months, long.days]).toEqual([4, 3, 1]);
  });

  test("the same date is zero days exclusive and one day inclusive", () => {
    const exclusive = dateDifference("2024-06-01", "2024-06-01", false);
    expect(exclusive.ok).toBe(true);
    if (exclusive.ok) {
      expect(exclusive.totalDays).toBe(0);
      expect(exclusive.sameDay).toBe(true);
      expect(exclusive.swapped).toBe(false);
    }
    const inclusive = dateDifference("2024-06-01", "2024-06-01", true);
    expect(inclusive.ok && inclusive.totalDays).toBe(1);
  });
});

describe("dateDifference — reversed ranges", () => {
  test("reversed dates give the absolute difference and are flagged", () => {
    const out = dateDifference("2024-03-10", "2024-03-01", false);
    expect(out.ok).toBe(true);
    if (out.ok) {
      expect(out.swapped).toBe(true);
      expect(out.totalDays).toBe(9);
      expect(out.from).toEqual({ y: 2024, m: 3, d: 1 });
      expect(out.to).toEqual({ y: 2024, m: 3, d: 10 });
      expect(out.note).toContain("10 March 2024");
    }
  });

  test("swapPair makes the one-click fix trivial", () => {
    expect(swapPair("2024-03-10", "2024-03-01")).toEqual({
      start: "2024-03-01",
      end: "2024-03-10",
    });
  });
});

describe("dateDifference — invalid input", () => {
  test("empty fields are reported per input", () => {
    const out = dateDifference("", "2024-01-01", false);
    expect(out.ok).toBe(false);
    if (!out.ok) {
      expect(out.start).toContain("start date");
      expect(out.end).toBeUndefined();
      expect(out.error).toContain("highlighted date");
    }
  });

  test("impossible dates are rejected per input", () => {
    const out = dateDifference("2024-01-01", "2023-02-29", false);
    expect(out.ok).toBe(false);
    if (!out.ok) {
      expect(out.end).toContain("not a real date");
      expect(out.start).toBeUndefined();
    }
  });

  test("non-date text is rejected", () => {
    const out = dateDifference("tomorrow", "2024-01-01", false);
    expect(out.ok).toBe(false);
    if (!out.ok) expect(out.start).toContain("YYYY-MM-DD");
  });
});
