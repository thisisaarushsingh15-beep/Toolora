import { describe, expect, test } from "bun:test";
import {
  READING_WORDS_PER_MINUTE,
  countCharacters,
  countSentences,
  formatReadingTime,
  splitParagraphs,
  splitWords,
  statsToPlainText,
  textStats,
} from "./textStats";

describe("textStats — empty and whitespace input", () => {
  test("empty text counts zero of everything", () => {
    const stats = textStats("");
    expect(stats.words).toBe(0);
    expect(stats.characters).toBe(0);
    expect(stats.charactersWithoutSpaces).toBe(0);
    expect(stats.sentences).toBe(0);
    expect(stats.paragraphs).toBe(0);
    expect(stats.readingLabel).toBe("0 seconds");
    expect(stats.isEmpty).toBe(true);
  });

  test("whitespace-only text counts zero words and zero sentences", () => {
    for (const input of ["   ", "\n\n\n", "\t \t", " \n \n "]) {
      const stats = textStats(input);
      expect(stats.words).toBe(0);
      expect(stats.sentences).toBe(0);
      expect(stats.paragraphs).toBe(0);
      expect(stats.charactersWithoutSpaces).toBe(0);
      expect(stats.isEmpty).toBe(false);
    }
  });
});

describe("textStats — words and characters", () => {
  test("counts whitespace-separated words and both character totals", () => {
    const stats = textStats("Hello world");
    expect(stats.words).toBe(2);
    expect(stats.characters).toBe(11);
    expect(stats.charactersWithoutSpaces).toBe(10);
    expect(stats.sentences).toBe(1);
    expect(stats.paragraphs).toBe(1);
  });

  test("punctuation-only tokens are not words; hyphenated words are one word", () => {
    expect(splitWords("hello — world")).toEqual(["hello", "world"]);
    expect(splitWords("... - – !!!")).toEqual([]);
    expect(splitWords("well-being is a state-of-the-art term")).toHaveLength(5);
    expect(splitWords("3.5 kg = 3500 g")).toEqual(["3.5", "kg", "3500", "g"]); // "=" is punctuation, not a word
  });

  test("extra spaces, tabs and newlines collapse sensibly", () => {
    const stats = textStats("one   two\tthree\nfour");
    expect(stats.words).toBe(4);
  });

  test("accents, CJK and emoji are counted as code points", () => {
    expect(countCharacters("café")).toBe(4);
    expect(countCharacters("你好世界")).toBe(4);
    expect(textStats("a😀b").characters).toBe(3);
    expect(textStats("👍🏽 ok").characters).toBe(5); // thumb + skin tone + space + ok
    expect(textStats("你好世界").words).toBe(1); // no spaces to split on
    expect(textStats("café crème").words).toBe(2);
  });
});

describe("textStats — sentences and paragraphs", () => {
  test("detects . ! ? boundaries and ignores runs and numeric dots", () => {
    expect(countSentences("One. Two! Three?")).toBe(3);
    expect(countSentences("Wait... what now?")).toBe(2);
    expect(countSentences("Excellent!!! Really.")).toBe(2);
    expect(countSentences("Pi is 3.14 exactly.")).toBe(1);
    expect(countSentences("No terminator here")).toBe(1);
    expect(countSentences("...")).toBe(0);
  });

  test("paragraphs are split on blank lines only", () => {
    expect(splitParagraphs("One line\nstill same paragraph")).toHaveLength(1);
    expect(splitParagraphs("First para\n\nSecond para")).toHaveLength(2);
    expect(splitParagraphs("First\n   \nSecond\n\n\nThird")).toHaveLength(3);
    expect(splitParagraphs("\n\n\n")).toHaveLength(0);
  });

  test("multiline text is counted as a whole", () => {
    const text = "First sentence here.\n\nSecond paragraph, second sentence. And a third one!";
    const stats = textStats(text);
    expect(stats.paragraphs).toBe(2);
    expect(stats.sentences).toBe(3);
    expect(stats.words).toBe(11);
  });
});

describe("textStats — reading time", () => {
  test("uses 200 words per minute and states it", () => {
    const stats = textStats(Array.from({ length: 240 }, () => "word").join(" "));
    expect(stats.words).toBe(240);
    expect(stats.readingSeconds).toBe(72);
    expect(stats.readingLabel).toBe("1 minute 12 seconds");
    expect(stats.readingMinutes).toBeCloseTo(1.2, 5);
    expect(READING_WORDS_PER_MINUTE).toBe(200);
  });

  test("formats short, plural and exact cases", () => {
    expect(formatReadingTime(0)).toBe("0 seconds");
    expect(formatReadingTime(45)).toBe("45 seconds");
    expect(formatReadingTime(60)).toBe("1 minute");
    expect(formatReadingTime(120)).toBe("2 minutes");
    expect(formatReadingTime(121)).toBe("2 minutes 1 second");
  });

  test("a custom reading speed is respected and never divides by zero", () => {
    expect(textStats("one two three four", 60).readingMinutes).toBeCloseTo(4 / 60, 6);
    expect(Number.isFinite(textStats("one two", 0).readingMinutes)).toBe(true);
  });

  test("the copyable summary lists every statistic", () => {
    const summary = statsToPlainText(textStats("Hello world. Bye now!"), 200);
    expect(summary).toContain("Words: 4");
    expect(summary).toContain("Characters (with spaces): 21");
    expect(summary).toContain("Sentences: 2");
    expect(summary).toContain("200 words per minute");
  });
});
