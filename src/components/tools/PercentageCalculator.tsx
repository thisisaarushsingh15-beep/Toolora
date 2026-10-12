import { useState } from "react";
import { formatNumber } from "~/lib/calc/number";
import {
  MODE_FIELDS,
  PERCENT_MODES,
  type PercentMode,
  computePercentage,
} from "~/lib/calc/percentage";
import {
  BigResult,
  EmptyResult,
  Field,
  Notice,
  ResultArea,
  ResultCard,
  TextInput,
  ToolNote,
} from "./fields";

type Values = Record<PercentMode, { first: string; second: string }>;

const EMPTY_VALUES: Values = {
  "percent-of": { first: "", second: "" },
  "what-percent": { first: "", second: "" },
  change: { first: "", second: "" },
  whole: { first: "", second: "" },
};

const RESULT_LABEL: Record<PercentMode, string> = {
  "percent-of": "Result",
  "what-percent": "Percentage",
  change: "Percentage change",
  whole: "The whole",
};

export function PercentageCalculator() {
  const [mode, setMode] = useState<PercentMode>("percent-of");
  const [values, setValues] = useState<Values>(EMPTY_VALUES);

  const current = values[mode];
  const fields = MODE_FIELDS[mode];
  const outcome = computePercentage(mode, current.first, current.second);
  const touched = current.first.trim() !== "" || current.second.trim() !== "";
  const liveError = touched && !outcome.ok ? outcome : null;

  const setField = (key: "first" | "second", value: string) => {
    setValues((previous) => ({ ...previous, [mode]: { ...previous[mode], [key]: value } }));
  };

  // An error is only pinned to a field the visitor has actually typed in, so the
  // form does not shout at an empty input that is simply not filled yet.
  const firstError = liveError && liveError.first && current.first.trim() !== "" ? liveError.first : undefined;
  const secondError =
    liveError && liveError.second && current.second.trim() !== "" ? liveError.second : undefined;

  return (
    <div className="min-w-0">
      <fieldset className="min-w-0">
        <legend className="text-sm font-medium text-ink">What do you want to work out?</legend>
        <div role="radiogroup" aria-label="Calculation mode" className="mt-3 grid gap-2 sm:grid-cols-2">
          {PERCENT_MODES.map((item) => {
            const active = item.id === mode;
            return (
              <label
                key={item.id}
                className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-card border px-4 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "border-accent bg-accent-soft text-accent"
                    : "border-line bg-surface text-ink hover:border-line-strong"
                }`}
              >
                <input
                  type="radio"
                  name="percent-mode"
                  value={item.id}
                  checked={active}
                  onChange={() => setMode(item.id)}
                  className="h-4 w-4 shrink-0 accent-[var(--accent)]"
                />
                <span className="min-w-0">{item.label}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <p className="mt-5 rounded-card border border-line bg-surface-2 px-4 py-3 font-mono text-sm break-words text-ink">
        {fields.formula}
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <Field id="percent-first" label={fields.first} error={firstError}>
          <TextInput
            id="percent-first"
            value={current.first}
            onChange={(value) => setField("first", value)}
            inputMode="decimal"
            placeholder={mode === "change" ? "e.g. 200" : "e.g. 20"}
            error={firstError}
          />
        </Field>
        <Field
          id="percent-second"
          label={fields.second}
          error={secondError}
          hint={mode === "change" ? "Negative numbers are allowed." : undefined}
        >
          <TextInput
            id="percent-second"
            value={current.second}
            onChange={(value) => setField("second", value)}
            inputMode="decimal"
            placeholder={mode === "change" ? "e.g. 250" : "e.g. 150"}
            error={secondError}
            hint={mode === "change" ? "Negative numbers are allowed." : undefined}
          />
        </Field>
      </div>

      {mode === "change" ? (
        <p className="mt-4 text-sm leading-relaxed text-muted">
          A negative result means a decrease: a change from 250 to 200 is a 20% decrease, shown as
          −20%.
        </p>
      ) : null}

      <ResultArea heading="Answer and working">
        {!touched ? (
          <EmptyResult>
            Enter both values above and the answer, the substituted numbers and the working appear
            here. Negative values are allowed in every mode.
          </EmptyResult>
        ) : outcome.ok ? (
          <ResultCard>
            <BigResult label={RESULT_LABEL[mode]} value={formatNumber(outcome.result)} />
            <div className="mt-4 border-t border-line pt-4">
              <dl className="space-y-2 text-sm">
                <div>
                  <dt className="text-xs font-semibold tracking-wide text-muted uppercase">
                    Substituted values
                  </dt>
                  <dd className="mt-1 font-mono break-words text-ink">{outcome.substitution}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold tracking-wide text-muted uppercase">Answer in words</dt>
                  <dd className="mt-1 break-words text-ink">{outcome.summary}</dd>
                </div>
              </dl>
            </div>
          </ResultCard>
        ) : (
          <Notice tone="error">{outcome.error}</Notice>
        )}
      </ResultArea>

      <ToolNote>
        <p>
          Results are rounded to at most 4 decimal places, with trailing zeros removed. Nothing is
          sent anywhere — the calculation runs in your browser.
        </p>
      </ToolNote>
    </div>
  );
}
