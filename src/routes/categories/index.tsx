import { createFileRoute } from "@tanstack/react-router";
import { CategoryCardGrid } from "~/components/cards";
import { Page, PageHeader, Section, SectionHeading } from "~/components/ui";
import { breadcrumbLd, pageHead } from "~/lib/seo";
import { CATEGORIES, TOOLS } from "~/lib/tools";

export const Route = createFileRoute("/categories/")({
  head: () =>
    pageHead({
      title: "All Categories",
      description:
        "Browse the seven Toolora categories: Calculators, Student Tools, Text Tools, Date and Time, Converters, Productivity and Everyday Finance.",
      path: "/categories",
      jsonLd: [
        breadcrumbLd([
          { name: "Home", path: "/" },
          { name: "Categories", path: "/categories" },
        ]),
      ],
    }),
  component: Categories,
});

function Categories() {
  return (
    <Page>
      <PageHeader
        eyebrow="Browse"
        title="All Categories"
        intro={`Every tool in the catalogue is grouped into one of ${String(CATEGORIES.length)} categories, covering a total of ${String(TOOLS.length)} tools. Open a category to see what is in it.`}
        breadcrumbs={[{ name: "Home", to: "/" }, { name: "Categories" }]}
      />

      <Section labelledBy="category-list-heading" className="mt-10">
        <SectionHeading id="category-list-heading" eyebrow="Categories" title="Pick a category" />
        <CategoryCardGrid categories={CATEGORIES} />
      </Section>
    </Page>
  );
}
