import { createFileRoute, Link } from "@tanstack/react-router";
import { Page, PageHeader, Section } from "~/components/ui";
import { breadcrumbLd, pageHead } from "~/lib/seo";

export const Route = createFileRoute("/terms-of-use")({
  head: () =>
    pageHead({
      title: "Terms of Use",
      description:
        "The terms for using Toolora: free tools provided as they are, results to be checked, and no professional advice.",
      path: "/terms-of-use",
      jsonLd: [
        breadcrumbLd([
          { name: "Home", path: "/" },
          { name: "Terms of Use", path: "/terms-of-use" },
        ]),
      ],
    }),
  component: Terms,
});

function Terms() {
  return (
    <Page>
      <PageHeader
        eyebrow="Legal"
        title="Terms of Use"
        intro="Short and plain: Toolora is free to use as it is, the results are there to be checked, and nothing here is professional advice."
        breadcrumbs={[{ name: "Home", to: "/" }, { name: "Terms of Use" }]}
      />

      <Section labelledBy="use-heading" className="mt-10">
        <div className="max-w-3xl">
          <h2 id="use-heading" className="text-xl font-semibold tracking-tight sm:text-2xl">
            Using the site
          </h2>
          <div className="prose-block mt-4">
            <p>
              You may use Toolora for personal, educational or commercial work at no charge and
              without creating an account. You do not need permission to use a result.
            </p>
            <p>
              Please do not attempt to break the site, overload it, scrape it at a rate that affects
              other visitors, or present it as your own service.
            </p>
          </div>
        </div>
      </Section>

      <Section labelledBy="as-is-heading">
        <div className="max-w-3xl">
          <h2 id="as-is-heading" className="text-xl font-semibold tracking-tight sm:text-2xl">
            The tools are provided as they are
          </h2>
          <div className="prose-block mt-4">
            <p>
              The tools are offered without warranty of any kind. They are written carefully and
              each page shows the formula and a worked example so a result can be checked, but no
              guarantee is made that a particular result suits a particular purpose.
            </p>
            <p>
              Check anything important. For a decision with real consequences — money, deadlines,
              applications, safety — confirm the figure with an independent source before relying on
              it.
            </p>
          </div>
        </div>
      </Section>

      <Section labelledBy="advice-heading">
        <div className="max-w-3xl">
          <h2 id="advice-heading" className="text-xl font-semibold tracking-tight sm:text-2xl">
            No professional advice
          </h2>
          <div className="prose-block mt-4">
            <p>
              Nothing on Toolora is financial, legal, medical, tax or academic advice. The{" "}
              <Link to="/tools/budget-planner" className="link">
                Budget Planner
              </Link>{" "}
              does arithmetic on figures you enter; it is not financial advice. Grade boundaries are
              set by your own school or university, not by this site.
            </p>
          </div>
        </div>
      </Section>

      <Section labelledBy="changes-heading">
        <div className="max-w-3xl">
          <h2 id="changes-heading" className="text-xl font-semibold tracking-tight sm:text-2xl">
            Changes
          </h2>
          <div className="prose-block mt-4">
            <p>
              These terms will be expanded as the site grows, and this page will be updated whenever
              it changes. Questions:{" "}
              <span className="font-medium text-ink">[contact email to be added]</span>. See also the{" "}
              <Link to="/privacy-policy" className="link">
                Privacy Policy
              </Link>{" "}
              and the{" "}
              <Link to="/disclaimer" className="link">
                Disclaimer
              </Link>
              .
            </p>
          </div>
        </div>
      </Section>
    </Page>
  );
}
