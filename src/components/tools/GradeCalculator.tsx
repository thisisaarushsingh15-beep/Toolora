import { useState } from "react";
import { formatNumber } from "~/lib/calc/number";
import {
  DEFAULT_GRADE_BANDS,
  type GradeBand,
  type SubjectRow,
  computeGrades,
} from "~/lib/calc/grade";
import { EmptyResult, Field, Notice, ResultArea, ResultCard, StatRow, TextInput, ToolNote } from "./fields";

const row = (index: number): SubjectRow => ({
  id: `subject-${index}`,
  name: "",
  obtained: "",
  maximum: "",
});

const band = (index: number, label: string, minPercent: string): GradeBand => ({
  id: `band-${index}`,
  label,
  minPercent,
});

const DEFAULT_ROWS = [row(1), row(2), row(3)];

export function GradeCalculator() {
  const [subjects, setSubjects] = useState<SubjectRow[]>(DEFAULT_ROWS);
  const [bands, setBands] = useState<GradeBand[]>(DEFAULT_GRADE_BANDS);
  const [nextRowId, setNextRowId] = useState(DEFAULT_ROWS.length + 1);
  const [nextBandId, setNextBandId] = useState(DEFAULT_GRADE_BANDS.length + 1);

  const outcome = computeGrades(subjects, bands);
  const touched = subjects.some(
    (item) => item.name.trim() !== "" || item.obtained.trim() !== "" || item.maximum.trim() !== "",
  );
  const rowErrors = outcome.ok ? {} : outcome.rows;
  const bandErrors = outcome.ok ? {} : outcome.bands;

  const updateSubject = (id: string, patch: Partial<SubjectRow>) => {
    setSubjects((previous) => previous.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };

  const updateBand = (id: string, patch: Partial<GradeBand>) => {
    setBands((previous) => previous.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };

  const addSubject = () => {
    setSubjects((previous) => [...previous, row(nextRowId)]);
    setNextRowId(nextRowId + 1);
  };

  return (
    <div className="min-w-0">
      <h3 className="text-sm font-semibold text-ink">Subjects</h3>
      <p className="mt-1 text-xs leading-relaxed text-muted">
        One row per subject. Decimal marks are fine, and rows you leave empty are not counted.
      </p>

      <div className="mt-4 space-y-3">
        {subjects.map((subject, index) => {
          const errors = rowErrors[subject.id] ?? {};
          const graded = outcome.ok ? outcome.rows.find((item) => item.id === subject.id) : undefined;
          return (
            <div key={subject.id} className="rounded-card border border-line bg-surface p-4">
              <div className="grid min-w-0 gap-3 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)]">
                <Field id={`${subject.id}-name`} label={`Subject ${index + 1} name`}>
                  <TextInput
                    id={`${subject.id}-name`}
                    value={subject.name}
                    onChange={(value) => updateSubject(subject.id, { name: value })}
                    placeholder="e.g. Mathematics"
                  />
                </Field>
                <Field
                  id={`${subject.id}-obtained`}
                  label="Marks obtained"
                  error={errors.obtained}
                >
                  <TextInput
                    id={`${subject.id}-obtained`}
                    value={subject.obtained}
                    onChange={(value) => updateSubject(subject.id, { obtained: value })}
                    inputMode="decimal"
                    placeholder="e.g. 85"
                    error={errors.obtained}
                  />
                </Field>
                <Field
                  id={`${subject.id}-maximum`}
                  label="Maximum marks"
                  error={errors.maximum}
                >
                  <TextInput
                    id={`${subject.id}-maximum`}
                    value={subject.maximum}
                    onChange={(value) => updateSubject(subject.id, { maximum: value })}
                    inputMode="decimal"
                    placeholder="e.g. 100"
                    error={errors.maximum}
                  />
                </Field>
              </div>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs font-medium text-muted">
                  {graded
                    ? `${subject.name.trim() || `Subject ${index + 1}`}: ${formatNumber(graded.percent, 2)}% — grade ${graded.grade}`
                    : "Not counted yet"}
                </p>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setSubjects((previous) => previous.filter((item) => item.id !== subject.id))}
                  aria-label={`Remove subject ${index + 1}`}
                >
                  Remove row
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <button type="button" className="btn btn-secondary mt-4" onClick={addSubject}>
        Add a subject
      </button>

      <ResultArea heading="Totals and grade">
        {!touched ? (
          <EmptyResult>
            Fill in at least one subject with its marks obtained and maximum marks. Totals, overall
            percentage and the grade appear here as you type.
          </EmptyResult>
        ) : outcome.ok ? (
          <ResultCard>
            <dl className="min-w-0">
              <StatRow label="Total marks" value={formatNumber(outcome.totalObtained)} />
              <StatRow label="Total possible marks" value={formatNumber(outcome.totalMaximum)} />
              <StatRow
                label="Overall percentage"
                value={`${formatNumber(outcome.overallPercent, 2)}%`}
              />
              <StatRow
                label="Overall grade"
                value={outcome.grade}
                hint={`Using your grading scale: ${outcome.grade} starts at ${formatNumber(outcome.bandPercent, 2)}%.`}
              />
              {outcome.skippedRows > 0 ? (
                <StatRow
                  label="Rows not counted"
                  value={String(outcome.skippedRows)}
                  hint="Those rows have a name but no marks, so they are left out of the totals."
                />
              ) : null}
            </dl>
            <div className="mt-5 border-t border-line pt-4">
              <h4 className="text-xs font-semibold tracking-wide text-muted uppercase">
                Per subject
              </h4>
              <ul className="mt-2 space-y-1 text-sm text-ink">
                {outcome.rows.map((item) => (
                  <li key={`per-${item.id}`} className="break-words">
                    <span className="font-medium">{item.name}</span>
                    <span className="text-muted">
                      {" "}
                      — {formatNumber(item.obtained)} / {formatNumber(item.maximum)} ={" "}
                      {formatNumber(item.percent, 2)}% — grade {item.grade}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </ResultCard>
        ) : (
          <Notice tone="error">{outcome.error}</Notice>
        )}
      </ResultArea>

      <div className="mt-8 min-w-0">
        <h3 className="text-sm font-semibold text-ink">Grading scale</h3>
        <p className="mt-1 text-xs leading-relaxed text-muted">
          Editable and separate from the marks: change any number to match your own scale. The bands
          below are an example only — grading scales differ between schools, boards, states and
          countries, and no single scale is correct everywhere.
        </p>
        <div className="mt-4 space-y-3">
          {bands.map((item, index) => {
            const errors = bandErrors[item.id] ?? {};
            return (
              <div key={item.id} className="rounded-card border border-line bg-surface p-4">
                <div className="grid min-w-0 gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                  <Field id={`${item.id}-label`} label={`Grade ${index + 1} label`} error={errors.label}>
                    <TextInput
                      id={`${item.id}-label`}
                      value={item.label}
                      onChange={(value) => updateBand(item.id, { label: value })}
                      placeholder="e.g. A"
                      error={errors.label}
                    />
                  </Field>
                  <Field
                    id={`${item.id}-min`}
                    label="Lowest percentage"
                    error={errors.minPercent}
                  >
                    <TextInput
                      id={`${item.id}-min`}
                      value={item.minPercent}
                      onChange={(value) => updateBand(item.id, { minPercent: value })}
                      inputMode="decimal"
                      placeholder="e.g. 90"
                      error={errors.minPercent}
                    />
                  </Field>
                </div>
                <button
                  type="button"
                  className="btn btn-secondary mt-3"
                  onClick={() => setBands((previous) => previous.filter((band) => band.id !== item.id))}
                  aria-label={`Remove grade band ${index + 1}`}
                >
                  Remove band
                </button>
              </div>
            );
          })}
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              setBands((previous) => [...previous, band(nextBandId, "", "")]);
              setNextBandId(nextBandId + 1);
            }}
          >
            Add a grade band
          </button>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => setBands(DEFAULT_GRADE_BANDS.map((item) => ({ ...item })))}
          >
            Reset to the example scale
          </button>
        </div>
      </div>

      <ToolNote>
        <p>
          A grade is assigned to the highest band whose lowest percentage is reached. Marks in any
          currency of effort — essays, practicals, decimals — all work, because only the ratio
          matters. Nothing here is sent to a server.
        </p>
      </ToolNote>
    </div>
  );
}
