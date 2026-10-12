import { createFileRoute, Link } from "@tanstack/react-router";
import { CategoryCardGrid, ToolCardGrid } from "~/components/cards";
import { Breadcrumbs, Page, PageHeader, Section, SectionHeading } from "~/components/ui";
import { breadcrumbLd, pageHead } from "~/lib/seo";
import {
  CATEGORIES,
  TOOLS,
  getCategory,
  toolsByCategory,
  type CategorySlug,
} from "~/lib/tools";

export const Route = createFileRoute("/tools/")({
  validateSearch: (search: Record<string, unknown>): { category?: CategorySlug } => {
    const slug = typeof search.category === "string" ? search.category : "";
    const category = getCategory(slug);
    return category ? { category: category.slug } : {};
  },
  head: () =>
    pageHead({
      title: "All Tools",
      description:
        "All ten free Toolora tools in one place: percentage, grade, age and date calculators, a word counter, text case converter, duplicate line remover, unit converter, budget planner and study timer.",
      path: "/tools",
      jsonLd: [
        breadcrumbLd([
          { name: "Home", path: "/" },
          { name: "All Tools", path: "/tools" },
        ]),
      ],
    }),
  component: AllTools,
});

function AllTools() {
  const { category } = Route.useSearch();
  const shown = category ? toolsByCategory(category) : TOOLS;
  const activeName = category ? getCategory(category)?.name : undefined;

  return (
    <Page>
      <PageHeader
        eyebrow="The catalogue"
        title="All Tools"
        intro={`Ten focused tools across seven categories. Every one is free, needs no account, and runs in your browser — pick one and it opens on its own page.`}
        breadcrumbs={[{ name: "Home", to: "/" }, { name: "All Tools" }]}
      />

      <Section labelledBy="filter-heading" className="mt-10">
        <h2 id="filter-heading" className="sr-only">
          Filter tools by category
        </h2>
        <ul className="flex flex-wrap gap-2">
          <li>
            <Link
              to="/tools"
              search={{}}
              className={`chip ${!category ? "chip-active" : ""}`}
              aria-current={!category ? "true" : undefined}
            >
              All tools ({TOOLS.length})
            </Link>
          </li>
          {CATEGORIES.map((item) => (
            <li key={item.slug}>
              <Link
                to="/tools"
                search={{ category: item.slug }}
                className={`chip ${category === item.slug ? "chip-active" : ""}`}
                aria-current={category === item.slug ? "true" : undefined}
              >
                {item.name} ({toolsByCategory(item.slug).length})
              </Link>
            </li>
          ))}
        </ul>

        <p role="status" className="mt-6 text-sm text-muted">
          {activeName
            ? `Showing ${String(shown.length)} tool${shown.length === 1 ? "" : "s"} in ${activeName}.`
            : `Showing all ${String(shown.length)} tools.`}
        </p>

        <ToolCardGrid tools={shown} className="mt-4" />

        {category ? (
          <p className="mt-6 text-sm">
            <Link to="/tools" search={{}} className="link">
              Show all tools
            </Link>
          </p>
        ) : null}
      </Section>

      <Section labelledBy="browse-categories-heading">
        <SectionHeading
          id="browse-categories-heading"
          eyebrow="Another way in"
          title="Browse by category"
          description="Each category page lists its own tools with the same detail."
        />
        <CategoryCardGrid categories={CATEGORIES} />
      </Section>
    </Page>
  );
}
