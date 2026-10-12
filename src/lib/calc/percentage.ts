/**
 * Percentage calculator — four independent modes. Every mode returns either a
 * value plus the substituted working, or field-level errors; nothing returns
 * `NaN` or `Infinity` silently.
 */

import { formatNumber, parseNumber } from "./number";

export type PercentMode = "percent-of" | "what-percent" | "change" | "whole";

export type PercentFailure = {
  ok: false;
  /** Message for the result area. */
  error: string;
  /** Message for the first input, when the problem sits in that field. */
  first?: string;
  /** Message for the second input, when the problem sits in that field. */
  second?: string;
};

export type PercentSuccess = {
  ok: true;
  result: number;
  /** e.g. "20 ÷ 100 × 150" */
  substitution: string;
  /** Short plain-English sentence describing the answer. */
  summary: string;
  /** Only meaningful for the increase/decrease mode. */
  direction?: "increase" | "decrease" | "none";
};

export type PercentOutcome = PercentSuccess | PercentFailure;

export const PERCENT_MODES: { id: PercentMode; label: string; question: string }[] = [
  { id: "percent-of", label: "X% of a number", question: "What is X% of a number?" },
  { id: "what-percent", label: "A as a % of B", question: "What percentage is A of B?" },
  { id: "change", label: "Increase / decrease", question: "What is the percentage change from A to B?" },
  { id: "whole", label: "Find the whole", question: "R is P% of what number?" },
];

export function percentOf(percentInput: string, valueInput: string): PercentOutcome {
  const percent = parseNumber(percentInput, "percentage");
  const value = parseNumber(valueInput, "number");
  if (!percent.ok || !value.ok) {
    return {
      ok: false,
      error: "Check the highlighted field to see the answer.",
      first: percent.ok ? undefined : percent.error,
      second: value.ok ? undefined : value.error,
    };
  }
  const result = (percent.value / 100) * value.value;
  return {
    ok: true,
    result,
    substitution: `(${formatNumber(percent.value)} ÷ 100) × ${formatNumber(value.value)}`,
    summary: `${formatNumber(percent.value)}% of ${formatNumber(value.value)} is ${formatNumber(result)}.`,
  };
}

export function whatPercent(firstInput: string, secondInput: string): PercentOutcome {
  const first = parseNumber(firstInput, "first value");
  const second = parseNumber(secondInput, "second value");
  if (!first.ok || !second.ok) {
    return {
      ok: false,
      error: "Check the highlighted field to see the answer.",
      first: first.ok ? undefined : first.error,
      second: second.ok ? undefined : second.error,
    };
  }
  if (second.value === 0) {
    return {
      ok: false,
      error: "Dividing by zero is undefined, so a part cannot be expressed as a percentage of zero.",
      second: "This value must not be 0 — dividing by zero has no answer.",
    };
  }
  const result = (first.value / second.value) * 100;
  return {
    ok: true,
    result,
    substitution: `(${formatNumber(first.value)} ÷ ${formatNumber(second.value)}) × 100`,
    summary: `${formatNumber(first.value)} is ${formatNumber(result)}% of ${formatNumber(second.value)}.`,
  };
}

export function percentChange(fromInput: string, toInput: string): PercentOutcome {
  const from = parseNumber(fromInput, "starting value");
  const to = parseNumber(toInput, "ending value");
  if (!from.ok || !to.ok) {
    return {
      ok: false,
      error: "Check the highlighted field to see the answer.",
      first: from.ok ? undefined : from.error,
      second: to.ok ? undefined : to.error,
    };
  }
  if (from.value === 0) {
    return {
      ok: false,
      error:
        "The percentage change from 0 cannot be calculated — the formula divides by the starting value, and a change of any size compared with zero has no percentage.",
      first: "The starting value must not be 0 — percentage change divides by it.",
    };
  }
  const result = ((to.value - from.value) / from.value) * 100;
  const direction = result > 0 ? "increase" : result < 0 ? "decrease" : "none";
  const summary =
    direction === "none"
      ? `There is no change: ${formatNumber(from.value)} to ${formatNumber(to.value)} is 0%.`
      : `${formatNumber(from.value)} to ${formatNumber(to.value)} is a ${formatNumber(Math.abs(result))}% ${
          direction === "increase" ? "increase" : "decrease"
        }.`;
  return {
    ok: true,
    result,
    substitution: `((${formatNumber(to.value)} − ${formatNumber(from.value)}) ÷ ${formatNumber(from.value)}) × 100`,
    summary:
      direction === "decrease"
        ? `${summary} A negative percentage change always means a decrease.`
        : summary,
    direction,
  };
}

export function findWhole(partInput: string, percentInput: string): PercentOutcome {
  const part = parseNumber(partInput, "part value");
  const percent = parseNumber(percentInput, "percentage");
  if (!part.ok || !percent.ok) {
    return {
      ok: false,
      error: "Check the highlighted field to see the answer.",
      first: part.ok ? undefined : part.error,
      second: percent.ok ? undefined : percent.error,
    };
  }
  if (percent.value === 0) {
    return {
      ok: false,
      error:
        "A part can never be 0% of a whole, so the whole cannot be found. Enter a percentage other than 0.",
      second: "The percentage must not be 0 — 0 cannot describe a part of a whole.",
    };
  }
  const result = (part.value * 100) / percent.value;
  return {
    ok: true,
    result,
    substitution: `(${formatNumber(part.value)} × 100) ÷ ${formatNumber(percent.value)}`,
    summary: `${formatNumber(part.value)} is ${formatNumber(percent.value)}% of ${formatNumber(result)}.`,
  };
}

export function computePercentage(mode: PercentMode, first: string, second: string): PercentOutcome {
  switch (mode) {
    case "percent-of":
      return percentOf(first, second);
    case "what-percent":
      return whatPercent(first, second);
    case "change":
      return percentChange(first, second);
    case "whole":
      return findWhole(first, second);
  }
}

/** Labels for the two inputs of each mode, so the UI stays declarative. */
export const MODE_FIELDS: Record<PercentMode, { first: string; second: string; formula: string }> = {
  "percent-of": {
    first: "Percentage (%)",
    second: "Number",
    formula: "(X ÷ 100) × Number",
  },
  "what-percent": {
    first: "Part (A)",
    second: "Whole (B)",
    formula: "(A ÷ B) × 100",
  },
  change: {
    first: "Starting value (A)",
    second: "Ending value (B)",
    formula: "((B − A) ÷ A) × 100",
  },
  whole: {
    first: "Part value (R)",
    second: "Percentage (P%)",
    formula: "(R × 100) ÷ P",
  },
};
