import { createFileRoute } from "@tanstack/react-router";
import { ToolPage } from "~/components/ToolPage";
import { breadcrumbLd, pageHead } from "~/lib/seo";
import { getTool } from "~/lib/tools";

const tool = getTool("date-difference-calculator");

/**
 * Phase 2/3 adds the working calculator for this tool to the tool area of
 * ToolPage — the breadcrumb, H1, intro, formula, example, FAQ and related-tool
 * links already come from the shared registry.
 */
export const Route = createFileRoute("/tools/date-difference-calculator")({
  head: () =>
    pageHead({
      title: tool?.name ?? "Toolora tool",
      description: tool?.shortDescription ?? "",
      path: "/tools/date-difference-calculator",
      jsonLd: [
        breadcrumbLd([
          { name: "Home", path: "/" },
          { name: "All Tools", path: "/tools" },
          { name: tool?.name ?? "Tool", path: "/tools/date-difference-calculator" },
        ]),
      ],
    }),
  component: () => <ToolPage slug="date-difference-calculator" />,
});
