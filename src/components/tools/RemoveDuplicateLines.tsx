import { useMemo, useState } from "react";
import {
  BLANK_LINE_MODES,
  CLEANED_FILE_NAME,
  removeDuplicateLines,
  type BlankLineMode,
} from "~/lib/calc/dedupeLines";
import { copyToClipboard, downloadTextFile } from "~/lib/download";
import { Checkbox, ResultArea, StatRow, ToolNote } from "./fields";

type Feedback = { state: "idle" | "ok" | "error"; message: string };

const IDLE: Feedback = { state: "idle", message: "" };

export function RemoveDuplicateLines() {
  const [text, setText] = useState("");
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(true);
  const [ignoreCase, setIgnoreCase] = useState(false);
  const [blankLines, setBlankLines] = useState<BlankLineMode>("keep");
  const [feedback, setFeedback] = useState<Feedback>(IDLE);
  const [showManualCopy, setShowManualCopy] = useState(false);

  const result = useMemo(
    () => removeDuplicateLines(text, { ignoreWhitespace, ignoreCase, blankLines }),
    [text, ignoreWhitespace, ignoreCase, blankLines],
  );

  const hasInput = text.length > 0;
  const blankMode = BLANK_LINE_MODES.find((entry) => entry.id === blankLines)!;

  const touch = () => setFeedback(IDLE);

  const handleCopy = async () => {
    const outcome = await copyToClipboard(result.text);
    if (outcome.ok) {
      setShowManualCopy(false);
      setFeedback({ state: "ok", message: "The cleaned text is on your clipboard." });
    } else {
      setShowManualCopy(true);
      setFeedback({
        state: "error",
        message: `${outcome.message} The cleaned text is shown below — select it and copy it by hand.`,
      });
    }
  };

  const handleDownload = () => {
    downloadTextFile(CLEANED_FILE_NAME, result.text);
    setFeedback({ state: "ok", message: `Downloaded ${CLEANED_FILE_NAME}.` });
  };

  const handleClear = () => {
    setText("");
    setFeedback(IDLE);
    setShowManualCopy(false);
  };

  return (
    <div className="min-w-0">
      <div className="min-w-0">
        <label htmlFor="dedupe-input" className="block text-sm font-medium text-ink">
          Your lines
        </label>
        <p id="dedupe-input-hint" className="mt-1 text-xs leading-relaxed text-muted">
          One line per row — a line is one row of text, so the same word twice in one row is not a
          duplicate line.
        </p>
        <textarea
          id="dedupe-input"
          name="dedupe-input"
          value={text}
          aria-describedby="dedupe-input-hint"
          onChange={(event) => {
            setText(event.target.value);
            touch();
          }}
          rows={10}
          spellCheck={false}
          placeholder={"apple\nbanana\nApple\n  banana  \ncherry"}
          className="mt-2 min-h-44 w-full min-w-0 rounded-card border border-line bg-surface px-4 py-3 font-mono text-sm leading-relaxed text-ink placeholder:text-muted focus:border-accent focus:outline-none"
        />
      </div>

      <fieldset className="mt-6 min-w-0">
        <legend className="text-sm font-medium text-ink">How to compare lines</legend>
        <div className="mt-3 grid min-w-0 gap-3 sm:grid-cols-2">
          <Checkbox
            id="dedupe-whitespace"
            checked={ignoreWhitespace}
            onChange={(checked) => {
              setIgnoreWhitespace(checked);
              touch();
            }}
            label="Ignore leading and trailing whitespace"
            hint="“  apple” and “apple” then count as the same line. The kept line is the first one exactly as you wrote it, spaces and tabs included."
          />
          <Checkbox
            id="dedupe-case"
            checked={ignoreCase}
            onChange={(checked) => {
              setIgnoreCase(checked);
              touch();
            }}
            label="Ignore capitalisation"
            hint="“Apple” and “apple” then count as the same line. The kept line keeps its own capitals."
          />
        </div>
      </fieldset>

      <fieldset className="mt-6 min-w-0">
        <legend className="text-sm font-medium text-ink">What to do with blank lines</legend>
        <div className="mt-3 grid min-w-0 gap-2">
          {BLANK_LINE_MODES.map((entry) => {
            const active = entry.id === blankLines;
            return (
              <label
                key={entry.id}
                htmlFor={`dedupe-blank-${entry.id}`}
                className={`flex min-h-11 min-w-0 cursor-pointer items-start gap-3 rounded-card border px-3 py-2.5 ${
                  active ? "border-accent bg-accent-soft" : "border-line bg-surface-2"
                }`}
              >
                <input
                  id={`dedupe-blank-${entry.id}`}
                  type="radio"
                  name="dedupe-blank-mode"
                  value={entry.id}
                  checked={active}
                  onChange={() => {
                    setBlankLines(entry.id);
                    touch();
                  }}
                  className="mt-1 h-4 w-4 shrink-0 accent-[var(--accent)]"
                />
                <span className="min-w-0">
                  <span className="block text-sm font-semibold break-words text-ink">
                    {entry.label}
                  </span>
                  <span className="mt-0.5 block text-xs leading-relaxed break-words text-muted">
                    {entry.description}
                  </span>
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <p
        data-current-rules
        className="mt-4 rounded-card border border-line bg-surface-2 px-4 py-3 text-sm leading-relaxed break-words text-ink"
      >
        Running now: duplicates are compared{" "}
        {ignoreCase ? (
          <strong>ignoring capitalisation</strong>
        ) : (
          <strong>with capitalisation mattering</strong>
        )}
        ,{" "}
        {ignoreWhitespace ? (
          <strong>ignoring leading and trailing whitespace</strong>
        ) : (
          <strong>with whitespace mattering</strong>
        )}
        , and <strong>{blankMode.label.toLowerCase()}</strong> — {blankMode.description}
      </p>

      <div className="mt-4 flex flex-wrap gap-3">
        <button type="button" className="btn btn-primary" onClick={handleCopy} disabled={!hasInput}>
          Copy cleaned text
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={handleDownload}
          disabled={!hasInput}
        >
          Download as .txt
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={handleClear}
          disabled={!hasInput}
        >
          Clear
        </button>
      </div>

      {feedback.state !== "idle" ? (
        <p
          role={feedback.state === "error" ? "alert" : undefined}
          className={`mt-3 rounded-card border px-4 py-3 text-sm leading-relaxed break-words ${
            feedback.state === "error"
              ? "border-danger bg-danger-soft text-danger"
              : "border-line bg-surface-2 text-ink"
          }`}
        >
          {feedback.message}
        </p>
      ) : null}

      <ResultArea heading="Line counts">
        {!hasInput ? (
          <p className="rounded-card border border-dashed border-line-strong bg-surface-2 px-4 py-5 text-sm leading-relaxed text-muted">
            Nothing to clean yet. Paste your list above and the counts appear here as you type.
          </p>
        ) : (
          <div className="min-w-0">
            <dl className="min-w-0 rounded-card border border-line bg-surface-2 p-4 sm:p-5">
              <StatRow
                label="Lines before"
                value={result.originalCount.toLocaleString("en-US")}
                hint="A line break at the very end of your text is a terminator, not an extra empty line."
              />
              <StatRow
                label="Lines after"
                value={result.resultCount.toLocaleString("en-US")}
                hint="First occurrence kept, in its original position."
              />
              <StatRow
                label="Duplicates removed"
                value={result.removedCount.toLocaleString("en-US")}
                hint={
                  result.removedCount === 0
                    ? "Every line here is unique under the rules above."
                    : "Counted under the rules stated above — change them and this number moves."
                }
              />
            </dl>

            {result.groups.length > 0 ? (
              <div className="mt-4 min-w-0">
                <h4 className="text-sm font-semibold text-ink">What was duplicated</h4>
                <ul className="mt-2 min-w-0 space-y-1.5">
                  {result.groups.slice(0, 12).map((group) => (
                    <li
                      key={group.key}
                      className="min-w-0 rounded-card border border-line bg-surface-2 px-3 py-2 text-xs leading-relaxed break-words text-muted"
                    >
                      <span className="font-mono text-ink">{group.line === "" ? "(blank)" : group.line}</span>{" "}
                      — {group.count} more {group.count === 1 ? "copy" : "copies"} removed
                    </li>
                  ))}
                </ul>
                {result.groups.length > 12 ? (
                  <p className="mt-2 text-xs text-muted">
                    Showing the first 12 duplicate groups of {result.groups.length}.
                  </p>
                ) : null}
              </div>
            ) : null}

            <h4 className="mt-5 text-sm font-semibold text-ink">Cleaned text</h4>
            <pre
              data-cleaned-output
              className="mt-2 max-h-96 min-w-0 overflow-auto rounded-card border border-line bg-surface-2 px-4 py-3 font-mono text-sm leading-relaxed break-words whitespace-pre-wrap text-ink"
            >
              {result.text}
            </pre>
          </div>
        )}
      </ResultArea>

      {showManualCopy && hasInput ? (
        <div className="mt-5 min-w-0">
          <label htmlFor="dedupe-manual-copy" className="block text-sm font-medium text-ink">
            Copy by hand
          </label>
          <textarea
            id="dedupe-manual-copy"
            readOnly
            value={result.text}
            rows={5}
            onFocus={(event) => event.currentTarget.select()}
            className="mt-2 min-h-32 w-full min-w-0 rounded-card border border-line bg-surface px-4 py-3 font-mono text-xs leading-relaxed text-ink focus:border-accent focus:outline-none"
          />
        </div>
      ) : null}

      <ToolNote>
        <p>The exact rules this tool follows, so the result is never a surprise:</p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>
            <strong>Lines</strong> are split on a line break (<code>\n</code>, <code>\r\n</code> or a
            lone <code>\r</code>). A line break at the very end is a terminator, not an extra empty
            line.
          </li>
          <li>
            <strong>The first occurrence wins</strong>, in its original position and written exactly
            as it was. Later repeats are deleted; the order of everything kept never changes.
          </li>
          <li>
            <strong>Ignoring whitespace</strong> compares trimmed lines, so “  apple” and “apple”
            match — but the line you keep is the first one as typed. Tabs are trimmed too.
          </li>
          <li>
            <strong>Ignoring capitalisation</strong> compares the two lowercased, so “Apple” and
            “apple” match. The kept line keeps its own capitals.
          </li>
          <li>
            <strong>Blank lines</strong> are ruled on explicitly: keep them all, treat them as
            duplicates so a run of empty lines collapses to the first one, or drop them entirely. A
            line of spaces counts as blank in the last two modes.
          </li>
          <li>
            <strong>Nothing leaves your browser.</strong> Everything runs in this page, and the
            download is a .txt file built here from a Blob.
          </li>
        </ul>
      </ToolNote>
    </div>
  );
}
