/**
 * Grade calculator — subject rows in, totals, overall percentage and a letter
 * grade out, using a grading scale the visitor can edit.
 *
 * All arithmetic is pure: the UI only passes strings in and renders what comes
 * back, including field-level error messages.
 */

import { formatNumber, parseNumber } from "./number";

export type GradeBand = {
  id: string;
  label: string;
  /** Lowest percentage that earns this grade, as typed by the visitor. */
  minPercent: string;
};

/**
 * Example bands only — real scales differ between schools, boards, states and
 * countries, and the page says so and lets the visitor edit every number.
 */
export const DEFAULT_GRADE_BANDS: GradeBand[] = [
  { id: "band-a", label: "A", minPercent: "90" },
  { id: "band-b", label: "B", minPercent: "80" },
  { id: "band-c", label: "C", minPercent: "70" },
  { id: "band-d", label: "D", minPercent: "60" },
  { id: "band-e", label: "E", minPercent: "50" },
  { id: "band-f", label: "F", minPercent: "0" },
];

export type SubjectRow = {
  id: string;
  name: string;
  obtained: string;
  maximum: string;
};

export type RowErrors = { obtained?: string; maximum?: string };
export type BandErrors = { label?: string; minPercent?: string };

export type GradedRow = {
  id: string;
  /** Typed name, or "Subject 3" when the name was left blank. */
  name: string;
  obtained: number;
  maximum: number;
  percent: number;
  grade: string;
  bandPercent: number;
};

export type GradeSuccess = {
  ok: true;
  rows: GradedRow[];
  totalObtained: number;
  totalMaximum: number;
  overallPercent: number;
  grade: string;
  bandPercent: number;
  /** Rows left completely blank, which were not counted. */
  skippedRows: number;
};

export type GradeFailure = {
  ok: false;
  error: string;
  rows: Record<string, RowErrors>;
  bands: Record<string, BandErrors>;
};

export type GradeOutcome = GradeSuccess | GradeFailure;

export type ParsedBand = { id: string; label: string; minPercent: number };

/** Validates the editable scale and sorts it from highest to lowest. */
export function parseBands(bands: GradeBand[]):
  | { ok: true; value: ParsedBand[] }
  | { ok: false; errors: Record<string, BandErrors>; message: string } {
  const errors: Record<string, BandErrors> = {};
  const parsed: ParsedBand[] = [];

  if (bands.length === 0) {
    return {
      ok: false,
      errors,
      message: "Add at least one grade band — a scale with no bands cannot grade anything.",
    };
  }

  bands.forEach((band, index) => {
    const rowErrors: BandErrors = {};
    const label = band.label.trim();
    if (label === "") {
      rowErrors.label = `Band ${index + 1} needs a grade label, such as "B+".`;
    }
    const min = parseNumber(band.minPercent, "lowest percentage");
    if (!min.ok) {
      rowErrors.minPercent = "Enter the lowest percentage for this band.";
    } else if (min.value < 0 || min.value > 100) {
      rowErrors.minPercent = "A grade band must start between 0% and 100%.";
    }
    if (Object.keys(rowErrors).length > 0) {
      errors[band.id] = rowErrors;
      return;
    }
    parsed.push({ id: band.id, label, minPercent: (min as { value: number }).value });
  });

  if (Object.keys(errors).length > 0) {
    return {
      ok: false,
      errors,
      message: "Fix the highlighted grading-scale rows to see a grade.",
    };
  }

  parsed.sort((a, b) => b.minPercent - a.minPercent);
  return { ok: true, value: parsed };
}

/** The band with the highest starting percentage that `percent` reaches. */
export function gradeForPercent(percent: number, bands: ParsedBand[]): ParsedBand | null {
  if (bands.length === 0) return null;
  for (const band of bands) {
    if (percent >= band.minPercent) return band;
  }
  // Below every band (possible if the lowest band starts above 0%): keep the
  // lowest band, so the visitor always sees a grade rather than nothing.
  return bands[bands.length - 1];
}

export function computeGrades(rows: SubjectRow[], bands: GradeBand[]): GradeOutcome {
  const parsedBands = parseBands(bands);
  const rowErrors: Record<string, RowErrors> = {};
  const graded: {
    id: string;
    name: string;
    obtained: number;
    maximum: number;
  }[] = [];
  let skippedRows = 0;

  rows.forEach((row, index) => {
    const name = row.name.trim() || `Subject ${index + 1}`;
    const obtainedRaw = row.obtained.trim();
    const maximumRaw = row.maximum.trim();

    if (obtainedRaw === "" && maximumRaw === "") {
      // Nothing entered for this subject: not counted, and not an error.
      if (row.name.trim() !== "") skippedRows += 1;
      return;
    }

    const errors: RowErrors = {};
    const obtained = parseNumber(obtainedRaw, "marks obtained");
    const maximum = parseNumber(maximumRaw, "maximum marks");

    let obtainedValue: number | null = null;
    let maximumValue: number | null = null;

    if (obtainedRaw === "") {
      errors.obtained = "Enter the marks obtained, or clear this row.";
    } else if (!obtained.ok) {
      errors.obtained = obtained.error;
    } else if (obtained.value < 0) {
      errors.obtained = "Marks obtained cannot be negative.";
    } else {
      obtainedValue = obtained.value;
    }

    if (maximumRaw === "") {
      errors.maximum = "Enter the maximum marks for this subject.";
    } else if (!maximum.ok) {
      errors.maximum = maximum.error;
    } else if (maximum.value <= 0) {
      errors.maximum = "Maximum marks must be greater than 0.";
    } else {
      maximumValue = maximum.value;
    }

    if (
      obtainedValue !== null &&
      maximumValue !== null &&
      Object.keys(errors).length === 0 &&
      obtainedValue > maximumValue
    ) {
      errors.maximum = `Marks obtained (${formatNumber(obtainedValue)}) cannot be more than the maximum (${formatNumber(
        maximumValue,
      )}).`;
    }

    if (Object.keys(errors).length > 0 || obtainedValue === null || maximumValue === null) {
      rowErrors[row.id] = errors;
      return;
    }

    graded.push({ id: row.id, name, obtained: obtainedValue, maximum: maximumValue });
  });

  const rowErrorCount = Object.keys(rowErrors).length;

  if (rowErrorCount > 0 || !parsedBands.ok) {
    const messages: string[] = [];
    if (rowErrorCount > 0) {
      messages.push(
        rowErrorCount === 1
          ? "One subject row needs fixing before the totals can be worked out."
          : `${rowErrorCount} subject rows need fixing before the totals can be worked out.`,
      );
    }
    if (!parsedBands.ok) messages.push(parsedBands.message);
    return {
      ok: false,
      error: messages.join(" "),
      rows: rowErrors,
      bands: parsedBands.ok ? {} : parsedBands.errors,
    };
  }

  if (graded.length === 0) {
    return {
      ok: false,
      error:
        "Enter at least one subject with its marks obtained and maximum marks — blank rows are not counted.",
      rows: {},
      bands: {},
    };
  }

  const totalObtained = graded.reduce((sum, row) => sum + row.obtained, 0);
  const totalMaximum = graded.reduce((sum, row) => sum + row.maximum, 0);
  const overallPercent = (totalObtained / totalMaximum) * 100;
  const overall = gradeForPercent(overallPercent, parsedBands.value);

  return {
    ok: true,
    rows: graded.map((row) => {
      const percent = (row.obtained / row.maximum) * 100;
      const band = gradeForPercent(percent, parsedBands.value);
      return {
        id: row.id,
        name: row.name,
        obtained: row.obtained,
        maximum: row.maximum,
        percent,
        grade: band?.label ?? "—",
        bandPercent: band?.minPercent ?? 0,
      };
    }),
    totalObtained,
    totalMaximum,
    overallPercent,
    grade: overall?.label ?? "—",
    bandPercent: overall?.minPercent ?? 0,
    skippedRows,
  };
}
