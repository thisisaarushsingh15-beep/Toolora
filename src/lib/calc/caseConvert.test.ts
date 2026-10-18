import { describe, expect, test } from "bun:test";
import {
  CASE_MODES,
  convertCase,
  toAlternatingCase,
  toSentenceCase,
  toTitleCase,
} from "./caseConvert";

describe("uppercase / lowercase", () => {
  test("changes every letter and leaves spacing alone", () => {
    expect(convertCase("Hello, world!\n  indent", "upper")).toBe("HELLO, WORLD!\n  INDENT");
    expect(convertCase("Hello, WORLD!\n  Indent", "lower")).toBe("hello, world!\n  indent");
  });

  test("round trip returns the original lowercase text", () => {
    const original = "café naïve\nsecond line\t!";
    const lowered = convertCase(original, "lower");
    expect(convertCase(convertCase(lowered, "upper"), "lower")).toBe(lowered);
  });
});

describe("title case", () => {
  test("capitalises every space-separated word and lowercases the rest", () => {
    expect(toTitleCase("hELLO wORLD")).toBe("Hello World");
  });

  test("hyphens split words, apostrophes do not", () => {
    expect(toTitleCase("well-being and don't stop")).toBe("Well-Being And Don't Stop");
    expect(toTitleCase("o'brien's book")).toBe("O'brien's Book");
  });

  test("keeps leading punctuation with the word and preserves line breaks", () => {
    expect(toTitleCase('"the end"\n(again)')).toBe('"The End"\n(Again)');
  });

  test("leaves tokens with no letters exactly as typed", () => {
    expect(toTitleCase("123 -- 4.5 km")).toBe("123 -- 4.5 Km");
  });
});

describe("sentence case", () => {
  test("capitalises after . ! ? and …", () => {
    expect(toSentenceCase("HELLO THERE. how ARE you? fine! thanks… ok")).toBe(
      "Hello there. How are you? Fine! Thanks… Ok",
    );
  });

  test("capitalises the start of every line", () => {
    expect(toSentenceCase("first line\nsecond line")).toBe("First line\nSecond line");
  });

  test("a quote before the first letter does not swallow the capital", () => {
    expect(toSentenceCase('he said "hello" to me. "bye"')).toBe('He said "hello" to me. "Bye"');
  });

  test("does not preserve proper nouns — everything else is lowercased", () => {
    expect(toSentenceCase("i went to Paris")).toBe("I went to paris");
  });
});

describe("alternating case", () => {
  test("alternates by letter starting uppercase", () => {
    expect(toAlternatingCase("abcd")).toBe("AbCd");
  });

  test("skips whitespace, digits and punctuation without consuming a slot", () => {
    expect(toAlternatingCase("ab cd")).toBe("Ab Cd");
    expect(toAlternatingCase("a-b")).toBe("A-b");
    expect(toAlternatingCase("a1b")).toBe("A1b");
  });

  test("continues the alternation across line breaks", () => {
    expect(toAlternatingCase("ab\ncd")).toBe("Ab\nCd");
  });
});

describe("mode list", () => {
  test("exposes exactly the five documented modes", () => {
    expect(CASE_MODES.map((mode) => mode.id)).toEqual([
      "upper",
      "lower",
      "title",
      "sentence",
      "alternating",
    ]);
    expect(CASE_MODES.every((mode) => mode.description.length > 10)).toBe(true);
  });
});

describe("empty input", () => {
  test("every mode returns an empty string", () => {
    for (const mode of CASE_MODES) {
      expect(convertCase("", mode.id)).toBe("");
    }
  });
});
