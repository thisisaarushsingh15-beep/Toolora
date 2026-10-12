import { describe, expect, test } from "bun:test";
import { computePercentage, findWhole, percentChange, percentOf, whatPercent } from "./percentage";
import { formatNumber, parseNumber } from "./number";

describe("parseNumber", () => {
  test("accepts whole numbers, decimals, signs and separators", () => {
    expect(parseNumber("42")).toEqual({ ok: true, value: 42 });
    expect(parseNumber("-7.5")).toEqual({ ok: true, value: -7.5 });
    expect(parseNumber(".5")).toEqual({ ok: true, value: 0.5 });
    expect(parseNumber("1,250.75")).toEqual({ ok: true, value: 1250.75 });
    expect(parseNumber("  12  ")).toEqual({ ok: true, value: 12 });
    expect(parseNumber("+3")).toEqual({ ok: true, value: 3 });
  });

  test("rejects empty and non-numeric input with a message", () => {
    expect(parseNumber("").ok).toBe(false);
    expect(parseNumber("   ").ok).toBe(false);
    expect(parseNumber("abc").ok).toBe(false);
    expect(parseNumber("12abc").ok).toBe(false);
    expect(parseNumber("1.2.3").ok).toBe(false);
    expect(parseNumber("1e5").ok).toBe(false);
    const failure = parseNumber("abc", "percentage");
    expect(failure.ok).toBe(false);
    if (!failure.ok) expect(failure.error).toContain("percentage");
  });
});

describe("formatNumber", () => {
  test("rounds to four decimals and trims trailing zeros", () => {
    expect(formatNumber(33.333333)).toBe("33.3333");
    expect(formatNumber(12.5)).toBe("12.5");
    expect(formatNumber(100)).toBe("100");
    expect(formatNumber(0.1 + 0.2)).toBe("0.3");
    expect(formatNumber(-0.00001)).toBe("0");
    expect(formatNumber(1234.56789, 2)).toBe("1234.57");
  });

  test("never prints NaN or Infinity", () => {
    expect(formatNumber(Number.NaN)).toBe("—");
    expect(formatNumber(Number.POSITIVE_INFINITY)).toBe("—");
  });
});

describe("mode a — X% of a number", () => {
  test("computes the normal case and shows the substituted working", () => {
    const out = percentOf("20", "150");
    expect(out.ok).toBe(true);
    if (out.ok) {
      expect(out.result).toBe(30);
      expect(out.substitution).toBe("(20 ÷ 100) × 150");
      expect(out.summary).toContain("30");
    }
  });

  test("boundary cases: 0%, 100%, negative percentage and decimals", () => {
    const zero = percentOf("0", "999");
    const all = percentOf("100", "42");
    const negative = percentOf("-25", "80");
    const decimal = percentOf("7.5", "200");
    expect(zero.ok && zero.result).toBe(0);
    expect(all.ok && all.result).toBe(42);
    expect(negative.ok && negative.result).toBe(-20);
    expect(decimal.ok && decimal.result).toBe(15);
  });

  test("reports each empty or invalid field separately", () => {
    const out = percentOf("", "10");
    expect(out.ok).toBe(false);
    if (!out.ok) {
      expect(out.first).toContain("Enter the percentage");
      expect(out.second).toBeUndefined();
    }
    const other = computePercentage("percent-of", "10", "abc");
    expect(other.ok).toBe(false);
    if (!other.ok) {
      expect(other.second).toContain("number");
      expect(other.first).toBeUndefined();
    }
  });
});

describe("mode b — what percentage is A of B", () => {
  test("computes a normal case", () => {
    const out = whatPercent("45", "300");
    expect(out.ok && out.result).toBe(15);
    if (out.ok) expect(out.substitution).toBe("(45 ÷ 300) × 100");
  });

  test("boundary cases: A = 0, A = B, A greater than B, negative B", () => {
    expect((whatPercent("0", "50") as { result: number }).result).toBe(0);
    expect((whatPercent("50", "50") as { result: number }).result).toBe(100);
    expect((whatPercent("150", "100") as { result: number }).result).toBe(150);
    expect((whatPercent("-20", "100") as { result: number }).result).toBe(-20);
  });

  test("B = 0 is an explicit division-by-zero error, never Infinity", () => {
    const out = whatPercent("5", "0");
    expect(out.ok).toBe(false);
    if (!out.ok) {
      expect(out.second).toContain("must not be 0");
      expect(out.error).toContain("Dividing by zero");
      expect(out.error).not.toContain("NaN");
      expect(out.error).not.toContain("Infinity");
    }
  });

  test("non-numeric input wins before the division check", () => {
    const out = whatPercent("abc", "0");
    expect(out.ok).toBe(false);
    if (!out.ok) expect(out.first).toContain("first value");
  });
});

describe("mode c — percentage increase and decrease", () => {
  test("increase, decrease and no change", () => {
    const up = percentChange("200", "250");
    expect(up.ok && up.result).toBe(25);
    if (up.ok) expect(up.direction).toBe("increase");

    const down = percentChange("200", "150");
    expect(down.ok && down.result).toBe(-25);
    if (down.ok) {
      expect(down.direction).toBe("decrease");
      expect(down.summary).toContain("decrease");
      expect(down.summary).toContain("negative percentage change");
    }

    const flat = percentChange("80", "80");
    expect(flat.ok && flat.result).toBe(0);
    if (flat.ok) expect(flat.direction).toBe("none");
  });

  test("negative and decimal values work in both directions", () => {
    const out = percentChange("-50", "-25");
    expect(out.ok && out.result).toBe(-50);
    const decimals = percentChange("2.5", "3.75");
    expect(decimals.ok && decimals.result).toBe(50);
  });

  test("starting from 0 is an explicit error", () => {
    const out = percentChange("0", "10");
    expect(out.ok).toBe(false);
    if (!out.ok) {
      expect(out.first).toContain("must not be 0");
      expect(out.error).toContain("cannot be calculated");
    }
  });
});

describe("mode d — R is P% of what?", () => {
  test("finds the whole", () => {
    const out = findWhole("30", "20");
    expect(out.ok && out.result).toBe(150);
    if (out.ok) expect(out.summary).toContain("150");
  });

  test("boundary cases: 100%, 200%, tiny percentage, negative part", () => {
    expect((findWhole("42", "100") as { result: number }).result).toBe(42);
    expect((findWhole("42", "200") as { result: number }).result).toBe(21);
    expect((findWhole("1", "0.5") as { result: number }).result).toBe(200);
    expect((findWhole("-15", "25") as { result: number }).result).toBe(-60);
  });

  test("P = 0 is an explicit error rather than Infinity", () => {
    const out = findWhole("10", "0");
    expect(out.ok).toBe(false);
    if (!out.ok) {
      expect(out.second).toContain("must not be 0");
      expect(out.error).toContain("cannot be found");
    }
  });

  test("rejects a non-numeric part", () => {
    const out = findWhole("ten", "20");
    expect(out.ok).toBe(false);
    if (!out.ok) expect(out.first).toContain("part value");
  });
});
