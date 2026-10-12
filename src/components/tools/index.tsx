import type { ComponentType } from "react";
import type { ToolIcon } from "~/lib/tools";
import { AgeCalculator } from "./AgeCalculator";
import { DateDifferenceCalculator } from "./DateDifferenceCalculator";
import { GradeCalculator } from "./GradeCalculator";
import { PercentageCalculator } from "./PercentageCalculator";
import { WordCounter } from "./WordCounter";

/**
 * Slug → working tool. ToolPage renders the page template once and looks the
 * live widget up here, so the remaining five tools slot in by adding one entry
 * (and one component) without touching the page sections.
 */
export const TOOL_COMPONENTS: Record<string, ComponentType> = {
  "percentage-calculator": PercentageCalculator,
  "grade-calculator": GradeCalculator,
  "age-calculator": AgeCalculator,
  "date-difference-calculator": DateDifferenceCalculator,
  "word-counter": WordCounter,
};

/**
 * Renders the tool area of a tool page: the real calculator when one exists,
 * otherwise an honest placeholder — never a fake input that does nothing.
 */
export function ToolWidget({
  slug,
  toolName,
  Icon,
}: {
  slug: string;
  toolName: string;
  Icon: ToolIcon;
}) {
  const Widget = TOOL_COMPONENTS[slug];

  if (Widget) return <Widget />;

  return (
    <div className="rounded-card border border-dashed border-line-strong bg-surface-2 px-5 py-8 text-center">
      <span className="icon-tile mx-auto">
        <Icon className="h-6 w-6" />
      </span>
      <p className="mt-4 text-sm font-semibold text-ink">
        The {toolName.toLowerCase()} is being wired up next
      </p>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-muted">
        This page, its sections and its links are final. The working calculation is a later build
        step — there are no pretend inputs here, so nothing to click until it really works.
      </p>
    </div>
  );
}
