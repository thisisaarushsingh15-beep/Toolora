import { describe, expect, test } from "bun:test";
import {
  DEFAULT_GRADE_BANDS,
  type GradeBand,
  type SubjectRow,
  computeGrades,
  gradeForPercent,
  parseBands,
} from "./grade";

const row = (id: string, name: string, obtained: string, maximum: string): SubjectRow => ({
  id,
  name,
  obtained,
  maximum,
});

describe("computeGrades — normal cases", () => {
  test("totals, overall percentage and per-subject percentages", () => {
    const out = computeGrades(
      [row("1", "Maths", "85", "100"), row("2", "Physics", "72.5", "100"), row("3", "Chemistry", "63", "80")],
      DEFAULT_GRADE_BANDS,
    );
    expect(out.ok).toBe(true);
    if (out.ok) {
      expect(out.totalObtained).toBe(220.5);
      expect(out.totalMaximum).toBe(280);
      expect(Math.round(out.overallPercent * 1000) / 1000).toBe(78.75);
      expect(out.grade).toBe("C");
      expect(out.rows.map((r) => Math.round(r.percent))).toEqual([85, 73, 79]);
      expect(out.rows[0]!.grade).toBe("B");
      expect(out.rows[2]!.grade).toBe("C");
      expect(out.skippedRows).toBe(0);
    }
  });

  test("decimal marks and a single subject boundary", () => {
    const out = computeGrades([row("1", "Essay", "0.5", "2")], DEFAULT_GRADE_BANDS);
    expect(out.ok).toBe(true);
    if (out.ok) {
      expect(out.overallPercent).toBe(25);
      expect(out.grade).toBe("F");
      expect(out.rows[0]!.percent).toBe(25);
    }
  });

  test("zero marks still produces a grade", () => {
    const out = computeGrades([row("1", "Test", "0", "50")], DEFAULT_GRADE_BANDS);
    expect(out.ok).toBe(true);
    if (out.ok) expect(out.grade).toBe("F");
  });

  test("blank rows and blank names are ignored, and a name is optional", () => {
    const out = computeGrades(
      [row("1", "", "40", "50"), row("2", "", "", ""), row("3", "Only a name", "", "")],
      DEFAULT_GRADE_BANDS,
    );
    expect(out.ok).toBe(true);
    if (out.ok) {
      expect(out.rows).toHaveLength(1);
      expect(out.rows[0]!.name).toBe("Subject 1");
      expect(out.overallPercent).toBe(80);
      expect(out.skippedRows).toBe(1);
    }
  });
});

describe("computeGrades — editable grading scale", () => {
  test("custom bands change the grade", () => {
    const custom: GradeBand[] = [
      { id: "a", label: "Distinction", minPercent: "75" },
      { id: "b", label: "Pass", minPercent: "40" },
      { id: "c", label: "Fail", minPercent: "0" },
    ];
    const out = computeGrades([row("1", "Maths", "78", "100")], custom);
    expect(out.ok).toBe(true);
    if (out.ok) {
      expect(out.grade).toBe("Distinction");
      expect(out.rows[0]!.grade).toBe("Distinction");
    }
  });

  test("band order does not matter — they are sorted by percentage", () => {
    const unsorted: GradeBand[] = [
      { id: "b", label: "B", minPercent: "80" },
      { id: "a", label: "A", minPercent: "90" },
      { id: "f", label: "F", minPercent: "0" },
    ];
    const out = computeGrades([row("1", "Maths", "95", "100")], unsorted);
    expect(out.ok).toBe(true);
    if (out.ok) expect(out.grade).toBe("A");
  });

  test("a percentage below every band falls back to the lowest band", () => {
    const parsed = parseBands([
      { id: "a", label: "A", minPercent: "90" },
      { id: "b", label: "B", minPercent: "85" },
    ]);
    expect(parsed.ok).toBe(true);
    if (parsed.ok) expect(gradeForPercent(10, parsed.value)?.label).toBe("B");
  });

  test("invalid bands are reported per field", () => {
    const out = computeGrades([row("1", "Maths", "50", "100")], [
      { id: "a", label: "", minPercent: "90" },
      { id: "b", label: "B", minPercent: "abc" },
      { id: "c", label: "C", minPercent: "150" },
    ]);
    expect(out.ok).toBe(false);
    if (!out.ok) {
      expect(out.bands["a"]!.label).toContain("grade label");
      expect(out.bands["b"]!.minPercent).toContain("lowest percentage");
      expect(out.bands["c"]!.minPercent).toContain("between 0% and 100%");
    }
  });

  test("an empty scale is rejected", () => {
    const out = computeGrades([row("1", "Maths", "50", "100")], []);
    expect(out.ok).toBe(false);
    if (!out.ok) expect(out.error).toContain("at least one grade band");
  });
});

describe("computeGrades — validation", () => {
  test("maximum marks must be greater than zero", () => {
    const zero = computeGrades([row("1", "Maths", "10", "0")], DEFAULT_GRADE_BANDS);
    expect(zero.ok).toBe(false);
    if (!zero.ok) expect(zero.rows["1"]!.maximum).toContain("greater than 0");

    const negative = computeGrades([row("1", "Maths", "10", "-5")], DEFAULT_GRADE_BANDS);
    expect(negative.ok).toBe(false);
    if (!negative.ok) expect(negative.rows["1"]!.maximum).toContain("greater than 0");
  });

  test("marks obtained cannot exceed the maximum", () => {
    const out = computeGrades([row("1", "Maths", "95", "90")], DEFAULT_GRADE_BANDS);
    expect(out.ok).toBe(false);
    if (!out.ok) {
      expect(out.rows["1"]!.maximum).toContain("cannot be more than the maximum");
      expect(out.error).toContain("One subject row needs fixing");
    }
  });

  test("negative marks, missing halves and non-numeric input are caught", () => {
    const out = computeGrades(
      [row("1", "A", "-5", "100"), row("2", "B", "10", ""), row("3", "C", "", "50"), row("4", "D", "x", "10")],
      DEFAULT_GRADE_BANDS,
    );
    expect(out.ok).toBe(false);
    if (!out.ok) {
      expect(out.rows["1"]!.obtained).toContain("cannot be negative");
      expect(out.rows["2"]!.maximum).toContain("Enter the maximum marks");
      expect(out.rows["3"]!.obtained).toContain("clear this row");
      expect(out.rows["4"]!.obtained).toContain("marks obtained");
      expect(out.error).toContain("4 subject rows need fixing");
    }
  });

  test("no subjects at all is an explicit error, not 0%", () => {
    const out = computeGrades([row("1", "", "", ""), row("2", "", "", "")], DEFAULT_GRADE_BANDS);
    expect(out.ok).toBe(false);
    if (!out.ok) expect(out.error).toContain("at least one subject");
  });
});
