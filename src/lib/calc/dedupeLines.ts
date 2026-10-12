/**
 * Duplicate line removal — pure string work, no DOM.
 *
 * Rules (the same wording is stated on the page):
 * - Lines are split on "\n", "\r\n" or a lone "\r". A trailing line break at the
 *   very end of the text is a terminator, not an extra empty line.
 * - The FIRST occurrence of a line is kept, in its original position, exactly as
 *   written. Later repeats are removed. Output order never changes.
 * - "Ignore leading/trailing whitespace" compares trimmed lines, so "  apple" and
 *   "apple" are the same line. The kept line is the first one as it was written,
 *   tabs included.
 * - "Ignore capitalisation" compares case-folded lines for latin text, so "Apple"
 *   and "apple" are the same line. The kept line keeps its original capitals.
 * - Blank lines are handled explicitly, see BlankLineMode.
 */

export type BlankLineMode = "keep" | "collapse" | "drop";

export type DedupeOptions = {
  /** Compare trimmed values, so "  x" and "x" match. */
  ignoreWhitespace: boolean;
  /** Compare case-insensitively, so "x" and "X" match. */
  ignoreCase: boolean;
  blankLines: BlankLineMode;
};

export const DEFAULT_DEDUPE_OPTIONS: DedupeOptions = {
  ignoreWhitespace: true,
  ignoreCase: false,
  blankLines: "keep",
};

export const BLANK_LINE_MODES: { id: BlankLineMode; label: string; description: string }[] = [
  {
    id: "keep",
    label: "Keep blank lines",
    description:
      "Empty lines are never treated as duplicates — every blank line you typed stays where it was.",
  },
  {
    id: "collapse",
    label: "Treat blank lines as duplicates",
    description:
      "All blank lines share one key, so only the first survives. A run of five empty lines becomes one.",
  },
  {
    id: "drop",
    label: "Drop all blank lines",
    description: "Empty lines are removed from the output entirely, whatever their position.",
  },
];

export type RemovedLine = { line: string; index: number; keptIndex: number };

export type DedupeResult = {
  text: string;
  originalCount: number;
  resultCount: number;
  removedCount: number;
  /** Each duplicate group: the kept line and how many copies of it were dropped. */
  groups: { key: string; line: string; count: number }[];
  /** The first few removed lines, for a short "what went" preview. */
  removedSamples: RemovedLine[];
};

const isBlank = (line: string): boolean => line.trim() === "";

/** Splits text into lines; a single trailing line break does not add a line. */
export function splitLines(text: string): string[] {
  if (text === "") return [];
  const normalised = text.replace(/\r\n?/g, "\n");
  const lines = normalised.split("\n");
  if (lines.length > 1 && lines[lines.length - 1] === "") lines.pop();
  return lines;
}

function compareKey(line: string, options: DedupeOptions): string {
  let key = line;
  if (options.ignoreWhitespace) key = key.trim();
  if (options.ignoreCase) key = key.toLowerCase();
  return key;
}

export function removeDuplicateLines(
  text: string,
  options: DedupeOptions = DEFAULT_DEDUPE_OPTIONS,
): DedupeResult {
  const lines = splitLines(text);
  const seen = new Map<string, number>();
  const kept: string[] = [];
  const groups = new Map<string, { key: string; line: string; count: number }>();
  const removedSamples: RemovedLine[] = [];

  lines.forEach((line, index) => {
    const blank = isBlank(line);

    if (blank && options.blankLines === "drop") {
      if (removedSamples.length < 10) removedSamples.push({ line, index, keptIndex: -1 });
      return;
    }

    // Blank lines under "keep" never collide with each other.
    const collides = blank && options.blankLines === "keep" ? `\u0000blank:${index}` : blank && options.blankLines === "collapse" ? "\u0000blank" : compareKey(line, options);

    const existing = seen.get(collides);
    if (existing !== undefined) {
      const group = groups.get(collides);
      if (group) group.count += 1;
      else groups.set(collides, { key: collides, line: kept[existing] ?? "", count: 1 });
      if (removedSamples.length < 10 && !(blank && options.blankLines === "keep")) {
        removedSamples.push({ line, index, keptIndex: existing });
      }
      return;
    }

    seen.set(collides, kept.length);
    kept.push(line);
  });

  const resultText = kept.join("\n");

  return {
    text: resultText,
    originalCount: lines.length,
    resultCount: kept.length,
    removedCount: lines.length - kept.length,
    groups: [...groups.values()].map((group) => ({
      key: group.key.startsWith("\u0000") ? "(blank line)" : group.key,
      line: group.line,
      count: group.count,
    })),
    removedSamples,
  };
}

export const CLEANED_FILE_NAME = "toolora-lines.txt";
