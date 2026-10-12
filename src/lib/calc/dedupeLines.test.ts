import { describe, expect, test } from "bun:test";
import {
  BLANK_LINE_MODES,
  DEFAULT_DEDUPE_OPTIONS,
  removeDuplicateLines,
  splitLines,
  type DedupeOptions,
} from "./dedupeLines";

const options = (partial: Partial<DedupeOptions> = {}): DedupeOptions => ({
  ...DEFAULT_DEDUPE_OPTIONS,
  ...partial,
});

describe("splitLines", () => {
  test("handles LF, CRLF and CR", () => {
    expect(splitLines("a\nb")).toEqual(["a", "b"]);
    expect(splitLines("a\r\nb")).toEqual(["a", "b"]);
    expect(splitLines("a\rb")).toEqual(["a", "b"]);
  });

  test("a trailing line break is a terminator, not an extra line", () => {
    expect(splitLines("a\nb\n")).toEqual(["a", "b"]);
    expect(splitLines("")).toEqual([]);
  });
});

describe("basic de-duplication", () => {
  test("keeps the first occurrence and its order", () => {
    const result = removeDuplicateLines("b\na\nb\nc\na", options());
    expect(result.text).toBe("b\na\nc");
    expect(result.originalCount).toBe(5);
    expect(result.resultCount).toBe(3);
    expect(result.removedCount).toBe(2);
  });

  test("no duplicates leaves the text untouched", () => {
    const result = removeDuplicateLines("one\ntwo\nthree", options());
    expect(result.text).toBe("one\ntwo\nthree");
    expect(result.removedCount).toBe(0);
    expect(result.groups).toEqual([]);
  });

  test("lines differing only by case collapse when case is ignored", () => {
    const strict = removeDuplicateLines("Apple\napple", options({ ignoreCase: false }));
    expect(strict.text).toBe("Apple\napple");
    const loose = removeDuplicateLines("Apple\napple", options({ ignoreCase: true }));
    expect(loose.text).toBe("Apple");
    expect(loose.removedCount).toBe(1);
  });

  test("lines differing only by surrounding whitespace collapse when whitespace is ignored", () => {
    const strict = removeDuplicateLines("  apple\napple  ", options({ ignoreWhitespace: false }));
    expect(strict.text).toBe("  apple\napple  ");
    const loose = removeDuplicateLines("  apple\napple  ", options({ ignoreWhitespace: true }));
    expect(loose.text).toBe("  apple");
  });

  test("the kept line keeps the whitespace and capitals it was written with", () => {
    const result = removeDuplicateLines("\tApple  \n  apple", options({ ignoreCase: true }));
    expect(result.text).toBe("\tApple  ");
  });

  test("records how many copies of each kept line were dropped", () => {
    const result = removeDuplicateLines("a\nb\na\na", options());
    expect(result.groups).toEqual([{ key: "a", line: "a", count: 2 }]);
    expect(result.removedSamples[0]?.keptIndex).toBe(0);
  });
});

describe("blank line handling", () => {
  const text = "first\n\n\nsecond\n";

  test("keep — every blank line stays", () => {
    const result = removeDuplicateLines(text, options({ blankLines: "keep" }));
    expect(result.text).toBe("first\n\n\nsecond");
    expect(result.removedCount).toBe(0);
  });

  test("collapse — one blank line survives", () => {
    const result = removeDuplicateLines(text, options({ blankLines: "collapse" }));
    expect(result.text).toBe("first\n\nsecond");
    expect(result.removedCount).toBe(1);
  });

  test("drop — no blank lines at all", () => {
    const result = removeDuplicateLines(text, options({ blankLines: "drop" }));
    expect(result.text).toBe("first\nsecond");
    expect(result.removedCount).toBe(2);
  });

  test("collapse treats a whitespace-only line as blank too", () => {
    const result = removeDuplicateLines("a\n   \n\t\nb", options({ blankLines: "collapse" }));
    expect(result.text).toBe("a\n   \nb");
  });
});

describe("edge cases", () => {
  test("empty input gives zeros and no throw", () => {
    const result = removeDuplicateLines("", options());
    expect(result).toMatchObject({ text: "", originalCount: 0, resultCount: 0, removedCount: 0 });
  });

  test("all lines identical keeps exactly one", () => {
    const result = removeDuplicateLines("x\nx\nx\nx", options());
    expect(result.text).toBe("x");
    expect(result.resultCount).toBe(1);
    expect(result.removedCount).toBe(3);
  });

  test("unicode lines compare as written", () => {
    const result = removeDuplicateLines("café\nCafé\n漢字\n漢字", options({ ignoreCase: true }));
    expect(result.text).toBe("café\n漢字");
  });

  test("mode list covers the three documented behaviours", () => {
    expect(BLANK_LINE_MODES.map((mode) => mode.id)).toEqual(["keep", "collapse", "drop"]);
  });
});
