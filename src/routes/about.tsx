import { createFileRoute, Link } from "@tanstack/react-router";
import { Page, PageHeader, Section } from "~/components/ui";
import { breadcrumbLd, pageHead } from "~/lib/seo";
import { CATEGORIES, TOOLS } from "~/lib/tools";

export const Route = createFileRoute("/about")({
  head: () =>
    pageHead({
      title: "About Us",
      description:
        "What Toolora is, how the tools work, and what the site deliberately does not do — no accounts, no advertising, no tracking.",
      path: "/about",
      jsonLd: [
        breadcrumbLd([
          { name: "Home", path: "/" },
          { name: "About Us", path: "/about" },
        ]),
      ],
    }),
  component: About,
});

function About() {
  return (
    <Page>
      <PageHeader
        eyebrow="About"
        title="About Us"
        intro="Toolora is a small collection of free online tools for the calculations, conversions and text jobs that come up during a normal day."
        breadcrumbs={[{ name: "Home", to: "/" }, { name: "About Us" }]}
      />

      <Section labelledBy="what-heading" className="mt-10">
        <div className="max-w-3xl">
          <h2 id="what-heading" className="text-xl font-semibold tracking-tight sm:text-2xl">
            What Toolora is
          </h2>
          <div className="prose-block mt-4">
            <p>
              The catalogue holds {TOOLS.length} tools across {CATEGORIES.length} categories:
              percentage, grade, age and date calculators, a word counter, a text case converter, a
              duplicate line remover, a unit converter, a budget planner and a study timer.
            </p>
            <p>
              Each tool is its own page, with the formula behind it, a worked example and answers to
              the questions people ask most often. That detail is there so a result can be checked
              rather than trusted blindly.
            </p>
          </div>
        </div>
      </Section>

      <Section labelledBy="how-heading">
        <div className="max-w-3xl">
          <h2 id="how-heading" className="text-xl font-semibold tracking-tight sm:text-2xl">
            How the tools work
          </h2>
          <div className="prose-block mt-4">
            <p>
              Every calculation runs in your own browser. Nothing you type into a tool is sent to a
              server, stored on one, or shared with anyone — which is also why the tools keep
              working when a connection is poor.
            </p>
            <p>
              There is no sign-up, no account and no charge. Opening a tool is the whole
              onboarding.
            </p>
          </div>
        </div>
      </Section>

      <Section labelledBy="not-heading">
        <div className="max-w-3xl">
          <h2 id="not-heading" className="text-xl font-semibold tracking-tight sm:text-2xl">
            What Toolora deliberately does not do
          </h2>
          <ul className="mt-4 space-y-2 text-sm leading-relaxed text-muted">
            <li>No accounts, and no personal details collected.</li>
            <li>No advertising, sponsored placements or affiliate links.</li>
            <li>No analytics scripts or third-party trackers.</li>
            <li>No selling of anything, because there is nothing to sell.</li>
          </ul>
          <p className="mt-4 text-sm leading-relaxed text-muted">
            The full detail is in the{" "}
            <Link to="/privacy-policy" className="link">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </Section>

      <Section labelledBy="status-heading">
        <div className="max-w-3xl">
          <h2 id="status-heading" className="text-xl font-semibold tracking-tight sm:text-2xl">
            Where the site is up to
          </h2>
          <div className="prose-block mt-4">
            <p>
              The site structure, design, categories and all {TOOLS.length} tool pages are live. The
              working calculators for those tools are being added next, and each tool page says so
              plainly until its calculator actually works.
            </p>
            <p>
              Questions, corrections and suggestions are welcome — see the{" "}
              <Link to="/contact" className="link">
                Contact
              </Link>{" "}
              page.
            </p>
          </div>
        </div>
      </Section>
    </Page>
  );
}
