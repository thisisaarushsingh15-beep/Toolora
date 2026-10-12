import { describe, expect, test } from "bun:test";
import { convert, formatNumber, getUnit, parseValueInput } from "./units";

const close = (actual: number, expected: number, tolerance = 1e-6) => {
  expect(Math.abs(actual - expected)).toBeLessThanOrEqual(tolerance);
};

describe("temperature uses offset formulas, not factors", () => {
  test("boiling point both ways", () => {
    close(convert(100, "c", "f", "temperature"), 212);
    close(convert(212, "f", "c", "temperature"), 100);
  });

  test("freezing point both ways", () => {
    close(convert(0, "c", "f", "temperature"), 32);
    close(convert(32, "f", "c", "temperature"), 0);
  });

  test("kelvin both ways", () => {
    close(convert(0, "c", "k", "temperature"), 273.15);
    close(convert(273.15, "k", "c", "temperature"), 0);
    close(convert(32, "f", "k", "temperature"), 273.15);
    close(convert(373.15, "k", "f", "temperature"), 212);
  });

  test("the famous crossover point", () => {
    close(convert(-40, "c", "f", "temperature"), -40);
    close(convert(-40, "f", "c", "temperature"), -40);
  });

  test("room temperature is not a multiplication by 1", () => {
    close(convert(37, "c", "f", "temperature"), 98.6, 1e-9);
    close(convert(98.6, "f", "c", "temperature"), 37, 1e-9);
  });
});

describe("exact factors for the other five categories", () => {
  test("length", () => {
    close(convert(1, "mi", "m", "length"), 1609.344);
    close(convert(1, "in", "cm", "length"), 2.54, 1e-12);
    close(convert(1, "nmi", "m", "length"), 1852);
    close(convert(1000, "m", "km", "length"), 1);
    close(convert(1, "ft", "in", "length"), 12, 1e-12);
  });

  test("mass", () => {
    close(convert(1, "kg", "lb", "mass"), 2.2046226218487757, 1e-12);
    close(convert(1, "lb", "g", "mass"), 453.59237, 1e-9);
    close(convert(1, "st", "lb", "mass"), 14, 1e-9);
    close(convert(1, "t", "kg", "mass"), 1000);
  });

  test("area", () => {
    close(convert(1, "acre", "m2", "area"), 4046.8564224);
    close(convert(1, "ha", "m2", "area"), 10000);
    close(convert(1, "ft2", "in2", "area"), 144, 1e-6);
    close(convert(1, "mi2", "acre", "area"), 640, 1e-6);
  });

  test("volume", () => {
    close(convert(1, "gal", "l", "volume"), 3.785411784);
    close(convert(1, "galuk", "l", "volume"), 4.54609);
    close(convert(1, "cup", "tbsp", "volume"), 16, 1e-9);
    close(convert(1, "l", "ml", "volume"), 1000);
  });

  test("speed", () => {
    close(convert(100, "kmh", "mph", "speed"), 62.13711922373339, 1e-9);
    close(convert(1, "knot", "kmh", "speed"), 1.852, 1e-9);
    close(convert(1, "ms", "kmh", "speed"), 3.6, 1e-9);
    close(convert(60, "mph", "fts", "speed"), 88, 1e-9);
  });

  test("a unit converted to itself is unchanged", () => {
    close(convert(42.5, "kg", "kg", "mass"), 42.5);
  });
});

describe("validation", () => {
  test("empty input is not an error, it is nothing typed", () => {
    expect(parseValueInput("   ", "length")).toEqual({ value: null, error: null });
  });

  test("text is rejected with a message", () => {
    const parsed = parseValueInput("twelve", "length");
    expect(parsed.value).toBeNull();
    expect(parsed.error).toContain("Enter a number");
  });

  test("negatives are allowed for temperature but not for length", () => {
    expect(parseValueInput("-40", "temperature").value).toBe(-40);
    expect(parseValueInput("-5", "length").error).toBeTruthy();
  });

  test("thousands separators and decimals are accepted", () => {
    expect(parseValueInput("1,609.344", "length").value).toBe(1609.344);
    expect(parseValueInput(".5", "length").value).toBe(0.5);
  });
});

describe("formatting", () => {
  test("rounds to ten significant digits without scientific noise", () => {
    expect(formatNumber(2.2046226218487757)).toBe("2.204622622");
    expect(formatNumber(1609.344)).toBe("1609.344");
    expect(formatNumber(1 / 3)).toBe("0.3333333333");
  });

  test("small values survive instead of being rounded away", () => {
    expect(formatNumber(0.0000001234)).toBe("0.0000001234");
    expect(formatNumber(0)).toBe("0");
  });

  test("symbols are attached to results", () => {
    expect(getUnit("length", "mi").symbol).toBe("mi");
  });
});
