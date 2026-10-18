import { useMemo, useState } from "react";
import {
  CURRENCIES,
  computeBudget,
  formatMoney,
  formatPercent,
  getCurrency,
  parseAmountInput,
  planToPlainText,
  type CurrencyId,
  type ExpenseLine,
} from "~/lib/calc/budget";
import { copyToClipboard } from "~/lib/download";
import { Checkbox, Field, ResultArea, StatRow, ToolNote } from "./fields";

type Row = { id: string; name: string; amount: string };
type Feedback = { state: "idle" | "ok" | "error"; message: string };

const IDLE: Feedback = { state: "idle", message: "" };

let nextId = 1;
const newRow = (name = "", amount = ""): Row => ({ id: `row-${nextId++}`, name, amount });

const START_ROWS: Row[] = [
  { id: "row-start-1", name: "Rent or housing", amount: "" },
  { id: "row-start-2", name: "Food", amount: "" },
  { id: "row-start-3", name: "Travel", amount: "" },
];

export function BudgetPlanner() {
  const [currencyId, setCurrencyId] = useState<CurrencyId>("INR");
  const [incomeRaw, setIncomeRaw] = useState("");
  const [rows, setRows] = useState<Row[]>(START_ROWS);
  const [goalOn, setGoalOn] = useState(false);
  const [goalRaw, setGoalRaw] = useState("");
  const [feedback, setFeedback] = useState<Feedback>(IDLE);

  const currency = getCurrency(currencyId);
  const income = parseAmountInput(incomeRaw);
  const goal = parseAmountInput(goalRaw);

  const parsedRows = rows.map((row) => ({ row, parsed: parseAmountInput(row.amount) }));

  const result = useMemo(
    () =>
      computeBudget({
        income: income.value ?? 0,
        expenses: parsedRows
          .filter(({ parsed }) => parsed.value !== null && parsed.value > 0)
          .map<ExpenseLine>(({ row, parsed }) => ({
            id: row.id,
            name: row.name.trim() === "" ? "Unnamed expense" : row.name.trim(),
            amount: parsed.value as number,
          })),
        savingsGoal: goalOn ? (goal.value ?? 0) : null,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [income.value, goalOn, goal.value, rows.map((row) => row.amount).join("|"), rows.map((row) => row.name).join("|")],
  );

  const updateRow = (id: string, patch: Partial<Row>) => {
    setRows((current) => current.map((row) => (row.id === id ? { ...row, ...patch } : row)));
    setFeedback(IDLE);
  };

  const copyPlan = async () => {
    const outcome = await copyToClipboard(planToPlainText(result, currencyId));
    setFeedback(
      outcome.ok
        ? { state: "ok", message: "The plan is on your clipboard, ready to paste anywhere." }
        : { state: "error", message: `${outcome.message} Nothing was saved automatically either.` },
    );
  };

  return (
    <div className="min-w-0">
      <div className="grid min-w-0 gap-4 sm:grid-cols-2">
        <Field id="budget-currency" label="Currency">
          <select
            id="budget-currency"
            name="budget-currency"
            value={currencyId}
            onChange={(event) => setCurrencyId(event.target.value as CurrencyId)}
            className="min-h-11 w-full min-w-0 rounded-card border border-line bg-surface px-4 py-3 text-sm text-ink focus:border-accent focus:outline-none"
          >
            {CURRENCIES.map((entry) => (
              <option key={entry.id} value={entry.id}>
                {entry.label}
              </option>
            ))}
          </select>
        </Field>

        <Field
          id="budget-income"
          label="Monthly income"
          hint={`What comes in each month, in ${currency.label}. Percentages of income appear once this is above zero.`}
          error={income.error ?? undefined}
        >
          <input
            id="budget-income"
            name="budget-income"
            type="text"
            inputMode="decimal"
            autoComplete="off"
            placeholder="45000"
            value={incomeRaw}
            aria-invalid={income.error ? true : undefined}
            aria-describedby={income.error ? "budget-income-error" : "budget-income-hint"}
            onChange={(event) => {
              setIncomeRaw(event.target.value);
              setFeedback(IDLE);
            }}
            className={`field ${income.error ? "border-danger" : ""}`}
          />
        </Field>
      </div>

      <section className="mt-6 min-w-0">
        <h3 className="text-sm font-medium text-ink">Monthly expenses</h3>
        <p className="mt-1 text-xs leading-relaxed text-muted">
          Name each expense and put an amount beside it. Amounts are never negative, and blank rows
          are ignored rather than treated as zero-with-a-name.
        </p>

        <ul className="mt-3 space-y-3">
          {parsedRows.map(({ row, parsed }, index) => (
            <li key={row.id} className="rounded-card border border-line bg-surface-2 p-3 sm:p-4">
              <div className="grid min-w-0 gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-start">
                <div className="min-w-0">
                  <label
                    htmlFor={`${row.id}-name`}
                    className="block text-xs font-medium text-muted"
                  >
                    Expense {index + 1} name
                  </label>
                  <input
                    id={`${row.id}-name`}
                    name={`${row.id}-name`}
                    type="text"
                    autoComplete="off"
                    value={row.name}
                    onChange={(event) => updateRow(row.id, { name: event.target.value })}
                    className="field mt-1"
                  />
                </div>
                <div className="min-w-0">
                  <label
                    htmlFor={`${row.id}-amount`}
                    className="block text-xs font-medium text-muted"
                  >
                    Amount ({currency.symbol})
                  </label>
                  <input
                    id={`${row.id}-amount`}
                    name={`${row.id}-amount`}
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    value={row.amount}
                    aria-invalid={parsed.error ? true : undefined}
                    aria-describedby={parsed.error ? `${row.id}-amount-error` : undefined}
                    onChange={(event) => updateRow(row.id, { amount: event.target.value })}
                    className={`field mt-1 ${parsed.error ? "border-danger" : ""}`}
                  />
                </div>
                <div className="flex min-w-0 items-end sm:pt-5">
                  <button
                    type="button"
                    className="btn btn-secondary min-h-11 w-full sm:w-auto"
                    onClick={() => {
                      setRows((current) => current.filter((entry) => entry.id !== row.id));
                      setFeedback(IDLE);
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
              {parsed.error ? (
                <p
                  id={`${row.id}-amount-error`}
                  role="alert"
                  className="mt-1.5 text-sm font-medium text-danger"
                >
                  {parsed.error}
                </p>
              ) : null}
            </li>
          ))}
        </ul>

        <button
          type="button"
          className="btn btn-secondary mt-3"
          onClick={() => setRows((current) => [...current, newRow()])}
        >
          Add an expense
        </button>
      </section>

      <section className="mt-6 min-w-0">
        <Checkbox
          id="budget-goal-on"
          checked={goalOn}
          onChange={(checked) => {
            setGoalOn(checked);
            setFeedback(IDLE);
          }}
          label="I have a monthly savings goal"
          hint="Optional. Give the amount you want to have left over each month and the planner says whether this plan reaches it."
        />
        {goalOn ? (
          <div className="mt-3 max-w-sm">
            <Field
              id="budget-goal"
              label={`Savings goal (${currency.symbol} per month)`}
              error={goal.error ?? undefined}
            >
              <input
                id="budget-goal"
                name="budget-goal"
                type="text"
                inputMode="decimal"
                autoComplete="off"
                placeholder="15000"
                value={goalRaw}
                aria-invalid={goal.error ? true : undefined}
                aria-describedby={goal.error ? "budget-goal-error" : undefined}
                onChange={(event) => {
                  setGoalRaw(event.target.value);
                  setFeedback(IDLE);
                }}
                className={`field ${goal.error ? "border-danger" : ""}`}
              />
            </Field>
          </div>
        ) : null}
      </section>

      <div className="mt-4 flex flex-wrap gap-3">
        <button type="button" className="btn btn-primary" onClick={copyPlan}>
          Copy the plan as text
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => {
            setRows([]);
            setIncomeRaw("");
            setGoalRaw("");
            setGoalOn(false);
            setFeedback({ state: "ok", message: "Every figure on this page has been cleared." });
          }}
        >
          Clear everything
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

      <ResultArea heading="Your month">
        <div className="grid min-w-0 gap-4 sm:grid-cols-3">
          <Total label="Total expenses" value={formatMoney(result.totalExpenses, currencyId)} />
          <Total
            label="Left over"
            value={formatMoney(result.remaining, currencyId)}
            tone={result.overBudget ? "bad" : "good"}
          />
          <Total
            label="Share of income allocated"
            value={
              result.allocatedPercent === null ? "Needs income" : formatPercent(result.allocatedPercent)
            }
          />
        </div>

        <dl className="mt-4 min-w-0 rounded-card border border-line bg-surface-2 p-4 sm:p-5">
          <StatRow label="Monthly income" value={formatMoney(result.income, currencyId)} />
          <StatRow
            label="Share of income left over"
            value={
              result.remainingPercent === null
                ? "Not available — a percentage of income needs a non-zero income"
                : formatPercent(result.remainingPercent)
            }
            hint="Left over ÷ income × 100. With no income entered there is nothing to divide by, so this stays blank rather than showing NaN or infinity."
          />
          <StatRow
            label="Expenses above or below income"
            value={
              result.overBudget
                ? `${formatMoney(Math.abs(result.remaining), currencyId)} short this month`
                : `${formatMoney(result.remaining, currencyId)} uncommitted`
            }
          />
        </dl>

        {result.breakdown.length > 0 ? (
          <div className="mt-4 min-w-0">
            <h4 className="text-sm font-semibold text-ink">By category</h4>
            <ul className="mt-2 space-y-2">
              {result.breakdown.map((row) => (
                <li key={row.id} className="rounded-card border border-line bg-surface-2 p-3">
                  <div className="flex min-w-0 flex-wrap items-baseline justify-between gap-2">
                    <span className="text-sm font-semibold break-words text-ink">{row.name}</span>
                    <span className="font-mono text-sm text-ink">
                      {formatMoney(row.amount, currencyId)}
                    </span>
                  </div>
                  <div
                    aria-hidden="true"
                    className="mt-2 h-2 w-full overflow-hidden rounded-pill bg-surface-3"
                  >
                    <div
                      className="h-full rounded-pill bg-accent"
                      style={{ width: `${Math.min(100, row.shareOfExpenses ?? 0).toFixed(1)}%` }}
                    />
                  </div>
                  <p className="mt-1.5 text-xs leading-relaxed break-words text-muted">
                    {row.shareOfExpenses === null
                      ? "No expenses to share."
                      : `${formatPercent(row.shareOfExpenses)} of your expenses`}
                    {row.shareOfIncome === null
                      ? " · share of income needs income"
                      : ` · ${formatPercent(row.shareOfIncome)} of income`}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="mt-4 rounded-card border border-dashed border-line-strong bg-surface-2 px-4 py-5 text-sm leading-relaxed text-muted">
            No expense rows with an amount yet, so there is nothing to break down.
          </p>
        )}

        {result.goal ? (
          <div
            data-goal-state
            className="mt-4 min-w-0 rounded-card border border-line bg-surface-2 p-4 sm:p-5"
          >
            <p className="eyebrow">Savings goal</p>
            <p className="mt-2 text-sm font-semibold text-ink">
              {result.goal.reached
                ? `Goal reached — ${formatMoney(result.goal.target, currencyId)} saved this month${
                    result.goal.surplus > 0
                      ? `, ${formatMoney(result.goal.surplus, currencyId)} above the goal`
                      : ""
                  }.`
                : `Not reached yet — ${formatMoney(result.goal.stillNeeded, currencyId)} still needed to hit ${formatMoney(result.goal.target, currencyId)}.`}
            </p>
            <div
              aria-hidden="true"
              className="mt-3 h-2 w-full overflow-hidden rounded-pill bg-surface-3"
            >
              <div
                className="h-full rounded-pill bg-accent"
                style={{ width: `${result.goal.progressPercent.toFixed(1)}%` }}
              />
            </div>
            <p className="mt-2 text-xs leading-relaxed text-muted">
              {formatPercent(result.goal.rawPercent)} of the goal is covered by what is left over.
              The bar stops at 100%.
            </p>
          </div>
        ) : null}

        {result.notes.length > 0 ? (
          <ul className="mt-4 space-y-2">
            {result.notes.map((note) => (
              <li
                key={note}
                className="rounded-card border border-line bg-surface-2 px-4 py-3 text-sm leading-relaxed break-words text-muted"
              >
                {note}
              </li>
            ))}
          </ul>
        ) : null}
      </ResultArea>

      <ToolNote>
        <p>
          <strong>Nothing is saved and nothing is sent.</strong> Not to us and not to any bank: this
          page has no connection to any account and asks for no credentials. Your income and expenses
          live in this browser tab only, are gone when you close or reload the page, and are not
          stored in the browser either — there is no saved copy to clear. Use “Copy the plan as text”
          before you close the page if you want to keep it.
        </p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>
            <strong>Total expenses</strong> is the sum of every row with an amount. Blank rows and
            zero rows are left out of the arithmetic.
          </li>
          <li>
            <strong>Left over</strong> is income − total expenses. A negative figure is a shortfall
            this month, shown as a negative number rather than hidden.
          </li>
          <li>
            <strong>Share of income</strong> is a percentage of your income, so it needs a non-zero
            income: with an empty or zero income the money totals still work and the percentages say
            “needs income” instead of showing infinity.
          </li>
          <li>
            <strong>Negative amounts are rejected.</strong> An expense of −500 would quietly reduce
            your other expenses, so the box refuses it and asks for a number of zero or more.
          </li>
          <li>
            <strong>This is arithmetic, not advice.</strong> No investments, no products, no
            recommendations — just what is left over.
          </li>
        </ul>
      </ToolNote>
    </div>
  );
}

function Total({
  label,
  value,
  tone = "plain",
}: {
  label: string;
  value: string;
  tone?: "plain" | "good" | "bad";
}) {
  const colour = tone === "bad" ? "text-danger" : "text-ink";
  return (
    <div className="min-w-0 rounded-card border border-line bg-surface-2 p-4 sm:p-5">
      <p className="eyebrow">{label}</p>
      <p className={`mt-2 font-mono text-xl font-semibold break-words sm:text-2xl ${colour}`}>
        {value}
      </p>
    </div>
  );
}
