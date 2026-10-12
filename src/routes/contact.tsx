import { createFileRoute, Link } from "@tanstack/react-router";
import { Page, PageHeader, Section } from "~/components/ui";
import { breadcrumbLd, pageHead } from "~/lib/seo";

export const Route = createFileRoute("/contact")({
  head: () =>
    pageHead({
      title: "Contact",
      description:
        "How to reach the people behind Toolora — with a note on what contact details are still to be confirmed.",
      path: "/contact",
      jsonLd: [
        breadcrumbLd([
          { name: "Home", path: "/" },
          { name: "Contact", path: "/contact" },
        ]),
      ],
    }),
  component: Contact,
});

function Contact() {
  return (
    <Page>
      <PageHeader
        eyebrow="Contact"
        title="Contact"
        intro="Toolora has no contact form yet, and no invented addresses. Here is exactly how to reach the site, and what is still being confirmed."
        breadcrumbs={[{ name: "Home", to: "/" }, { name: "Contact" }]}
      />

      <Section labelledBy="email-heading" className="mt-10">
        <div className="max-w-3xl">
          <h2 id="email-heading" className="text-xl font-semibold tracking-tight sm:text-2xl">
            Email
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted">
            Email address: <span className="font-medium text-ink">[contact email to be added]</span>
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            This placeholder is deliberate. No address is published until it is a real one that
            reaches a real inbox — a working address is better than a plausible-looking guess.
          </p>
        </div>
      </Section>

      <Section labelledBy="why-heading">
        <div className="max-w-3xl">
          <h2 id="why-heading" className="text-xl font-semibold tracking-tight sm:text-2xl">
            What to send
          </h2>
          <ul className="mt-4 space-y-2 text-sm leading-relaxed text-muted">
            <li>A result that looks wrong, with the numbers you entered — that is the most useful message of all.</li>
            <li>A tool you wish existed, or a unit, category or case style that is missing.</li>
            <li>A page that is hard to use on your phone or with a screen reader.</li>
          </ul>
        </div>
      </Section>

      <Section labelledBy="no-form-heading">
        <div className="max-w-3xl">
          <h2 id="no-form-heading" className="text-xl font-semibold tracking-tight sm:text-2xl">
            Why there is no contact form
          </h2>
          <div className="prose-block mt-4">
            <p>
              A form needs somewhere to store what you send. Toolora has no database and collects
              nothing, so an email address is the honest way to get in touch — and there is no
              message sitting in a server nobody maintains.
            </p>
            <p>
              For anything about data and privacy, the{" "}
              <Link to="/privacy-policy" className="link">
                Privacy Policy
              </Link>{" "}
              explains plainly what is and is not stored.
            </p>
          </div>
        </div>
      </Section>
    </Page>
  );
}
