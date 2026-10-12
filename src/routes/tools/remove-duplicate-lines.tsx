import { createFileRoute } from "@tanstack/react-router";
import { ToolPage } from "~/components/ToolPage";
import { breadcrumbLd, pageHead } from "~/lib/seo";
import { getTool } from "~/lib/tools";

const tool = getTool("remove-duplicate-lines");

/**
 * Phase 2/3 adds the working calculator for this tool to the tool area of
 * ToolPage — the breadcrumb, H1, intro, formula, example, FAQ and related-tool
 * links already come from the shared registry.
 */
export const Route = createFileRoute("/tools/remove-duplicate-lines")({
  head: () =>
    pageHead({
      title: tool?.name ?? "Toolora tool",
      description: tool?.shortDescription ?? "",
      path: "/tools/remove-duplicate-lines",
      jsonLd: [
        breadcrumbLd([
          { name: "Home", path: "/" },
          { name: "All Tools", path: "/tools" },
          { name: tool?.name ?? "Tool", path: "/tools/remove-duplicate-lines" },
        ]),
      ],
    }),
  component: () => <ToolPage slug="remove-duplicate-lines" />,
});
