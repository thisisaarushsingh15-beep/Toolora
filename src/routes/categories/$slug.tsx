import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { CategoryCardGrid, ToolCardGrid } from "~/components/cards";
import { Page, PageHeader, Section, SectionHeading } from "~/components/ui";
import { breadcrumbLd, pageHead } from "~/lib/seo";
import { CATEGORIES, getCategory, toolsByCategory } from "~/lib/tools";

export const Route = createFileRoute("/categories/$slug")({
  loader: ({ params }) => {
    const category = getCategory(params.slug);
    if (!category) throw notFound();
    return { name: category.name, description: category.description };
  },
  head: ({ params, loaderData }) => {
    const category = getCategory(params.slug);
    const name = category?.name ?? loaderData?.name ?? "Category";
    return pageHead({
      title: `${name} — Free Online Tools`,
      description:
        category?.description ??
        `Tools in the ${name} category on Toolora — free, no account required.`,
      path: `/categories/${params.slug}`,
      jsonLd: [
        breadcrumbLd([
          { name: "Home", path: "/" },
          { name: "Categories", path: "/categories" },
          { name, path: `/categories/${params.slug}` },
        ]),
      ],
    });
  },
  component: CategoryPage,
});

function CategoryPage() {
  const { slug } = Route.useParams();
  const category = getCategory(slug);
  const tools = toolsByCategory(slug);
  const others = CATEGORIES.filter((item) => item.slug !== slug);

  if (!category) {
    return (
      <Page className="py-20">
        <h1 className="text-3xl font-semibold tracking-tight">Category not found</h1>
        <Link to="/categories" className="btn btn-primary mt-6">
          All categories
        </Link>
      </Page>
    );
  }

  return (
    <Page>
      <PageHeader
        eyebrow="Category"
        title={category.name}
        intro={category.description}
        breadcrumbs={[
          { name: "Home", to: "/" },
          { name: "Categories", to: "/categories" },
          { name: category.name },
        ]}
      />

      <Section labelledBy="category-tools-heading" className="mt-10">
        <SectionHeading
          id="category-tools-heading"
          eyebrow={`${String(tools.length)} tool${tools.length === 1 ? "" : "s"}`}
          title={`Tools in ${category.name}`}
          description="Every tool has its own page with the formula behind it and a worked example."
        />
        <ToolCardGrid tools={tools} className="mt-6" />
      </Section>

      <Section labelledBy="other-categories-heading">
        <SectionHeading id="other-categories-heading" eyebrow="Keep looking" title="Other categories" />
        <CategoryCardGrid categories={others} />
      </Section>
    </Page>
  );
}
