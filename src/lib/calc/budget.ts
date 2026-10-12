/**
 * Budget planner maths — pure arithmetic, no DOM and no storage.
 *
 * Rules:
 * - Nothing is persisted. The figures live in React state for as long as the page
 *   is open and are gone when it closes; nothing is sent anywhere.
 * - Percentages need income. With zero income the totals are still exact (total
 *   expenses, what is left over) but every "share of income" figure is reported as
 *   unavailable rather than Infinity or NaN.
 * - Amounts are never negative: the parser rejects a minus sign.
 */

export type CurrencyId = "INR" | "USD" | "EUR" | "GBP";

export type Currency = {
  id: CurrencyId;
  symbol: string;
  label: string;
  /** Default monthly income used by the example button, in this currency. */
  exampleIncome: number;
};

export const CURRENCIES: Currency[] = [
  { id: "INR", symbol: "₹", label: "Indian rupee (INR ₹)", exampleIncome: 45000 },
  { id: "USD", symbol: "$", label: "US dollar (USD $)", exampleIncome: 3000 },
  { id: "EUR", symbol: "€", label: "Euro (EUR €)", exampleIncome: 2800 },
  { id: "GBP", symbol: "£", label: "Pound sterling (GBP £)", exampleIncome: 2500 },
];

export function getCurrency(id: CurrencyId): Currency {
  return CURRENCIES.find((currency) => currency.id === id) ?? CURRENCIES[0]!;
}

export function roundMoney(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.round(value * 100) / 100;
}

/** Deterministic money formatting: symbol, thousands separators, at most 2 decimals. */
export function formatMoney(amount: number, currencyId: CurrencyId): string {
  const currency = getCurrency(currencyId);
  if (!Number.isFinite(amount)) return `${currency.symbol}—`;
  const negative = amount < 0;
  const abs = Math.abs(roundMoney(amount));
  const [whole = "0", fraction = "00"] = abs.toFixed(2).split(".");
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const body = fraction === "00" ? grouped : `${grouped}.${fraction}`;
  return `${negative ? "-" : ""}${currency.symbol}${body}`;
}

export function formatPercent(value: number, digits = 1): string {
  if (!Number.isFinite(value)) return "—";
  return `${value.toFixed(digits)}%`;
}

export type ParsedAmount = { value: number | null; error: string | null };

/** Empty is "nothing typed" (error stays null); negatives and text are errors. */
export function parseAmountInput(raw: string): ParsedAmount {
  const trimmed = raw.trim();
  if (trimmed === "") return { value: null, error: null };
  const normalised = trimmed.replace(/[,\s]/g, "");
  if (normalised.startsWith("-")) return { value: null, error: "Amounts cannot be negative." };
  if (!/^\+?(\d+\.?\d*|\.\d+)$/.test(normalised)) {
    return { value: null, error: "Enter a number, for example 1500 or 1500.50." };
  }
  const value = Number(normalised);
  if (!Number.isFinite(value)) return { value: null, error: "That amount is too large." };
  if (value > 1_000_000_000_000) return { value: null, error: "That amount is too large." };
  return { value: roundMoney(value), error: null };
}

export type ExpenseLine = { id: string; name: string; amount: number };

export type BreakdownRow = {
  id: string;
  name: string;
  amount: number;
  /** Share of the total expenses, 0–100. Null when total expenses are zero. */
  shareOfExpenses: number | null;
  /** Share of income, 0–100. Null when income is zero. */
  shareOfIncome: number | null;
};

export type GoalResult = {
  target: number;
  reached: boolean;
  /** Money still to find after this month's expenses, floored at zero. */
  stillNeeded: number;
  /** What is left over minus the goal — positive means the goal is beaten. */
  surplus: number;
  /** Progress toward the goal, clamped 0–100 for a bar. */
  progressPercent: number;
  /** Unclamped progress, so "167%" is visible when the goal is passed. */
  rawPercent: number;
};

export type BudgetResult = {
  income: number;
  totalExpenses: number;
  remaining: number;
  hasIncome: boolean;
  overBudget: boolean;
  /** Expenses as a share of income. Null with zero income. */
  allocatedPercent: number | null;
  /** What is left as a share of income. Null with zero income. */
  remainingPercent: number | null;
  breakdown: BreakdownRow[];
  goal: GoalResult | null;
  /** Plain-language notes shown under the results. */
  notes: string[];
};

export type BudgetInput = {
  income: number;
  expenses: ExpenseLine[];
  savingsGoal: number | null;
};

export function computeBudget(input: BudgetInput): BudgetResult {
  const income = Number.isFinite(input.income) && input.income > 0 ? roundMoney(input.income) : 0;
  const expenses = input.expenses.filter(
    (line) => Number.isFinite(line.amount) && line.amount > 0,
  );
  const totalExpenses = roundMoney(expenses.reduce((sum, line) => sum + line.amount, 0));
  const remaining = roundMoney(income - totalExpenses);
  const hasIncome = income > 0;
  const notes: string[] = [];

  const allocatedPercent = hasIncome ? (totalExpenses / income) * 100 : null;
  const remainingPercent = hasIncome ? (remaining / income) * 100 : null;

  if (!hasIncome) {
    notes.push(
      "Percentages of income need income to divide by. Add a monthly income above and the shares appear — the money totals below are already exact.",
    );
  } else if (totalExpenses === 0) {
    notes.push("No expenses yet, so 100% of income is unallocated.");
  }

  const breakdown: BreakdownRow[] = expenses.map((line) => ({
    id: line.id,
    name: line.name,
    amount: roundMoney(line.amount),
    shareOfExpenses: totalExpenses > 0 ? (line.amount / totalExpenses) * 100 : null,
    shareOfIncome: hasIncome ? (line.amount / income) * 100 : null,
  }));

  let goal: GoalResult | null = null;
  if (input.savingsGoal !== null && Number.isFinite(input.savingsGoal) && input.savingsGoal > 0) {
    const target = roundMoney(input.savingsGoal);
    const stillNeeded = roundMoney(Math.max(0, target - remaining));
    const reached = remaining >= target;
    const rawPercent = (remaining / target) * 100;
    goal = {
      target,
      reached,
      stillNeeded,
      surplus: roundMoney(remaining - target),
      progressPercent: Math.min(100, Math.max(0, rawPercent)),
      rawPercent,
    };
    notes.push(
      reached
        ? "The savings goal is covered by what is left over this month."
        : "The savings goal is not covered yet by what is left over.",
    );
  }

  if (remaining < 0) {
    notes.push(
      "Expenses are higher than income: the shortfall is shown as a negative figure, not hidden.",
    );
  }

  return {
    income,
    totalExpenses,
    remaining,
    hasIncome,
    overBudget: remaining < 0,
    allocatedPercent,
    remainingPercent,
    breakdown,
    goal,
    notes,
  };
}

/** A plain-text copy of the plan, for saving outside the page. */
export function planToPlainText(result: BudgetResult, currencyId: CurrencyId): string {
  const lines = [
    `Monthly income: ${formatMoney(result.income, currencyId)}`,
    ...result.breakdown.map(
      (row) => `${row.name || "Unnamed expense"}: ${formatMoney(row.amount, currencyId)}`,
    ),
    `Total expenses: ${formatMoney(result.totalExpenses, currencyId)}`,
    `Left over: ${formatMoney(result.remaining, currencyId)}`,
    result.allocatedPercent === null
      ? "Share of income allocated: not available (no income entered)"
      : `Share of income allocated: ${formatPercent(result.allocatedPercent)}`,
  ];
  if (result.goal) {
    lines.push(
      `Savings goal: ${formatMoney(result.goal.target, currencyId)} — ${
        result.goal.reached
          ? "reached"
          : `${formatMoney(result.goal.stillNeeded, currencyId)} still needed`
      }`,
    );
  }
  return lines.join("\n");
}
