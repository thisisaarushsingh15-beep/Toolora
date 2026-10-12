import { createFileRoute, Link } from "@tanstack/react-router";
import { Page, PageHeader, Section } from "~/components/ui";
import { breadcrumbLd, pageHead } from "~/lib/seo";

export const Route = createFileRoute("/disclaimer")({
  head: () =>
    pageHead({
      title: "Disclaimer",
      description:
        "What the Toolora results do and do not cover, and which figures are worth double-checking before you rely on them.",
      path: "/disclaimer",
      jsonLd: [
        breadcrumbLd([
          { name: "Home", path: "/" },
          { name: "Disclaimer", path: "/disclaimer" },
        ]),
      ],
    }),
  component: Disclaimer,
});

function Disclaimer() {
  return (
    <Page>
      <PageHeader
        eyebrow="Legal"
        title="Disclaimer"
        intro="The tools are calculators, not advisers. Here is what each kind of result covers, and where a second look pays off."
        breadcrumbs={[{ name: "Home", to: "/" }, { name: "Disclaimer" }]}
      />

      <Section labelledBy="general-heading" className="mt-10">
        <div className="max-w-3xl">
          <h2 id="general-heading" className="text-xl font-semibold tracking-tight sm:text-2xl">
            General
          </h2>
          <div className="prose-block mt-4">
            <p>
              Every Toolora tool performs the calculation shown on its page and nothing more. Each
              page states the formula and gives a worked example so you can follow the arithmetic
              and satisfy yourself that the answer is right for your situation.
            </p>
            <p>
              Where a result affects money, a deadline, an application or someone&apos;s health or
              safety, check it against another source before you act on it.
            </p>
          </div>
        </div>
      </Section>

      <Section labelledBy="specifics-heading">
        <div className="max-w-3xl">
          <h2 id="specifics-heading" className="text-xl font-semibold tracking-tight sm:text-2xl">
            By tool
          </h2>
          <ul className="mt-4 space-y-3 text-sm leading-relaxed text-muted">
            <li>
              <span className="font-medium text-ink">Percentage and grade calculators</span> — the
              arithmetic is exact for the numbers you enter. Letter grades, pass marks and grade
              boundaries are decided by your own institution, so the tool reports percentages only.
            </li>
            <li>
              <span className="font-medium text-ink">Age and date difference calculators</span> —
              results depend on the date you measure against and on the convention used for
              incomplete months. Legal age requirements are defined by the relevant authority, not by
              this site.
            </li>
            <li>
              <span className="font-medium text-ink">Word and character counters</span> — different
              systems count words and characters differently, especially around hyphenated words,
              numerals and emoji. Where a submission limit matters, treat the count as a guide and
              leave a margin.
            </li>
            <li>
              <span className="font-medium text-ink">Unit converter</span> — conversion factors are
              fixed values and are rounded for display. Some fields use different definitions of a
              gallon, a ton or a mile, so check that the unit you picked is the one meant.
            </li>
            <li>
              <span className="font-medium text-ink">Budget planner</span> — arithmetic on the
              figures you provide. It is not financial, tax or investment advice, and it does not
              know about your circumstances.
            </li>
            <li>
              <span className="font-medium text-ink">Study timer</span> — counts time while the page
              is open. It is a study aid, not a timekeeping or billing record.
            </li>
          </ul>
        </div>
      </Section>

      <Section labelledBy="contact-heading">
        <div className="max-w-3xl">
          <h2 id="contact-heading" className="text-xl font-semibold tracking-tight sm:text-2xl">
            Found something wrong?
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-muted">
            A result that does not add up is the most useful message you can send. Use the contact
            details on the{" "}
            <Link to="/contact" className="link">
              Contact
            </Link>{" "}
            page — <span className="font-medium text-ink">[contact email to be added]</span>.
          </p>
        </div>
      </Section>
    </Page>
  );
}
