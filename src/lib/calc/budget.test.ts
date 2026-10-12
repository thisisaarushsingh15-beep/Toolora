import { describe, expect, test } from "bun:test";
import {
  CURRENCIES,
  computeBudget,
  formatMoney,
  formatPercent,
  parseAmountInput,
  planToPlainText,
  type ExpenseLine,
} from "./budget";

const line = (id: string, name: string, amount: number): ExpenseLine => ({ id, name, amount });

describe("zero and missing income never produces NaN or Infinity", () => {
  const result = computeBudget({
    income: 0,
    expenses: [line("1", "Rent", 15000), line("2", "Food", 8000)],
    savingsGoal: null,
  });

  test("totals stay exact", () => {
    expect(result.totalExpenses).toBe(23000);
    expect(result.remaining).toBe(-23000);
    expect(result.hasIncome).toBe(false);
    expect(result.overBudget).toBe(true);
  });

  test("percentage of income is reported as unavailable", () => {
    expect(result.allocatedPercent).toBeNull();
    expect(result.remainingPercent).toBeNull();
    expect(result.breakdown[0]!.shareOfIncome).toBeNull();
  });

  test("a note explains why the shares are missing", () => {
    expect(result.notes.join(" ")).toContain("Percentages of income need income");
  });

  test("shares of total expenses still work", () => {
    expect(result.breakdown[0]!.shareOfExpenses).toBeCloseTo(65.217, 2);
  });

  test("every number in the result is finite", () => {
    const numbers = [
      result.income,
      result.totalExpenses,
      result.remaining,
      ...result.breakdown.flatMap((row) => [row.amount, row.shareOfExpenses ?? 0]),
    ];
    expect(numbers.every((value) => Number.isFinite(value))).toBe(true);
  });

  test("a negative or non-finite income is treated as zero", () => {
    expect(computeBudget({ income: -500, expenses: [], savingsGoal: null }).income).toBe(0);
    expect(computeBudget({ income: Number.NaN, expenses: [], savingsGoal: null }).income).toBe(0);
    expect(computeBudget({ income: Infinity, expenses: [], savingsGoal: null }).remaining).toBe(0);
  });
});

describe("a normal month", () => {
  const result = computeBudget({
    income: 45000,
    expenses: [line("1", "Rent", 15000), line("2", "Food", 8000), line("3", "Travel", 3000)],
    savingsGoal: 15000,
  });

  test("matches the worked example on the page", () => {
    expect(result.totalExpenses).toBe(26000);
    expect(result.remaining).toBe(19000);
    expect(formatPercent(result.allocatedPercent!)).toBe("57.8%");
  });

  test("breakdown shares are consistent", () => {
    const shareSum = result.breakdown.reduce((sum, row) => sum + (row.shareOfExpenses ?? 0), 0);
    expect(shareSum).toBeCloseTo(100, 6);
    expect(result.breakdown[0]!.shareOfIncome).toBeCloseTo(33.333, 3);
  });

  test("no expense rows means nothing is allocated", () => {
    const empty = computeBudget({ income: 1000, expenses: [], savingsGoal: null });
    expect(empty.totalExpenses).toBe(0);
    expect(empty.allocatedPercent).toBe(0);
    expect(empty.remaining).toBe(1000);
  });

  test("negative or zero expense rows are ignored", () => {
    const mixed = computeBudget({
      income: 1000,
      expenses: [line("1", "Ok", 100), line("2", "Bad", -50), line("3", "Zero", 0)],
      savingsGoal: null,
    });
    expect(mixed.totalExpenses).toBe(100);
    expect(mixed.breakdown).toHaveLength(1);
  });
});

describe("savings goal", () => {
  test("reached", () => {
    const result = computeBudget({
      income: 45000,
      expenses: [line("1", "Rent", 26000)],
      savingsGoal: 15000,
    });
    expect(result.goal!.reached).toBe(true);
    expect(result.goal!.stillNeeded).toBe(0);
    expect(result.goal!.surplus).toBe(4000);
    expect(result.goal!.progressPercent).toBe(100);
    expect(result.goal!.rawPercent).toBeGreaterThan(100);
    expect(result.notes.join(" ")).toContain("covered");
  });

  test("not reached", () => {
    const result = computeBudget({
      income: 45000,
      expenses: [line("1", "Rent", 26000)],
      savingsGoal: 25000,
    });
    expect(result.goal!.reached).toBe(false);
    expect(result.goal!.stillNeeded).toBe(6000);
    expect(result.goal!.progressPercent).toBeCloseTo(76, 6);
    expect(result.notes.join(" ")).toContain("not covered yet");
  });

  test("no goal means no goal result", () => {
    expect(computeBudget({ income: 100, expenses: [], savingsGoal: null }).goal).toBeNull();
    expect(computeBudget({ income: 100, expenses: [], savingsGoal: 0 }).goal).toBeNull();
  });
});

describe("amount validation", () => {
  test("empty is not an error", () => {
    expect(parseAmountInput("  ")).toEqual({ value: null, error: null });
  });

  test("negative amounts are rejected", () => {
    const parsed = parseAmountInput("-500");
    expect(parsed.value).toBeNull();
    expect(parsed.error).toContain("cannot be negative");
  });

  test("text is rejected", () => {
    expect(parseAmountInput("lots").error).toContain("Enter a number");
  });

  test("separators and decimals are accepted and rounded to cents", () => {
    expect(parseAmountInput("1,500").value).toBe(1500);
    expect(parseAmountInput("1500.555").value).toBe(1500.56);
  });
});

describe("money formatting", () => {
  test("defaults to the rupee and groups thousands", () => {
    expect(formatMoney(45000, "INR")).toBe("₹45,000");
    expect(formatMoney(1500.5, "USD")).toBe("$1,500.50");
    expect(formatMoney(-23000, "EUR")).toBe("-€23,000");
  });

  test("all four currencies are offered and INR is the default", () => {
    expect(CURRENCIES.map((currency) => currency.id)).toEqual(["INR", "USD", "EUR", "GBP"]);
  });

  test("a plan can be copied as text", () => {
    const result = computeBudget({
      income: 45000,
      expenses: [line("1", "Rent", 26000)],
      savingsGoal: 15000,
    });
    const text = planToPlainText(result, "INR");
    expect(text).toContain("Total expenses: ₹26,000");
    expect(text).toContain("Left over: ₹19,000");
    expect(text).toContain("Savings goal: ₹15,000 — reached");
  });

  test("the plain-text plan says so when income is missing", () => {
    const result = computeBudget({ income: 0, expenses: [line("1", "Rent", 100)], savingsGoal: null });
    expect(planToPlainText(result, "INR")).toContain("not available (no income entered)");
  });
});
