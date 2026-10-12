import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ToolCardGrid } from "~/components/cards";
import { IconArrowRight, IconSearch } from "~/components/icons";
import { Breadcrumbs, Page, Section } from "~/components/ui";
import { pageHead } from "~/lib/seo";
import { CATEGORIES, EXAMPLE_QUERIES, search } from "~/lib/tools";

export const Route = createFileRoute("/search")({
  validateSearch: (params: Record<string, unknown>): { q: string } => ({
    q: typeof params.q === "string" ? params.q.slice(0, 120) : "",
  }),
  head: () =>
    pageHead({
      title: "Search Tools",
      description:
        "Search the Toolora catalogue by name or by what you need to do — percentages, word counts, ages, unit conversions and more.",
      path: "/search",
      noindex: true,
    }),
  component: SearchPage,
});

function SearchPage() {
  const { q } = Route.useSearch();
  const [value, setValue] = useState(q);

  // Keep the box in step with the URL when a link or the header form navigates.
  useEffect(() => {
    setValue(q);
  }, [q]);

  const results = useMemo(() => search(value), [value]);
  const trimmed = value.trim();

  // Keep the query in the address bar so a result can be shared, without
  // re-rendering the whole route on every keystroke.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const url = trimmed ? `/search?q=${encodeURIComponent(trimmed)}` : "/search";
    if (`${window.location.pathname}${window.location.search}` !== url) {
      window.history.replaceState(null, "", url);
    }
  }, [trimmed]);

  return (
    <Page>
      <header className="pt-8 sm:pt-12">
        <Breadcrumbs items={[{ name: "Home", to: "/" }, { name: "Search" }]} />
        <div className="mt-6 max-w-3xl">
          <p className="eyebrow">Find a tool</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Search Tools</h1>
          <p className="mt-4 text-base leading-relaxed text-muted">
            Type a name — or a job to be done, like “word count” or “celsius”. Results appear as you
            type.
          </p>
        </div>

        <div className="mt-8 max-w-2xl">
          <label htmlFor="search-input" className="sr-only">
            Search tools
          </label>
          <div className="relative">
            <IconSearch className="pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-muted" />
            <input
              id="search-input"
              name="q"
              type="search"
              value={value}
              onChange={(event) => setValue(event.target.value)}
              placeholder="What do you need to calculate or create?"
              autoComplete="off"
              className="field h-13 pl-12 sm:text-base"
            />
          </div>
          <p role="status" aria-live="polite" className="mt-4 text-sm text-muted">
            {trimmed === ""
              ? "Start typing to see matching tools."
              : results.length === 0
                ? `No tools match “${trimmed}”.`
                : `${String(results.length)} tool${results.length === 1 ? "" : "s"} match “${trimmed}”.`}
          </p>
        </div>
      </header>

      {trimmed === "" ? (
        <Section labelledBy="example-heading">
          <h2 id="example-heading" className="text-xl font-semibold tracking-tight sm:text-2xl">
            Try one of these
          </h2>
          <ul className="mt-5 flex flex-wrap gap-2">
            {EXAMPLE_QUERIES.map((query) => (
              <li key={query}>
                <button type="button" onClick={() => setValue(query)} className="chip">
                  {query}
                </button>
              </li>
            ))}
          </ul>
          <h3 className="mt-10 text-base font-semibold tracking-tight">Or start from a category</h3>
          <ul className="mt-4 flex flex-wrap gap-2">
            {CATEGORIES.map((category) => (
              <li key={category.slug}>
                <Link to="/categories/$slug" params={{ slug: category.slug }} className="chip">
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      ) : results.length === 0 ? (
        <Section labelledBy="no-results-heading">
          <div className="card max-w-2xl p-6">
            <h2 id="no-results-heading" className="text-base font-semibold text-ink">
              Nothing matched “{trimmed}”
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Search runs across tool names, descriptions, categories and their common synonyms.
              Try a shorter word, or browse the full catalogue.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link to="/tools" className="btn btn-primary">
                All tools
              </Link>
              <Link to="/categories" className="btn btn-secondary">
                Categories
              </Link>
            </div>
          </div>
        </Section>
      ) : (
        <Section labelledBy="results-heading">
          <h2 id="results-heading" className="sr-only">
            Search results
          </h2>
          <ToolCardGrid tools={results} />
          <p className="mt-6 text-sm">
            <Link to="/tools" className="link inline-flex items-center gap-1.5">
              See the full catalogue
              <IconArrowRight className="h-4 w-4" />
            </Link>
          </p>
        </Section>
      )}
    </Page>
  );
}
