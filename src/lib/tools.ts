import type { ComponentType } from "react";
import {
  IconAge,
  IconBudget,
  IconCalculator,
  IconCalendarRange,
  IconCase,
  IconConvert,
  IconDuplicate,
  IconGrade,
  IconPercent,
  IconTimer,
  IconWordCount,
} from "~/components/icons";

/** Inline SVG component reference — never a file path or an external image. */
export type ToolIcon = ComponentType<{ className?: string }>;

export type CategorySlug =
  | "calculators"
  | "student-tools"
  | "text-tools"
  | "date-and-time"
  | "converters"
  | "productivity"
  | "everyday-finance";

export type Tool = {
  /** Stable id, same value as the slug. */
  id: string;
  slug: string;
  name: string;
  /** One line, used on cards. */
  shortDescription: string;
  /** One sentence on what the finished tool actually does. */
  whatItDoes: string;
  category: CategorySlug;
  icon: ToolIcon;
  /** Synonyms and related words for site search. */
  keywords: string[];
  popular: boolean;
  /** Slugs of related tools, shown at the foot of each tool page. */
  related: string[];
};

export type Category = {
  slug: CategorySlug;
  name: string;
  description: string;
  icon: ToolIcon;
};

export const CATEGORIES: Category[] = [
  {
    slug: "calculators",
    name: "Calculators",
    description: "Everyday number crunching, with the working shown.",
    icon: IconCalculator,
  },
  {
    slug: "student-tools",
    name: "Student Tools",
    description: "For school and college work — grades, marks and study sessions.",
    icon: IconGrade,
  },
  {
    slug: "text-tools",
    name: "Text Tools",
    description: "Count, clean and reshape text without opening a document.",
    icon: IconWordCount,
  },
  {
    slug: "date-and-time",
    name: "Date and Time",
    description: "Work out ages and the exact gap between two dates.",
    icon: IconCalendarRange,
  },
  {
    slug: "converters",
    name: "Converters",
    description: "Switch between metric and imperial units, including temperature.",
    icon: IconConvert,
  },
  {
    slug: "productivity",
    name: "Productivity",
    description: "Stay on task and get a study session finished.",
    icon: IconTimer,
  },
  {
    slug: "everyday-finance",
    name: "Everyday Finance",
    description: "Plain money planning for a monthly budget.",
    icon: IconBudget,
  },
];

export const TOOLS: Tool[] = [
  {
    id: "percentage-calculator",
    slug: "percentage-calculator",
    name: "Percentage Calculator",
    shortDescription:
      "Work out percentages, increases, decreases and what one number is as a percent of another.",
    whatItDoes:
      "Answers the three questions people actually ask: what is X% of Y, what percent is X of Y, and what is the percent increase or decrease between two numbers.",
    category: "calculators",
    icon: IconPercent,
    keywords: [
      "percent",
      "percentage",
      "%",
      "of",
      "increase",
      "decrease",
      "discount",
      "markup",
      "difference",
      "part of a whole",
    ],
    popular: true,
    related: ["grade-calculator", "budget-planner", "unit-converter"],
  },
  {
    id: "grade-calculator",
    slug: "grade-calculator",
    name: "Grade Calculator",
    shortDescription:
      "Turn test and assignment scores into a course grade, weighted or unweighted.",
    whatItDoes:
      "Averages your scores across weighted or equal categories to give a course grade and a percentage, so you can see where a course stands.",
    category: "student-tools",
    icon: IconGrade,
    keywords: [
      "grade",
      "grades",
      "gpa",
      "marks",
      "score",
      "weighted average",
      "class",
      "exam",
      "assignment",
      "final grade",
    ],
    popular: false,
    related: ["percentage-calculator", "study-timer", "date-difference-calculator"],
  },
  {
    id: "age-calculator",
    slug: "age-calculator",
    name: "Age Calculator",
    shortDescription: "Find an exact age in years, months and days from any date of birth.",
    whatItDoes:
      "Counts complete years, months and days between a date of birth and today (or any other date), handling leap years and month lengths correctly.",
    category: "date-and-time",
    icon: IconAge,
    keywords: [
      "age",
      "how old",
      "birthday",
      "date of birth",
      "dob",
      "years months days",
      "next birthday",
    ],
    popular: true,
    related: ["date-difference-calculator", "percentage-calculator", "study-timer"],
  },
  {
    id: "date-difference-calculator",
    slug: "date-difference-calculator",
    name: "Date Difference Calculator",
    shortDescription:
      "Count the days, weeks and months between two dates, including working days.",
    whatItDoes:
      "Gives the gap between any two dates in days, weeks, months and years, with an optional count of weekdays only.",
    category: "date-and-time",
    icon: IconCalendarRange,
    keywords: [
      "date difference",
      "days between",
      "days until",
      "weeks between",
      "duration",
      "working days",
      "business days",
      "countdown",
    ],
    popular: false,
    related: ["age-calculator", "study-timer", "unit-converter"],
  },
  {
    id: "word-counter",
    slug: "word-counter",
    name: "Word & Character Counter",
    shortDescription: "Count words, characters, sentences and reading time as you type or paste.",
    whatItDoes:
      "Live counts of words, characters with and without spaces, sentences, paragraphs and an estimated reading time for the text in the box.",
    category: "text-tools",
    icon: IconWordCount,
    keywords: [
      "word count",
      "character count",
      "letter count",
      "sentences",
      "paragraphs",
      "reading time",
      "essay length",
      "text length",
    ],
    popular: true,
    related: ["text-case-converter", "remove-duplicate-lines", "study-timer"],
  },
  {
    id: "text-case-converter",
    slug: "text-case-converter",
    name: "Text Case Converter",
    shortDescription: "Change text to UPPER, lower, Title, Sentence or camelCase in one click.",
    whatItDoes:
      "Rewrites any block of text in the case style you pick — uppercase, lowercase, title case, sentence case, camelCase or snake_case — and keeps the rest of the text intact.",
    category: "text-tools",
    icon: IconCase,
    keywords: [
      "uppercase",
      "lowercase",
      "title case",
      "sentence case",
      "camelcase",
      "capitalize",
      "convert case",
      "change case",
    ],
    popular: false,
    related: ["word-counter", "remove-duplicate-lines", "unit-converter"],
  },
  {
    id: "remove-duplicate-lines",
    slug: "remove-duplicate-lines",
    name: "Remove Duplicate Lines",
    shortDescription: "Clean a list by removing repeated lines, with optional sorting and trimming.",
    whatItDoes:
      "Drops repeated lines from a pasted list, and can trim stray whitespace, ignore letter case and sort the result while it does it.",
    category: "text-tools",
    icon: IconDuplicate,
    keywords: [
      "duplicates",
      "duplicate lines",
      "unique",
      "dedupe",
      "remove repeats",
      "list cleaner",
      "sort lines",
      "trim whitespace",
    ],
    popular: false,
    related: ["word-counter", "text-case-converter", "date-difference-calculator"],
  },
  {
    id: "unit-converter",
    slug: "unit-converter",
    name: "Unit Converter",
    shortDescription: "Convert length, weight, temperature, volume and speed between metric and imperial.",
    whatItDoes:
      "Converts a value between units of the same kind — metres and feet, kilograms and pounds, Celsius and Fahrenheit, litres and gallons, km/h and mph.",
    category: "converters",
    icon: IconConvert,
    keywords: [
      "unit converter",
      "metric",
      "imperial",
      "celsius",
      "fahrenheit",
      "kg to pounds",
      "km to miles",
      "cm to inches",
      "litres",
      "gallons",
      "measurement",
    ],
    popular: true,
    related: ["percentage-calculator", "date-difference-calculator", "budget-planner"],
  },
  {
    id: "budget-planner",
    slug: "budget-planner",
    name: "Budget Planner",
    shortDescription: "Plan a monthly budget from your income and expenses and see what is left over.",
    whatItDoes:
      "Adds up your monthly income and expense lines, totals each side and shows the amount left over (or over budget) as a figure and a share of income.",
    category: "everyday-finance",
    icon: IconBudget,
    keywords: [
      "budget",
      "monthly budget",
      "income",
      "expenses",
      "savings",
      "spending",
      "planner",
      "money",
      "left over",
    ],
    popular: false,
    related: ["percentage-calculator", "unit-converter", "date-difference-calculator"],
  },
  {
    id: "study-timer",
    slug: "study-timer",
    name: "Study Timer",
    shortDescription: "Run a focus timer with breaks, completed sessions and a simple study log.",
    whatItDoes:
      "Times a focused study session with pause, resume and reset, follows it with a short break, and counts the sessions you complete.",
    category: "productivity",
    icon: IconTimer,
    keywords: [
      "study timer",
      "pomodoro",
      "focus timer",
      "countdown",
      "break timer",
      "productivity",
      "revision",
      "timer",
    ],
    popular: false,
    related: ["grade-calculator", "word-counter", "budget-planner"],
  },
];

export const POPULAR_TOOLS: Tool[] = TOOLS.filter((tool) => tool.popular);

export function getTool(slug: string): Tool | undefined {
  return TOOLS.find((tool) => tool.slug === slug);
}

export function getCategory(slug: string): Category | undefined {
  return CATEGORIES.find((category) => category.slug === slug);
}

export function categoryName(slug: CategorySlug): string {
  return getCategory(slug)?.name ?? slug;
}

export function toolsByCategory(slug: string): Tool[] {
  return TOOLS.filter((tool) => tool.category === slug);
}

export function relatedTools(slug: string): Tool[] {
  const tool = getTool(slug);
  if (!tool) return [];
  return tool.related
    .map((relatedSlug) => getTool(relatedSlug))
    .filter((related): related is Tool => Boolean(related));
}

export function toolCountIn(slug: string): number {
  return toolsByCategory(slug).length;
}

/**
 * Case-insensitive search across name, description, keywords and category.
 * Every word in the query must match somewhere; better matches rank first.
 */
export function search(query: string): Tool[] {
  const terms = query
    .toLowerCase()
    .split(/[^a-z0-9%+.#]+/)
    .filter((term) => term.length > 0);
  if (terms.length === 0) return [];

  const scored = TOOLS.map((tool) => {
    const name = tool.name.toLowerCase();
    const keywords = tool.keywords.join(" ").toLowerCase();
    const category = categoryName(tool.category).toLowerCase();
    const description = `${tool.shortDescription} ${tool.whatItDoes}`.toLowerCase();

    let score = 0;
    let matchedAll = true;
    for (const term of terms) {
      let termScore = 0;
      if (name.startsWith(term)) termScore += 6;
      else if (name.includes(term)) termScore += 4;
      if (keywords.includes(term)) termScore += 3;
      if (category.includes(term)) termScore += 2;
      if (description.includes(term)) termScore += 1;
      if (termScore === 0) matchedAll = false;
      score += termScore;
    }
    if (!matchedAll) return null;
    if (tool.popular) score += 0.5;
    return { tool, score };
  }).filter((entry): entry is { tool: Tool; score: number } => entry !== null);

  return scored
    .sort((a, b) => b.score - a.score || a.tool.name.localeCompare(b.tool.name))
    .map((entry) => entry.tool);
}

/** Example queries shown on /search when the box is empty. */
export const EXAMPLE_QUERIES = ["percentage", "word count", "age", "celsius", "budget", "timer"];
