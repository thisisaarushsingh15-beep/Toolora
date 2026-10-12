import { useState } from "react";
import {
  READING_WORDS_PER_MINUTE,
  statsToPlainText,
  textStats,
} from "~/lib/calc/textStats";
import { StatRow, ToolNote } from "./fields";

type CopyState = { state: "idle" | "ok" | "error"; message: string };

const IDLE: CopyState = { state: "idle", message: "" };

export function WordCounter() {
  const [text, setText] = useState("");
  const [copy, setCopy] = useState<CopyState>(IDLE);

  const stats = textStats(text);
  const summary = statsToPlainText(stats, READING_WORDS_PER_MINUTE);

  const handleCopy = async () => {
    try {
      const clipboard = typeof navigator !== "undefined" ? navigator.clipboard : undefined;
      if (!clipboard || typeof clipboard.writeText !== "function") {
        throw new Error("clipboard unavailable");
      }
      await clipboard.writeText(summary);
      setCopy({ state: "ok", message: "Statistics copied to your clipboard." });
    } catch {
      setCopy({
        state: "error",
        message:
          "Copying failed — your browser blocked clipboard access (this happens in private windows and non-secure pages). Open the statistics as text below and copy them by hand.",
      });
    }
  };

  const handleClear = () => {
    setText("");
    setCopy(IDLE);
  };

  return (
    <div className="min-w-0">
      <label htmlFor="word-counter-text" className="block text-sm font-medium text-ink">
        Your text
      </label>
      <textarea
        id="word-counter-text"
        name="word-counter-text"
        value={text}
        onChange={(event) => {
          setText(event.target.value);
          if (copy.state !== "idle") setCopy(IDLE);
        }}
        rows={10}
        spellCheck={false}
        placeholder="Paste or type here — the counts update as you type."
        className="mt-2 min-h-44 w-full rounded-card border border-line bg-surface px-4 py-3 text-sm leading-relaxed text-ink placeholder:text-muted focus:border-accent focus:outline-none"
      />

      <div className="mt-4 flex flex-wrap gap-3">
        <button type="button" className="btn btn-primary" onClick={handleCopy}>
          Copy statistics
        </button>
        <button type="button" className="btn btn-secondary" onClick={handleClear} disabled={text === ""}>
          Clear all
        </button>
      </div>

      {copy.state !== "idle" ? (
        <p
          role={copy.state === "error" ? "alert" : undefined}
          className={`mt-3 rounded-card border px-4 py-3 text-sm leading-relaxed break-words ${
            copy.state === "error"
              ? "border-danger bg-danger-soft text-danger"
              : "border-line bg-surface-2 text-ink"
          }`}
        >
          {copy.message}
        </p>
      ) : null}

      <div className="mt-7 min-w-0">
        <h3 className="text-sm font-semibold text-ink">Live statistics</h3>
        <div aria-live="polite" className="mt-3 min-w-0">
          <div className="grid min-w-0 gap-4 sm:grid-cols-2">
            <div className="min-w-0 rounded-card border border-line bg-surface-2 p-4 sm:p-5">
              <p className="eyebrow">Words</p>
              <p className="mt-1 font-mono text-3xl font-semibold text-ink">
                {stats.words.toLocaleString("en-US")}
              </p>
            </div>
            <div className="min-w-0 rounded-card border border-line bg-surface-2 p-4 sm:p-5">
              <p className="eyebrow">Reading time</p>
              <p className="mt-1 font-mono text-3xl font-semibold text-ink">{stats.readingLabel}</p>
              <p className="mt-1 text-xs text-muted">
                Estimated at {READING_WORDS_PER_MINUTE} words per minute — an average adult reading
                speed for plain English.
              </p>
            </div>
          </div>

          <dl className="mt-4 min-w-0 rounded-card border border-line bg-surface-2 p-4 sm:p-5">
            <StatRow
              label="Characters (with spaces)"
              value={stats.characters.toLocaleString("en-US")}
            />
            <StatRow
              label="Characters (without spaces)"
              value={stats.charactersWithoutSpaces.toLocaleString("en-US")}
            />
            <StatRow label="Sentences" value={stats.sentences.toLocaleString("en-US")} />
            <StatRow label="Paragraphs" value={stats.paragraphs.toLocaleString("en-US")} />
            <StatRow
              label="Exact reading time"
              value={`${stats.readingMinutes.toFixed(2)} minutes`}
              hint={`${stats.readingSeconds} seconds at ${READING_WORDS_PER_MINUTE} words per minute.`}
            />
          </dl>

          {stats.isEmpty ? (
            <p className="mt-3 text-sm leading-relaxed text-muted">
              Nothing to count yet — every statistic is zero until you type or paste some text.
            </p>
          ) : null}
        </div>
      </div>

      <details className="mt-5 rounded-card border border-line bg-surface-2 px-4 py-3">
        <summary className="cursor-pointer list-none text-sm font-semibold text-ink marker:content-none">
          <h3 className="inline text-sm font-semibold">Show the statistics as text</h3>
        </summary>
        <p className="mt-3 text-xs leading-relaxed text-muted">
          The same numbers as plain text, for copying by hand if clipboard access is blocked. Your
          words are never included — only the counts.
        </p>
        <textarea
          readOnly
          value={summary}
          rows={6}
          aria-label="Statistics as plain text"
          className="mt-3 min-h-32 w-full rounded-card border border-line bg-surface px-4 py-3 font-mono text-xs leading-relaxed text-ink focus:border-accent focus:outline-none"
        />
      </details>

      <ToolNote>
        <p>
          Counting conventions used here, so you can match them against any word limit you are
          working to:
        </p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>
            <strong>Words</strong> are groups of characters separated by whitespace. A token counts
            only if it contains at least one letter or number, so a lone dash, a row of dots or a
            stray ellipsis is not a word.
          </li>
          <li>
            <strong>Hyphenated and apostrophe words count as one</strong> — “well-being” and “don’t”
            are one word each.
          </li>
          <li>
            <strong>Characters</strong> are counted as Unicode code points, so é, 漢 and most emoji
            count as one each; emoji built from several code points (skin tones, flags) count as more
            than one. Characters without spaces excludes every space, tab and line break.
          </li>
          <li>
            <strong>Sentences</strong> end at a full stop, question mark or exclamation mark (and the
            ellipsis …); a run such as “!!!” counts once, and a full stop between digits (3.5) does
            not end a sentence.
          </li>
          <li>
            <strong>Paragraphs</strong> are separated by a blank line — a single line break stays
            inside the same paragraph.
          </li>
          <li>
            <strong>Reading time</strong> assumes {READING_WORDS_PER_MINUTE} words per minute. Text
            with no spaces between words, such as Chinese or Japanese, counts as far fewer words
            than a reader would see, because no word boundaries are guessed.
          </li>
        </ul>
        <p>
          Everything happens in your browser: the text is never uploaded, stored or sent anywhere.
        </p>
      </ToolNote>
    </div>
  );
}
