import { createFileRoute } from "@tanstack/react-router";
import { ToolPage } from "~/components/ToolPage";
import { breadcrumbLd, pageHead } from "~/lib/seo";
import { getTool } from "~/lib/tools";

const tool = getTool("unit-converter");

/**
 * Phase 2/3 adds the working calculator for this tool to the tool area of
 * ToolPage — the breadcrumb, H1, intro, formula, example, FAQ and related-tool
 * links already come from the shared registry.
 */
export const Route = createFileRoute("/tools/unit-converter")({
  head: () =>
    pageHead({
      title: tool?.name ?? "Toolora tool",
      description: tool?.shortDescription ?? "",
      path: "/tools/unit-converter",
      jsonLd: [
        breadcrumbLd([
          { name: "Home", path: "/" },
          { name: "All Tools", path: "/tools" },
          { name: tool?.name ?? "Tool", path: "/tools/unit-converter" },
        ]),
      ],
    }),
  component: () => <ToolPage slug="unit-converter" />,
});
