/**
 * Word, character, sentence and paragraph counting — pure string work.
 *
 * Documented conventions (also stated on the page):
 * - Words are whitespace-separated tokens that contain at least one letter or
 *   number. A lone dash, a row of dots or a stray "…" is punctuation, not a word;
 *   hyphenated words such as "well-being" count as one word.
 * - Characters are counted as Unicode code points, so "é", "漢" and a single
 *   emoji count as one each (composed emoji made of several code points count as
 *   more than one).
 * - Characters without spaces excludes every whitespace character.
 * - Sentences end at ".", "!" or "?" (and the ellipsis "…"); a run of terminators
 *   counts once, and a full stop surrounded by digits (3.5) does not end one.
 * - Paragraphs are separated by a blank line (or a line of only spaces).
 */

export const READING_WORDS_PER_MINUTE = 200;

export type TextStats = {
  words: number;
  characters: number;
  charactersWithoutSpaces: number;
  sentences: number;
  paragraphs: number;
  /** Estimated minutes as a decimal, e.g. 1.2 */
  readingMinutes: number;
  readingSeconds: number;
  readingLabel: string;
  /** True when the input has no countable characters at all. */
  isEmpty: boolean;
};

/** Counts Unicode code points rather than UTF-16 units. */
export function countCharacters(text: string): number {
  return Array.from(text).length;
}

const WORD_PATTERN = /[\p{L}\p{N}]/u;

export function splitWords(text: string): string[] {
  return text
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => token !== "" && WORD_PATTERN.test(token));
}

const SENTENCE_BOUNDARY = /[.!?\u2026]+(?=\s|$)/gu;

export function countSentences(text: string): number {
  const trimmed = text.trim();
  if (trimmed === "") return 0;
  const parts = trimmed.split(SENTENCE_BOUNDARY);
  let count = 0;
  for (const part of parts) {
    // A segment with no word characters is punctuation noise, not a sentence.
    if (splitWords(part).length > 0) count += 1;
  }
  return count;
}

export function splitParagraphs(text: string): string[] {
  return text
    .split(/\n[^\S\n]*\n+/)
    .map((block) => block.replace(/\s+$/, ""))
    .filter((block) => block.trim() !== "");
}

export function formatReadingTime(seconds: number): string {
  if (seconds <= 0) return "0 seconds";
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  const minutePart = minutes === 0 ? "" : `${minutes} minute${minutes === 1 ? "" : "s"}`;
  const secondPart = rest === 0 ? "" : `${rest} second${rest === 1 ? "" : "s"}`;
  return [minutePart, secondPart].filter(Boolean).join(" ") || "0 seconds";
}

export function textStats(text: string, wordsPerMinute = READING_WORDS_PER_MINUTE): TextStats {
  const words = splitWords(text).length;
  const characters = countCharacters(text);
  const charactersWithoutSpaces = countCharacters(text.replace(/\s/g, ""));
  const sentences = countSentences(text);
  const paragraphs = splitParagraphs(text).length;

  const speed = wordsPerMinute > 0 ? wordsPerMinute : READING_WORDS_PER_MINUTE;
  const exactMinutes = words / speed;
  const readingSeconds = Math.round(exactMinutes * 60);

  return {
    words,
    characters,
    charactersWithoutSpaces,
    sentences,
    paragraphs,
    readingMinutes: exactMinutes,
    readingSeconds,
    readingLabel: formatReadingTime(readingSeconds),
    isEmpty: characters === 0,
  };
}

/** A compact copyable summary of a stats block. */
export function statsToPlainText(stats: TextStats, wordsPerMinute = READING_WORDS_PER_MINUTE): string {
  return [
    `Words: ${stats.words}`,
    `Characters (with spaces): ${stats.characters}`,
    `Characters (without spaces): ${stats.charactersWithoutSpaces}`,
    `Sentences: ${stats.sentences}`,
    `Paragraphs: ${stats.paragraphs}`,
    `Reading time: ${stats.readingLabel} (at ${wordsPerMinute} words per minute)`,
  ].join("\n");
}
