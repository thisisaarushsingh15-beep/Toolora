import { createFileRoute, Link } from "@tanstack/react-router";
import { Breadcrumbs, Page, Section, SectionHeading } from "~/components/ui";
import { pageHead } from "~/lib/seo";
import { CATEGORIES, TOOLS } from "~/lib/tools";

/**
 * Catch-all for /tools/<anything>. Every tool in the catalogue has its own static
 * route, which always wins; this exists so an old link, a typo or a search-engine
 * guess lands on a friendly page instead of a dead end.
 */
export const Route = createFileRoute("/tools/$slug")({
  head: ({ params }) => {
    const slug = typeof params.slug === "string" ? params.slug : String(params.slug ?? "");
    return pageHead({
      title: `That tool is not here — Toolora`,
      description:
        "The page you asked for is not one of Toolora’s tools yet. Browse all ten tools or pick a category instead.",
      path: `/tools/${slug}`,
    });
  },
  component: ToolNotFoundPage,
});

function ToolNotFoundPage() {
  const { slug } = Route.useParams();

  return (
    <Page className="pt-8 sm:pt-12">
      <Breadcrumbs items={[{ name: "Home", to: "/" }, { name: "All Tools", to: "/tools" }]} />

      <article className="mt-6 max-w-3xl">
        <p className="eyebrow">Page not found</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          That tool isn’t here yet
        </h1>
        <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg">
          There is nothing at <span className="font-mono break-all text-ink">/tools/{slug}</span> —
          it may be a typo, an old link, or a tool we have not built. Nothing is broken on your side;
          the address just does not match one of our pages.
        </p>
        <p className="mt-4 text-sm leading-relaxed text-muted">
          Toolora has {TOOLS.length} working tools, all of them free and all of them running in your
          own browser. The two ways back:
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link to="/tools" className="btn btn-primary min-h-11">
            See all {TOOLS.length} tools
          </Link>
          <Link to="/" className="btn btn-secondary min-h-11">
            Back to the homepage
          </Link>
        </div>

        <Section labelledBy="catch-all-categories" className="mt-10">
          <SectionHeading
            id="catch-all-categories"
            eyebrow="Or start from a category"
            title="Browse by category"
          />
          <ul className="mt-6 flex flex-wrap gap-2">
            {CATEGORIES.map((category) => (
              <li key={category.slug}>
                <Link
                  to="/categories/$slug"
                  params={{ slug: category.slug }}
                  className="chip min-h-11"
                >
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </Section>

        <Section labelledBy="catch-all-popular" className="mt-10">
          <SectionHeading
            id="catch-all-popular"
            eyebrow="Popular"
            title="Tools people open most"
          />
          <ul className="mt-6 flex flex-wrap gap-2">
            {TOOLS.filter((tool) => tool.popular).map((tool) => (
              <li key={tool.slug}>
                <Link to="/tools/$slug" params={{ slug: tool.slug }} className="chip min-h-11">
                  {tool.name}
                </Link>
              </li>
            ))}
          </ul>
        </Section>

        <p className="mt-10 text-sm leading-relaxed text-muted">
          You can also search from the{" "}
          <Link to="/search" className="text-accent hover:underline">
            search page
          </Link>
          .
        </p>
      </article>
    </Page>
  );
}
