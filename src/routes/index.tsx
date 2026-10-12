import { createFileRoute, Link } from "@tanstack/react-router";
import { CategoryCardGrid, ToolCardGrid } from "~/components/cards";
import { RecentlyUsed } from "~/components/RecentlyUsed";
import { SearchForm } from "~/components/SearchForm";
import {
  IconArrowRight,
  IconBolt,
  IconDevices,
  IconGift,
  IconNoAccount,
} from "~/components/icons";
import { Page, Section, SectionHeading } from "~/components/ui";
import { SITE, pageHead } from "~/lib/seo";
import { CATEGORIES, EXAMPLE_QUERIES, POPULAR_TOOLS, TOOLS } from "~/lib/tools";

export const Route = createFileRoute("/")({
  head: () =>
    pageHead({
      title: "Free Online Tools — Calculators, Converters and Text Tools",
      description: SITE.description,
      path: "/",
      jsonLd: [
        {
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: SITE.name,
          url: SITE.url,
          description: SITE.description,
          potentialAction: {
            "@type": "SearchAction",
            target: {
              "@type": "EntryPoint",
              urlTemplate: `${SITE.url}/search?q={search_term_string}`,
            },
            "query-input": "required name=search_term_string",
          },
        },
      ],
    }),
  component: Home,
});

const WHY = [
  {
    icon: IconGift,
    title: "Free to use",
    body: "Every tool on Toolora is free. There is no paid tier, no trial and no locked feature.",
  },
  {
    icon: IconNoAccount,
    title: "No account required",
    body: "Nothing to sign up for and nothing to remember — open a tool and use it straight away.",
  },
  {
    icon: IconBolt,
    title: "Fast calculations and processing",
    body: "Each tool runs inside your own browser, so a result appears as you type instead of after a wait.",
  },
  {
    icon: IconDevices,
    title: "Designed for mobile and desktop",
    body: "Pages are built to work one-handed on a phone and comfortably on a large screen, with the same tools in both places.",
  },
];

function Home() {
  return (
    <Page>
      {/* 1. Hero */}
      <section className="pt-12 pb-2 sm:pt-20">
        <p className="eyebrow">{SITE.tagline}</p>
        <h1 className="mt-4 max-w-3xl text-3xl font-semibold tracking-tight text-balance sm:text-5xl">
          The Right Tool for Every Little Task.
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
          Calculate, convert, organize, and get things done with free online tools that work
          instantly.
        </p>

        <SearchForm id="home-search" className="mt-8 max-w-2xl" size="hero" />

        <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2">
          <span className="text-sm text-muted">Popular:</span>
          <ul aria-label="Popular tool suggestions" className="flex flex-wrap gap-2">
            {POPULAR_TOOLS.map((tool) => (
              <li key={tool.slug}>
                <Link to="/tools/$slug" params={{ slug: tool.slug }} className="chip">
                  {tool.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <p className="mt-6 text-sm text-muted">
          Every tool is free and needs no account. Nothing you type is sent to a server.
        </p>
      </section>

      {/* 2. Popular tools */}
      <Section labelledBy="popular-heading">
        <SectionHeading
          id="popular-heading"
          eyebrow="Most opened"
          title="Popular tools"
          description="The tools visitors reach for most, each with its own page, formula and worked example."
          action={
            <Link to="/tools" className="btn btn-secondary gap-2">
              All {TOOLS.length} tools
              <IconArrowRight className="h-4 w-4" />
            </Link>
          }
        />
        <ToolCardGrid tools={POPULAR_TOOLS} className="mt-6" />
      </Section>

      {/* 3. Browse by category */}
      <Section labelledBy="categories-heading">
        <SectionHeading
          id="categories-heading"
          eyebrow="Browse"
          title="Browse by category"
          description="Seven categories covering the small jobs that come up during a normal day."
        />
        <CategoryCardGrid categories={CATEGORIES} />
      </Section>

      {/* 4. Why Toolora */}
      <Section labelledBy="why-heading">
        <SectionHeading
          id="why-heading"
          eyebrow="Why Toolora"
          title="Four reasons the tools are built this way"
        />
        <ul className="mt-6 grid gap-4 sm:grid-cols-2">
          {WHY.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.title} className="card p-5 sm:p-6">
                <span className="icon-tile">
                  <Icon className="h-6 w-6" />
                </span>
                <h3 className="mt-4 text-base font-semibold tracking-tight text-ink">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{item.body}</p>
              </li>
            );
          })}
        </ul>
      </Section>

      {/* 5. Recently used */}
      <RecentlyUsed />

      <Section labelledBy="try-heading">
        <SectionHeading id="try-heading" eyebrow="Not sure where to start?" title="Try a search" />
        <ul className="mt-6 flex flex-wrap gap-2">
          {EXAMPLE_QUERIES.map((query) => (
            <li key={query}>
              <Link to="/search" search={{ q: query }} className="chip">
                {query}
              </Link>
            </li>
          ))}
        </ul>
      </Section>
    </Page>
  );
}
