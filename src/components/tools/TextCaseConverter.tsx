import { useMemo, useState } from "react";
import { CASE_MODES, CONVERTED_FILE_NAME, convertCase, type CaseMode } from "~/lib/calc/caseConvert";
import { copyToClipboard, downloadTextFile } from "~/lib/download";
import { ResultArea, ToolNote } from "./fields";

type Feedback = { state: "idle" | "ok" | "error"; message: string };

const IDLE: Feedback = { state: "idle", message: "" };

const countCharacters = (text: string) => Array.from(text).length;
const countLines = (text: string) => (text === "" ? 0 : text.split(/\r\n|\r|\n/).length);

export function TextCaseConverter() {
  const [text, setText] = useState("");
  const [mode, setMode] = useState<CaseMode>("upper");
  const [feedback, setFeedback] = useState<Feedback>(IDLE);
  const [showManualCopy, setShowManualCopy] = useState(false);

  const converted = useMemo(() => convertCase(text, mode), [text, mode]);
  const hasText = text.length > 0;
  const modeInfo = CASE_MODES.find((entry) => entry.id === mode)!;

  const reset = () => setFeedback(IDLE);

  const handleCopy = async () => {
    const result = await copyToClipboard(converted);
    if (result.ok) {
      setShowManualCopy(false);
      setFeedback({ state: "ok", message: "The converted text is on your clipboard." });
    } else {
      setShowManualCopy(true);
      setFeedback({
        state: "error",
        message: `${result.message} The converted text is shown below — select it and copy it by hand.`,
      });
    }
  };

  const handleDownload = () => {
    downloadTextFile(CONVERTED_FILE_NAME, converted);
    setFeedback({
      state: "ok",
      message: `Downloaded ${CONVERTED_FILE_NAME} — a plain text file saved by your browser.`,
    });
  };

  const handleClear = () => {
    setText("");
    setFeedback(IDLE);
    setShowManualCopy(false);
  };

  return (
    <div className="min-w-0">
      <fieldset className="min-w-0">
        <legend className="text-sm font-medium text-ink">Choose a case</legend>
        <p className="mt-1 text-xs leading-relaxed text-muted">
          The conversion happens as soon as you pick one — there is no convert button.
        </p>
        <div className="mt-3 grid min-w-0 gap-2 sm:grid-cols-2">
          {CASE_MODES.map((entry) => {
            const active = entry.id === mode;
            return (
              <label
                key={entry.id}
                htmlFor={`case-${entry.id}`}
                className={`flex min-h-11 min-w-0 cursor-pointer items-start gap-3 rounded-card border px-3 py-2.5 ${
                  active ? "border-accent bg-accent-soft" : "border-line bg-surface-2"
                }`}
              >
                <input
                  id={`case-${entry.id}`}
                  type="radio"
                  name="case-mode"
                  value={entry.id}
                  checked={active}
                  onChange={() => {
                    setMode(entry.id);
                    reset();
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

      <div className="mt-6 min-w-0">
        <label htmlFor="case-input" className="block text-sm font-medium text-ink">
          Your text
        </label>
        <textarea
          id="case-input"
          name="case-input"
          value={text}
          onChange={(event) => {
            setText(event.target.value);
            reset();
          }}
          rows={8}
          spellCheck={false}
          placeholder="Type or paste the text to convert. Line breaks are kept exactly as you wrote them."
          className="mt-2 min-h-40 w-full min-w-0 rounded-card border border-line bg-surface px-4 py-3 text-sm leading-relaxed text-ink placeholder:text-muted focus:border-accent focus:outline-none"
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleCopy}
          disabled={!hasText}
        >
          Copy converted text
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={handleDownload}
          disabled={!hasText}
        >
          Download as .txt
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={handleClear}
          disabled={!hasText}
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

      <ResultArea heading={`Converted text — ${modeInfo.label}`}>
        {!hasText ? (
          <p className="rounded-card border border-dashed border-line-strong bg-surface-2 px-4 py-5 text-sm leading-relaxed text-muted">
            Nothing to convert yet. Type or paste some text above and the{" "}
            {modeInfo.label} version appears here instantly.
          </p>
        ) : (
          <div className="min-w-0">
            <p className="text-sm leading-relaxed text-muted">
              {countCharacters(converted).toLocaleString("en-US")} characters ·{" "}
              {countLines(converted).toLocaleString("en-US")} lines ·{" "}
              {modeInfo.description}
            </p>
            <pre
              data-converted-output
              className="mt-3 max-h-96 min-w-0 overflow-auto rounded-card border border-line bg-surface-2 px-4 py-3 text-sm leading-relaxed break-words whitespace-pre-wrap text-ink"
            >
              {converted}
            </pre>
          </div>
        )}
      </ResultArea>

      {showManualCopy && hasText ? (
        <div className="mt-5 min-w-0">
          <label htmlFor="case-manual-copy" className="block text-sm font-medium text-ink">
            Copy by hand
          </label>
          <p className="mt-1 text-xs leading-relaxed text-muted">
            Clipboard access was refused, so select the text in this box and copy it with your
            keyboard.
          </p>
          <textarea
            id="case-manual-copy"
            readOnly
            value={converted}
            rows={5}
            onFocus={(event) => event.currentTarget.select()}
            className="mt-2 min-h-32 w-full min-w-0 rounded-card border border-line bg-surface px-4 py-3 font-mono text-xs leading-relaxed text-ink focus:border-accent focus:outline-none"
          />
        </div>
      ) : null}

      <ToolNote>
        <p>
          <strong>Alternating case</strong> alternates by <em>letter</em>, not by word, and starts
          with an uppercase letter. Whitespace, digits and punctuation are printed unchanged and are
          not counted in the alternation, so “ab cd” becomes “Ab Cd” and “a-b” becomes “A-b”. The
          alternation keeps going across line breaks.
        </p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>
            <strong>Line breaks and spacing</strong> are never changed by any mode — what you typed
            between the words stays exactly as it was.
          </li>
          <li>
            <strong>Title Case</strong> capitalises the first letter of every word and lowercases the
            rest. Hyphens split words (“well-being” → “Well-Being”); apostrophes do not (“don’t” →
            “Don’t”, “o’brien’s” → “O’brien’s”). Leading punctuation travels with its word (‘“the
            end”’ → ‘“The End”’), and a token with no letters such as “--” is left as typed.
          </li>
          <li>
            <strong>Sentence case</strong> lowercases everything and then capitalises the first
            letter of the text, of every line, and of every sentence — a sentence ends at “.”, “!”,
            “?” or “…”. Proper nouns are not preserved, which is exactly what sentence case means.
          </li>
          <li>
            <strong>Punctuation</strong> is never added, moved or removed, and no smart quotes or
            dashes are introduced.
          </li>
          <li>
            <strong>Copy and download happen in your browser.</strong> The download is a real .txt
            file built here from a Blob — your text is never uploaded anywhere.
          </li>
        </ul>
      </ToolNote>

      {text === "" ? (
        <p className="mt-3 text-xs leading-relaxed text-muted">
          Nothing entered yet — the copy, download and clear buttons stay disabled until there is
          text to convert.
        </p>
      ) : null}
    </div>
  );
}
