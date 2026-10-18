import type { ComponentType } from "react";
import type { ToolIcon } from "~/lib/tools";
import { AgeCalculator } from "./AgeCalculator";
import { BudgetPlanner } from "./BudgetPlanner";
import { DateDifferenceCalculator } from "./DateDifferenceCalculator";
import { GradeCalculator } from "./GradeCalculator";
import { PercentageCalculator } from "./PercentageCalculator";
import { RemoveDuplicateLines } from "./RemoveDuplicateLines";
import { StudyTimer } from "./StudyTimer";
import { TextCaseConverter } from "./TextCaseConverter";
import { UnitConverter } from "./UnitConverter";
import { WordCounter } from "./WordCounter";

/**
 * Slug → working tool. ToolPage renders the page template once and looks the
 * live widget up here, so a tool is added by adding one entry and one component.
 * All ten catalogue tools are wired.
 */
export const TOOL_COMPONENTS: Record<string, ComponentType> = {
  "percentage-calculator": PercentageCalculator,
  "grade-calculator": GradeCalculator,
  "age-calculator": AgeCalculator,
  "date-difference-calculator": DateDifferenceCalculator,
  "word-counter": WordCounter,
  "text-case-converter": TextCaseConverter,
  "remove-duplicate-lines": RemoveDuplicateLines,
  "unit-converter": UnitConverter,
  "budget-planner": BudgetPlanner,
  "study-timer": StudyTimer,
};

/**
 * Renders the tool area of a tool page. Every catalogue tool has real controls,
 * so this renders nothing at all if a slug ever appears without a widget — a tool
 * page never claims to be working when it is not.
 */
export function ToolWidget(props: { slug: string; toolName: string; Icon: ToolIcon }) {
  const Widget = TOOL_COMPONENTS[props.slug];

  if (!Widget) return null;

  return <Widget />;
}
