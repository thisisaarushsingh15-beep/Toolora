import { useMemo, useState, type ReactNode } from "react";
import {
  CATEGORIES,
  convert,
  factorLines,
  formatNumber,
  formatResult,
  getCategory,
  getUnit,
  parseValueInput,
  type CategoryId,
} from "~/lib/calc/units";
import { Field, ResultArea, ToolNote } from "./fields";

export function UnitConverter() {
  const [categoryId, setCategoryId] = useState<CategoryId>("length");
  const [fromId, setFromId] = useState("m");
  const [toId, setToId] = useState("ft");
  const [raw, setRaw] = useState("1");

  const category = getCategory(categoryId);
  const fromUnit = getUnit(categoryId, fromId);
  const toUnit = getUnit(categoryId, toId);
  const parsed = parseValueInput(raw, categoryId);
  const value = parsed.value;

  const result = useMemo(
    () => (value === null ? null : convert(value, fromId, toId, categoryId)),
    [value, fromId, toId, categoryId],
  );

  const pickCategory = (id: CategoryId) => {
    const next = getCategory(id);
    setCategoryId(id);
    setFromId(next.units[0]!.id);
    setToId(next.units[1]?.id ?? next.units[0]!.id);
  };

  const swap = () => {
    setFromId(toId);
    setToId(fromId);
  };

  return (
    <div className="min-w-0">
      <fieldset className="min-w-0">
        <legend className="text-sm font-medium text-ink">What are you converting?</legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {CATEGORIES.map((entry) => {
            const active = entry.id === categoryId;
            return (
              <button
                key={entry.id}
                type="button"
                id={`unit-category-${entry.id}`}
                aria-pressed={active}
                onClick={() => pickCategory(entry.id)}
                className={`chip min-h-11 ${active ? "chip-active" : ""}`}
              >
                {entry.name}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="mt-6 grid min-w-0 gap-4 sm:grid-cols-2">
        <Field
          id="unit-value"
          label="Value"
          hint={
            categoryId === "temperature"
              ? "Negative values are fine for temperature — try −40."
              : "Any number, including decimals such as 1.5."
          }
          error={parsed.error ?? undefined}
        >
          <input
            id="unit-value"
            name="unit-value"
            type="text"
            inputMode="decimal"
            autoComplete="off"
            value={raw}
            aria-invalid={parsed.error ? true : undefined}
            aria-describedby={parsed.error ? "unit-value-error" : undefined}
            onChange={(event) => setRaw(event.target.value)}
            className={`field ${parsed.error ? "border-danger" : ""}`}
          />
        </Field>

        <div className="flex min-w-0 items-end">
          <button type="button" className="btn btn-secondary min-h-11 w-full sm:w-auto" onClick={swap}>
            Swap units
          </button>
        </div>

        <Field id="unit-from" label="From">
          <select
            id="unit-from"
            name="unit-from"
            value={fromId}
            onChange={(event) => setFromId(event.target.value)}
            className="min-h-11 w-full min-w-0 rounded-card border border-line bg-surface px-4 py-3 text-sm text-ink focus:border-accent focus:outline-none"
          >
            {category.units.map((unit) => (
              <option key={unit.id} value={unit.id}>
                {unit.name} ({unit.symbol})
              </option>
            ))}
          </select>
        </Field>

        <Field id="unit-to" label="To">
          <select
            id="unit-to"
            name="unit-to"
            value={toId}
            onChange={(event) => setToId(event.target.value)}
            className="min-h-11 w-full min-w-0 rounded-card border border-line bg-surface px-4 py-3 text-sm text-ink focus:border-accent focus:outline-none"
          >
            {category.units.map((unit) => (
              <option key={unit.id} value={unit.id}>
                {unit.name} ({unit.symbol})
              </option>
            ))}
          </select>
        </Field>
      </div>

      <ResultArea heading="Converted value">
        {parsed.error ? (
          <EmptyState>
            Fix the value above and the conversion appears instantly. Nothing is calculated from a
            value that is not a number.
          </EmptyState>
        ) : value === null ? (
          <EmptyState>
            Enter a value above — the conversion updates as you type, and when you change either
            unit.
          </EmptyState>
        ) : (
          <div className="min-w-0">
            <div className="min-w-0 rounded-card border border-line bg-surface-2 p-4 sm:p-5">
              <p className="eyebrow">Result</p>
              <p
                data-unit-result
                className="mt-2 font-mono text-2xl font-semibold break-words text-ink sm:text-3xl"
              >
                {formatResult(result ?? 0, toUnit)}
              </p>
              <p className="mt-2 text-sm leading-relaxed break-words text-muted">
                {formatNumber(value)} {fromUnit.symbol} = {formatNumber(result ?? 0)}{" "}
                {toUnit.symbol}
                {categoryId === "temperature" ? " (offset scale, not a multiplication)" : ""}
              </p>
            </div>

            <p data-unit-rounded className="mt-3 text-xs leading-relaxed text-muted">
              Displayed results are rounded to 10 significant digits: {formatNumber(value)}{" "}
              {fromUnit.symbol} is {formatNumber(result ?? 0, 16)} {toUnit.symbol} before rounding.
              Small values keep their digits instead of being rounded away to zero.
            </p>

            <div className="mt-4 min-w-0 rounded-card border border-line bg-surface-2 p-4">
              <h4 className="text-sm font-semibold text-ink">
                {category.name} — {categoryId === "temperature" ? "formulas" : "exact factors"}
              </h4>
              <p className="mt-1 text-xs leading-relaxed text-muted">
                Everything below is measured against 1 {category.baseSymbol}
                {categoryId === "temperature" ? " (Celsius, the base scale)" : ""}.
              </p>
              <ul className="mt-2 space-y-1 font-mono text-xs leading-relaxed break-words text-ink">
                {factorLines(categoryId).map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </ResultArea>

      <ToolNote>
        <p>
          Every category except temperature is one exact multiplication: each unit is stored as its
          value in the category base unit — the metre, the kilogram, the square metre, the litre or
          the metre per second — and the conversion is{" "}
          <code>result = value × from ÷ to</code>. The factors are the international definitions, not
          approximations: 1 in = 0.0254 m, 1 lb = 0.45359237 kg, 1 acre = 4046.8564224 m², 1 US
          gallon = 3.785411784 L, 1 mph = 0.44704 m/s, 1 knot = 1852/3600 m/s.
        </p>
        <p>
          <strong>Temperature is never a multiplication.</strong> It is an offset scale, so it has
          its own formulas in both directions: °F → °C is (F − 32) × 5/9 and °C → °F is C × 9/5 + 32;
          K → °C is K − 273.15 and °C → K is C + 273.15. 100 °C is 212 °F, and −40 °C is −40 °F.
        </p>
        <p>
          The swap button exchanges the two units and reconverts immediately — the value you typed is
          left alone, so you can check a conversion in both directions. The value box accepts
          decimals and thousands separators, and it refuses non-numbers rather than guessing.
        </p>
        <p>Nothing is uploaded: the arithmetic runs in this page.</p>
      </ToolNote>
    </div>
  );
}

function EmptyState({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-card border border-dashed border-line-strong bg-surface-2 px-4 py-5 text-sm leading-relaxed text-muted">
      {children}
    </p>
  );
}
