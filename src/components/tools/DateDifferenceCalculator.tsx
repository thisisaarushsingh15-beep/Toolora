import { useState } from "react";
import { formatLong, formatWithWeekday } from "~/lib/calc/date";
import { dateDifference, swapPair } from "~/lib/calc/dateDiff";
import {
  Checkbox,
  DateInput,
  EmptyResult,
  Field,
  Notice,
  ResultArea,
  ResultCard,
  StatRow,
  ToolNote,
} from "./fields";

export function DateDifferenceCalculator() {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [includeEnd, setIncludeEnd] = useState(false);

  const outcome = dateDifference(start, end, includeEnd);
  const touched = start.trim() !== "" || end.trim() !== "";
  const startError = !outcome.ok && start.trim() !== "" ? outcome.start : undefined;
  const endError = !outcome.ok && end.trim() !== "" ? outcome.end : undefined;

  return (
    <div className="min-w-0">
      <div className="grid min-w-0 gap-4 sm:grid-cols-2">
        <Field id="diff-start" label="Start date" error={startError}>
          <DateInput id="diff-start" value={start} onChange={setStart} error={startError} />
        </Field>
        <Field id="diff-end" label="End date" error={endError}>
          <DateInput id="diff-end" value={end} onChange={setEnd} error={endError} />
        </Field>
      </div>

      <div className="mt-4">
        <Checkbox
          id="diff-inclusive"
          checked={includeEnd}
          onChange={setIncludeEnd}
          label="Include the end date in the count"
          hint="Off, the difference is the gap between the two dates. On, the end date counts as a day of its own — useful for hotel nights, leave days and project timelines."
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => {
            const swapped = swapPair(start, end);
            setStart(swapped.start);
            setEnd(swapped.end);
          }}
          disabled={touched === false}
        >
          Swap the two dates
        </button>
      </div>

      <ResultArea heading="Difference">
        {!touched ? (
          <EmptyResult>
            Enter a start and end date. You will see the difference as calendar years, months and
            days, the total number of days, and the total in weeks — and a sentence saying whether
            the end date was counted.
          </EmptyResult>
        ) : !outcome.ok ? (
          <Notice tone="error">{outcome.error}</Notice>
        ) : (
          <div className="space-y-4">
            {outcome.swapped ? (
              <Notice tone="warn">
                The dates were entered in reverse ({formatLong(outcome.to)} before{" "}
                {formatLong(outcome.from)}). The difference below is the absolute gap between them,
                counted from {formatLong(outcome.from)} to {formatLong(outcome.to)}. Use{" "}
                <strong>Swap the two dates</strong> to put them the right way round.
              </Notice>
            ) : null}

            <ResultCard>
              <p className="eyebrow">Total days</p>
              <p className="mt-2 font-mono text-2xl font-semibold break-words text-ink sm:text-3xl">
                {outcome.totalDays.toLocaleString("en-US")} days
              </p>
              <p className="mt-3 text-sm leading-relaxed text-ink">{outcome.note}</p>
              <dl className="mt-5 border-t border-line pt-4">
                <StatRow
                  label="As years, months and days"
                  value={`${outcome.years} years, ${outcome.months} months, ${outcome.days} days`}
                  hint="Calendar months with real month lengths, so 31 January to 1 March is 1 month and 1 day."
                />
                <StatRow
                  label="Total weeks"
                  value={`${outcome.weeks} weeks and ${outcome.leftoverDays} days`}
                />
                <StatRow
                  label="From"
                  value={`${formatWithWeekday(outcome.from)}`}
                />
                <StatRow label="To" value={`${formatWithWeekday(outcome.to)}`} />
                <StatRow
                  label="End date counted?"
                  value={outcome.inclusive ? "Yes — the end date is included" : "No — the end date is not included"}
                />
                {outcome.sameDay ? (
                  <StatRow
                    label="Same day"
                    value="Both dates are the same day"
                    hint={
                      includeEnd
                        ? "Counting that single day once gives 1 day."
                        : "A date has no gap from itself, so the difference is 0 days."
                    }
                  />
                ) : null}
              </dl>
            </ResultCard>
          </div>
        )}
      </ResultArea>

      <ToolNote>
        <p>
          The calculation is date-only and calendar-aware: leap years, month ends and long months are
          all handled properly. Nothing is sent anywhere — both dates stay in your browser.
        </p>
      </ToolNote>
    </div>
  );
}
