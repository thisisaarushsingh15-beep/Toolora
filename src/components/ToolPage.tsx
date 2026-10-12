import { useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { ToolCardGrid } from "~/components/cards";
import { ToolWidget } from "~/components/tools";
import { IconArrowRight, IconCheck } from "~/components/icons";
import { Breadcrumbs, Page, Section, SectionHeading } from "~/components/ui";
import { rememberTool } from "~/lib/recent";
import { getToolContent } from "~/lib/toolContent";
import { categoryName, getTool, relatedTools } from "~/lib/tools";

/**
 * The one template every tool page uses: breadcrumb, H1, intro, a prominent
 * tool area, then how it works, a worked example, FAQs and related tools.
 * Phase 2/3 replaces the placeholder in the tool area with the real controls —
 * nothing else on the page needs to change.
 */
export function ToolPage({ slug }: { slug: string }) {
  useEffect(() => {
    rememberTool(slug);
  }, [slug]);

  const tool = getTool(slug);

  if (!tool) {
    return (
      <Page className="py-20">
        <h1 className="text-3xl font-semibold tracking-tight">Tool not found</h1>
        <p className="mt-3 text-sm text-muted">
          That tool is not in the Toolora catalogue yet.
        </p>
        <Link to="/tools" className="btn btn-primary mt-6">
          See all tools
        </Link>
      </Page>
    );
  }

  const Icon = tool.icon;
  const content = getToolContent(slug);
  const related = relatedTools(slug);

  return (
    <Page className="pt-8 sm:pt-12">
      <Breadcrumbs
        items={[{ name: "Home", to: "/" }, { name: "All Tools", to: "/tools" }, { name: tool.name }]}
      />

      <article className="mt-6">
        <header className="max-w-3xl">
          <div className="flex flex-wrap items-center gap-3">
            <span className="icon-tile">
              <Icon className="h-6 w-6" />
            </span>
            <Link
              to="/categories/$slug"
              params={{ slug: tool.category }}
              className="text-sm font-medium text-accent hover:underline"
            >
              {categoryName(tool.category)}
            </Link>
          </div>
          <h1 className="mt-5 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            {tool.name}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg">
            {content?.intro ?? tool.shortDescription}
          </p>
          <p className="mt-4 inline-flex items-center gap-2 text-sm text-muted">
            <IconCheck className="h-4 w-4 text-accent" />
            Free, no account, and it runs in your browser.
          </p>
        </header>

        {/* Tool area — the live calculator is looked up by slug in one shared map. */}
        <div className="card mt-8 p-5 sm:p-8">
          <h2 className="text-lg font-semibold tracking-tight">{tool.name}</h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted">{tool.whatItDoes}</p>
          <div className="mt-6">
            <ToolWidget slug={slug} toolName={tool.name} Icon={Icon} />
          </div>
        </div>

        {content ? (
          <>
            <Section labelledBy="how-it-works-heading">
              <SectionHeading
                id="how-it-works-heading"
                eyebrow="How it works"
                title="The formula behind it"
              />
              <p className="mt-6 overflow-x-auto rounded-card border border-line bg-surface-2 px-4 py-4 font-mono text-sm text-ink">
                {content.formula}
              </p>
              <ol className="mt-6 space-y-3">
                {content.howItWorks.map((step, index) => (
                  <li key={step} className="flex gap-3 text-sm leading-relaxed text-muted">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent-soft text-xs font-semibold text-accent">
                      {index + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </Section>

            <Section labelledBy="example-heading">
              <SectionHeading id="example-heading" eyebrow="Worked example" title={content.example.title} />
              <ol className="mt-6 space-y-2 text-sm leading-relaxed text-muted">
                {content.example.steps.map((step) => (
                  <li key={step} className="border-l-2 border-line pl-4 py-0.5">
                    {step}
                  </li>
                ))}
              </ol>
              <p className="card mt-6 flex items-start gap-3 p-5 text-sm font-medium text-ink">
                <IconArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                {content.example.result}
              </p>
            </Section>

            <Section labelledBy="faq-heading">
              <SectionHeading id="faq-heading" eyebrow="Questions" title="Frequently asked questions" />
              <div className="mt-6 space-y-3">
                {content.faqs.map((faq) => (
                  <details key={faq.q} className="card px-5 py-4">
                    <summary className="cursor-pointer list-none text-sm font-semibold text-ink marker:content-none">
                      <h3 className="inline text-sm font-semibold">{faq.q}</h3>
                    </summary>
                    <p className="mt-3 text-sm leading-relaxed text-muted">{faq.a}</p>
                  </details>
                ))}
              </div>
            </Section>
          </>
        ) : null}

        <Section labelledBy="related-heading">
          <SectionHeading
            id="related-heading"
            eyebrow="Keep going"
            title="Related tools"
            action={
              <Link to="/tools" className="text-sm font-semibold text-accent hover:underline">
                All tools
              </Link>
            }
          />
          <ToolCardGrid tools={related} className="mt-6" />
        </Section>
      </article>
    </Page>
  );
}
