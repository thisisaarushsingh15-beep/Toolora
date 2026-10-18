/**
 * Text case conversion — pure string work, no DOM.
 *
 * Documented rules (the same wording is shown on the page):
 *
 * UPPERCASE / lowercase
 *   A direct, character-for-character change. Line breaks, punctuation and
 *   spacing are untouched.
 *
 * Title Case
 *   Every whitespace-separated word gets a capital first letter and the rest of
 *   its letters lowercased — so "hELLO wORLD" becomes "Hello World".
 *   Hyphens split words too: "well-being" → "Well-Being".
 *   Apostrophes do not split words: "don't" → "Don't", "o'brien's" → "O'brien's"
 *   (only the first letter of the word is capitalised).
 *   Leading punctuation carries over with the word: '"the end"' → '"The End"'.
 *   A word with no letters at all (e.g. "--" or "123") is left exactly as typed.
 *
 * Sentence case
 *   Everything lowercased, then the first letter of each sentence, of each line
 *   and of the text as a whole is capitalised. A sentence ends at ".", "!", "?"
 *   or "…" followed by a space or the end of a line. Letters inside words are
 *   otherwise left lowercased, so proper nouns are not preserved — that is what
 *   sentence case means.
 *
 * Alternating case
 *   Applies to letters only and alternates BY LETTER, starting with an uppercase
 *   letter. Whitespace, digits, punctuation and emoji are passed through
 *   unchanged and are NOT counted in the alternation, so "ab cd" → "Ab Cd" and
 *   "a-b" → "A-b" keeps the same rhythm as though the punctuation were absent.
 *   The alternation continues across line breaks.
 */

export type CaseMode = "upper" | "lower" | "title" | "sentence" | "alternating";

export type CaseModeInfo = {
  id: CaseMode;
  label: string;
  /** Short rule shown under the button. */
  description: string;
};

export const CASE_MODES: CaseModeInfo[] = [
  {
    id: "upper",
    label: "UPPERCASE",
    description: "Every letter capitalised. Line breaks and punctuation untouched.",
  },
  {
    id: "lower",
    label: "lowercase",
    description: "Every letter lowercased. Line breaks and punctuation untouched.",
  },
  {
    id: "title",
    label: "Title Case",
    description: "First letter of every word capitalised. Hyphens split words, apostrophes do not.",
  },
  {
    id: "sentence",
    label: "Sentence case",
    description: "First letter capitalised after the start, a line break, or . ! ? …",
  },
  {
    id: "alternating",
    label: "aLtErNaTiNg cAsE",
    description: "Alternates by letter, starting uppercase. Whitespace and punctuation are skipped.",
  },
];

const WORD_START = /[\p{L}]/u;
const WORD_OR_DIGIT = /[\p{L}\p{N}]/u;
const SENTENCE_END = /[.!?\u2026]/;

/** Title case: capitalise the first letter of each hyphen- or space-separated word. */
export function toTitleCase(text: string): string {
  return text
    .split(/(\s+)/)
    .map((chunk) => {
      if (chunk === "" || /^\s+$/.test(chunk)) return chunk;
      // Hyphens split words; apostrophes stay inside the word.
      return chunk
        .split(/([-\u2010\u2011])/)
        .map((part) => capitaliseFirstLetter(part))
        .join("");
    })
    .join("");
}

function capitaliseFirstLetter(part: string): string {
  if (part === "") return part;
  const characters = Array.from(part);
  const index = characters.findIndex((character) => WORD_START.test(character));
  if (index === -1) return part; // punctuation or digits only — leave as typed
  const head = characters.slice(0, index + 1).join("");
  const tail = characters
    .slice(index + 1)
    .join("")
    .toLowerCase();
  return head.toUpperCase() + tail;
}

/**
 * Sentence case: lowercase everything, then capitalise the first letter of the
 * text, of each line, and of each sentence.
 */
export function toSentenceCase(text: string): string {
  const lower = text.toLowerCase();
  let capitaliseNext = true;
  const out: string[] = [];

  for (const character of lower) {
    if (capitaliseNext && WORD_START.test(character)) {
      out.push(character.toUpperCase());
      capitaliseNext = false;
      continue;
    }
    out.push(character);
    if (character === "\n" || SENTENCE_END.test(character)) {
      capitaliseNext = true;
    } else if (WORD_OR_DIGIT.test(character)) {
      // A real word character consumes the pending capital; quotes, dashes and
      // spaces in between do not, so `said "hello"` still capitalises `hello`.
      capitaliseNext = false;
    }
  }

  return out.join("");
}

/** Alternating case by letter, starting uppercase. Non-letters are skipped. */
export function toAlternatingCase(text: string): string {
  let index = 0;
  let out = "";
  for (const character of text) {
    if (!WORD_START.test(character)) {
      out += character;
      continue;
    }
    out += index % 2 === 0 ? character.toUpperCase() : character.toLowerCase();
    index += 1;
  }
  return out;
}

export function convertCase(text: string, mode: CaseMode): string {
  switch (mode) {
    case "upper":
      return text.toUpperCase();
    case "lower":
      return text.toLowerCase();
    case "title":
      return toTitleCase(text);
    case "sentence":
      return toSentenceCase(text);
    case "alternating":
      return toAlternatingCase(text);
  }
}

/** Download file name for a converted result. */
export const CONVERTED_FILE_NAME = "toolora-text.txt";
