/** Shared parsing and display helpers for every calculator (pure, no DOM). */

export type ParseNumberResult =
  | { ok: true; value: number }
  | { ok: false; error: string };

const NUMBER_PATTERN = /^[+-]?(\d+(\.\d*)?|\.\d+)$/;

/**
 * Parses a user-typed number. Accepts a leading sign, a decimal point, and
 * thousands separators; rejects blanks, words and non-finite values with a
 * message the UI can show next to the input.
 */
export function parseNumber(raw: string, label = "value"): ParseNumberResult {
  const trimmed = raw.trim();
  if (trimmed === "") return { ok: false, error: `Enter the ${label}.` };

  const normalised = trimmed.replace(/,/g, "").replace(/^\u2212/, "-").replace(/\s/g, "");
  if (!NUMBER_PATTERN.test(normalised)) {
    return {
      ok: false,
      error: `Enter ${label === "value" ? "a number" : `the ${label} as a number`} — digits only, with at most one decimal point and an optional minus sign.`,
    };
  }
  const value = Number(normalised);
  if (!Number.isFinite(value)) {
    return { ok: false, error: `The ${label} must be a finite number.` };
  }
  return { ok: true, value };
}

/** Rounds to `maxDecimals`, drops trailing zeros — 33.3333, 12.5, 100. */
export function formatNumber(value: number, maxDecimals = 4): string {
  if (!Number.isFinite(value)) return "—";
  if (Math.abs(value) >= 1e15) return String(value);
  const rounded = Number(value.toFixed(maxDecimals));
  let text = rounded.toFixed(maxDecimals);
  if (text.includes(".")) text = text.replace(/0+$/, "").replace(/\.$/, "");
  return text === "-0" ? "0" : text;
}

/** Groups thousands for readability inside labelled result cards. */
export function formatCount(value: number): string {
  if (!Number.isFinite(value)) return "—";
  return value.toLocaleString("en-US");
}

export function pluralise(count: number, singular: string, plural = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : plural}`;
}
