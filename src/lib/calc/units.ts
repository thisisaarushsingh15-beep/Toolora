/**
 * Unit conversion — pure arithmetic on exact defined factors, no DOM.
 *
 * Every category except temperature is a single multiplication: each unit stores
 * its value in the category's base unit, so converting is
 *
 *   result = value × from.factor ÷ to.factor
 *
 * The factors are exact by definition (0.0254 m per inch, 0.45359237 kg per pound,
 * 0.3048 m per foot …) — they are the international definitions, not approximations.
 *
 * Temperature is NOT a multiplication: it is an offset scale, so each unit has an
 * explicit formula into and out of Celsius, the base:
 *
 *   °F → °C:  (°F − 32) × 5/9        °C → °F:  °C × 9/5 + 32
 *   K  → °C:  K − 273.15            °C → K :  °C + 273.15
 *
 * Displayed results are rounded (10 significant digits) — see formatNumber.
 */

export type CategoryId = "length" | "mass" | "temperature" | "area" | "volume" | "speed";

export type UnitDef = {
  id: string;
  name: string;
  symbol: string;
  /** Exact value of one of this unit, expressed in the category's base unit. */
  factor: number;
};

export type UnitCategory = {
  id: CategoryId;
  name: string;
  baseSymbol: string;
  /** True for temperature, which uses offset formulas rather than factors. */
  offsetScale: boolean;
  units: UnitDef[];
};

export const CATEGORIES: UnitCategory[] = [
  {
    id: "length",
    name: "Length",
    baseSymbol: "m",
    offsetScale: false,
    units: [
      { id: "mm", name: "millimetre", symbol: "mm", factor: 0.001 },
      { id: "cm", name: "centimetre", symbol: "cm", factor: 0.01 },
      { id: "m", name: "metre", symbol: "m", factor: 1 },
      { id: "km", name: "kilometre", symbol: "km", factor: 1000 },
      { id: "in", name: "inch", symbol: "in", factor: 0.0254 },
      { id: "ft", name: "foot", symbol: "ft", factor: 0.3048 },
      { id: "yd", name: "yard", symbol: "yd", factor: 0.9144 },
      { id: "mi", name: "mile", symbol: "mi", factor: 1609.344 },
      { id: "nmi", name: "nautical mile", symbol: "nmi", factor: 1852 },
    ],
  },
  {
    id: "mass",
    name: "Weight / mass",
    baseSymbol: "kg",
    offsetScale: false,
    units: [
      { id: "mg", name: "milligram", symbol: "mg", factor: 0.000001 },
      { id: "g", name: "gram", symbol: "g", factor: 0.001 },
      { id: "kg", name: "kilogram", symbol: "kg", factor: 1 },
      { id: "t", name: "tonne", symbol: "t", factor: 1000 },
      { id: "oz", name: "ounce", symbol: "oz", factor: 0.028349523125 },
      { id: "lb", name: "pound", symbol: "lb", factor: 0.45359237 },
      { id: "st", name: "stone", symbol: "st", factor: 6.35029318 },
      { id: "uston", name: "US ton (short)", symbol: "ton (US)", factor: 907.18474 },
    ],
  },
  {
    id: "temperature",
    name: "Temperature",
    baseSymbol: "°C",
    offsetScale: true,
    units: [
      { id: "c", name: "degree Celsius", symbol: "°C", factor: Number.NaN },
      { id: "f", name: "degree Fahrenheit", symbol: "°F", factor: Number.NaN },
      { id: "k", name: "kelvin", symbol: "K", factor: Number.NaN },
    ],
  },
  {
    id: "area",
    name: "Area",
    baseSymbol: "m²",
    offsetScale: false,
    units: [
      { id: "mm2", name: "square millimetre", symbol: "mm²", factor: 0.000001 },
      { id: "cm2", name: "square centimetre", symbol: "cm²", factor: 0.0001 },
      { id: "m2", name: "square metre", symbol: "m²", factor: 1 },
      { id: "ha", name: "hectare", symbol: "ha", factor: 10000 },
      { id: "km2", name: "square kilometre", symbol: "km²", factor: 1000000 },
      { id: "in2", name: "square inch", symbol: "in²", factor: 0.00064516 },
      { id: "ft2", name: "square foot", symbol: "ft²", factor: 0.09290304 },
      { id: "yd2", name: "square yard", symbol: "yd²", factor: 0.83612736 },
      { id: "acre", name: "acre", symbol: "acre", factor: 4046.8564224 },
      { id: "mi2", name: "square mile", symbol: "mi²", factor: 2589988.110336 },
    ],
  },
  {
    id: "volume",
    name: "Volume",
    baseSymbol: "L",
    offsetScale: false,
    units: [
      { id: "ml", name: "millilitre", symbol: "mL", factor: 0.001 },
      { id: "l", name: "litre", symbol: "L", factor: 1 },
      { id: "m3", name: "cubic metre", symbol: "m³", factor: 1000 },
      { id: "tsp", name: "teaspoon (US)", symbol: "tsp", factor: 0.00492892159375 },
      { id: "tbsp", name: "tablespoon (US)", symbol: "tbsp", factor: 0.01478676478125 },
      { id: "floz", name: "fluid ounce (US)", symbol: "fl oz", factor: 0.0295735295625 },
      { id: "cup", name: "cup (US)", symbol: "cup", factor: 0.2365882365 },
      { id: "pt", name: "pint (US)", symbol: "pt", factor: 0.473176473 },
      { id: "qt", name: "quart (US)", symbol: "qt", factor: 0.946352946 },
      { id: "gal", name: "gallon (US)", symbol: "gal (US)", factor: 3.785411784 },
      { id: "galuk", name: "gallon (imperial)", symbol: "gal (UK)", factor: 4.54609 },
    ],
  },
  {
    id: "speed",
    name: "Speed",
    baseSymbol: "m/s",
    offsetScale: false,
    units: [
      { id: "ms", name: "metre per second", symbol: "m/s", factor: 1 },
      { id: "kmh", name: "kilometre per hour", symbol: "km/h", factor: 1 / 3.6 },
      { id: "mph", name: "mile per hour", symbol: "mph", factor: 0.44704 },
      { id: "fts", name: "foot per second", symbol: "ft/s", factor: 0.3048 },
      { id: "knot", name: "knot", symbol: "kn", factor: 1852 / 3600 },
    ],
  },
];

export function getCategory(id: CategoryId): UnitCategory {
  const category = CATEGORIES.find((entry) => entry.id === id);
  if (!category) throw new Error(`Unknown unit category: ${id}`);
  return category;
}

export function getUnit(categoryId: CategoryId, unitId: string): UnitDef {
  const unit = getCategory(categoryId).units.find((entry) => entry.id === unitId);
  if (!unit) throw new Error(`Unknown unit: ${unitId} in ${categoryId}`);
  return unit;
}

/** The factors, as text, for the reference list on the page. */
export function factorLines(categoryId: CategoryId): string[] {
  const category = getCategory(categoryId);
  if (category.offsetScale) {
    return [
      "°F → °C: (°F − 32) × 5/9",
      "°C → °F: °C × 9/5 + 32",
      "K → °C: K − 273.15",
      "°C → K: °C + 273.15",
      "0 °C = 32 °F = 273.15 K (water freezes) · −40 °C = −40 °F",
    ];
  }
  return category.units
    .filter((unit) => unit.id !== baseId(category))
    .map((unit) => `1 ${unit.symbol} = ${formatNumber(unit.factor)} ${category.baseSymbol}`);
}

function baseId(category: UnitCategory): string {
  const base = category.units.reduce((best, unit) =>
    Math.abs(unit.factor - 1) < Math.abs(best.factor - 1) ? unit : best,
  );
  return base.id;
}

export function toCelsius(value: number, unitId: string): number {
  switch (unitId) {
    case "c":
      return value;
    case "f":
      return (value - 32) * (5 / 9);
    case "k":
      return value - 273.15;
    default:
      throw new Error(`Unknown temperature unit: ${unitId}`);
  }
}

export function fromCelsius(celsius: number, unitId: string): number {
  switch (unitId) {
    case "c":
      return celsius;
    case "f":
      return celsius * (9 / 5) + 32;
    case "k":
      return celsius + 273.15;
    default:
      throw new Error(`Unknown temperature unit: ${unitId}`);
  }
}

export function convert(value: number, fromId: string, toId: string, categoryId: CategoryId): number {
  const category = getCategory(categoryId);
  if (category.offsetScale) {
    return fromCelsius(toCelsius(value, fromId), toId);
  }
  const from = getUnit(categoryId, fromId);
  const to = getUnit(categoryId, toId);
  return (value * from.factor) / to.factor;
}

export type ParsedValue = { value: number | null; error: string | null };

/**
 * Validates the value box. Empty input is not an error, it is "nothing typed yet";
 * non-numeric text and non-finite values are errors. Negative values are only
 * allowed for temperature and speed, where they mean something.
 */
export function parseValueInput(raw: string, categoryId: CategoryId): ParsedValue {
  const trimmed = raw.trim();
  if (trimmed === "") return { value: null, error: null };
  const normalised = trimmed.replace(/,/g, "");
  if (!/^[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?$/.test(normalised)) {
    return { value: null, error: "Enter a number, for example 12.5." };
  }
  const value = Number(normalised);
  if (!Number.isFinite(value)) return { value: null, error: "That number is too large to convert." };
  const allowsNegative = categoryId === "temperature" || categoryId === "speed";
  if (value < 0 && !allowsNegative) {
    return { value: null, error: "Enter a value of zero or more — negative amounts are not physical here." };
  }
  return { value, error: null };
}

/**
 * Rounds to 10 significant digits and drops trailing noise, so 2.2046226218487757
 * reads as 2.204622622 while a small value such as 0.0000001234 survives instead
 * of being rounded away to 0.
 */
export function formatNumber(value: number, significantDigits = 10): string {
  if (!Number.isFinite(value)) return "—";
  if (value === 0) return "0";
  const abs = Math.abs(value);

  // Outside the range where a plain decimal stays readable and short.
  if (abs >= 1e15 || abs < 1e-12) {
    const [mantissa = "", exponent = "0"] = value.toExponential(6).split("e");
    return `${trimZeros(mantissa)}e${exponent}`;
  }

  // Small values: expand the decimal instead of switching to scientific notation,
  // so 0.0000001234 survives as written rather than being rounded away.
  if (abs < 1e-6) {
    const decimals = Math.min(20, Math.max(0, significantDigits - 1 - Math.floor(Math.log10(abs))));
    return trimZeros(value.toFixed(decimals));
  }

  return String(Number(value.toPrecision(significantDigits)));
}

function trimZeros(value: string): string {
  return value.includes(".")
    ? value.replace(/(\.\d*?)0+$/, "$1").replace(/\.$/, "")
    : value;
}

export function formatResult(value: number, unit: UnitDef): string {
  return `${formatNumber(value)} ${unit.symbol}`;
}
