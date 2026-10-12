import { useEffect, useState } from "react";
import { type DateOnly, formatLong, formatWithWeekday, toISODate, todayDateOnly } from "~/lib/calc/date";
import { describeAge, computeAge } from "~/lib/calc/age";
import { EmptyResult, Field, Notice, ResultArea, ResultCard, StatRow, ToolNote } from "./fields";
import { DateInput } from "./fields";

export function AgeCalculator() {
  const [birth, setBirth] = useState("");
  const [reference, setReference] = useState("");
  // Read the device clock after mount only, so the server-rendered HTML and the
  // first client render agree (no hydration mismatch, no timezone surprises).
  const [today, setToday] = useState<DateOnly | null>(null);

  useEffect(() => {
    setToday(todayDateOnly());
  }, []);

  const referenceValue = reference.trim() !== "" ? reference : today ? toISODate(today) : "";
  const usesToday = reference.trim() === "";
  const outcome = referenceValue === "" ? null : computeAge(birth, referenceValue, today);
  const birthEntered = birth.trim() !== "";

  const birthError = outcome && !outcome.ok && birthEntered ? outcome.birth : undefined;

  return (
    <div className="min-w-0">
      <div className="grid min-w-0 gap-4 sm:grid-cols-2">
        <Field
          id="age-birth"
          label="Date of birth"
          hint="Any date from 1 January 1 onwards."
          error={birthError}
        >
          <DateInput
            id="age-birth"
            value={birth}
            onChange={setBirth}
            error={birthError}
            hint="Any date from 1 January 1 onwards."
          />
        </Field>
        <Field
          id="age-reference"
          label="Reference date (optional)"
          hint={
            usesToday
              ? today
                ? `Defaults to today, ${formatWithWeekday(today)}.`
                : "Defaults to today."
              : "Leave empty to use today."
          }
        >
          <DateInput id="age-reference" value={reference} onChange={setReference} />
        </Field>
      </div>

      <ResultArea heading="Age">
        {outcome === null ? (
          <EmptyResult>Reading today&rsquo;s date from your device…</EmptyResult>
        ) : !outcome.ok ? (
          <Notice tone="error">{outcome.error}</Notice>
        ) : (
          <div className="space-y-4">
            {outcome.referenceInFuture ? (
              <Notice tone="warn">
                The reference date {formatLong(outcome.reference)} is in the future, so this is the age
                that will be reached on that date — not the age today.
              </Notice>
            ) : null}
            <ResultCard>
              <p className="eyebrow">Exact age</p>
              <p className="mt-2 font-mono text-2xl font-semibold break-words text-ink sm:text-3xl">
                {outcome.years} years, {outcome.months} months, {outcome.days} days
              </p>
              <p className="mt-3 text-sm leading-relaxed text-ink">{describeAge(outcome)}</p>
              <dl className="mt-5 border-t border-line pt-4">
                <StatRow label="Total days lived" value={`${outcome.totalDays.toLocaleString("en-US")} days`} />
                <StatRow
                  label="Total months"
                  value={`${outcome.totalMonths.toLocaleString("en-US")} months`}
                  hint="Completed calendar months, not 30-day blocks."
                />
                <StatRow
                  label="Total weeks"
                  value={`${outcome.totalWeeks.toLocaleString("en-US")} weeks and ${outcome.leftoverDays} days`}
                />
                <StatRow
                  label="Next birthday"
                  value={
                    outcome.isBirthdayToday
                      ? `${formatWithWeekday(outcome.nextBirthday)} — today!`
                      : formatWithWeekday(outcome.nextBirthday)
                  }
                  hint={
                    outcome.isBirthdayToday
                      ? `Turning ${outcome.turning} today.`
                      : `In ${outcome.daysUntilNextBirthday} days, turning ${outcome.turning}.`
                  }
                />
                <StatRow
                  label="Reference date used"
                  value={formatLong(outcome.reference)}
                  hint={outcome.referenceIsToday ? "Today, from your own device clock." : "The date you entered."}
                />
              </dl>
            </ResultCard>

            {outcome.bornOnLeapDay ? (
              <Notice tone="warn">
                You were born on 29 February, a date that only exists in leap years. Because of that,
                the next birthday is observed on {formatLong(outcome.nextBirthday)}
                {outcome.observedOnFeb28
                  ? " — 29 February does not exist in that year, so the last day of February is used."
                  : " — a real 29 February in a leap year."}
              </Notice>
            ) : null}
          </div>
        )}
      </ResultArea>

      <ToolNote>
        <p>
          Ages are counted in complete calendar months — real month lengths, real leap years, never a
          flat 30 days. All arithmetic is done on dates only, so no timezone can shift a result by a
          day. A birth date after the reference date is reported as an error rather than a negative
          age.
        </p>
      </ToolNote>
    </div>
  );
}
