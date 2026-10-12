import { createFileRoute, Link } from "@tanstack/react-router";
import { Page, PageHeader, Section } from "~/components/ui";
import { breadcrumbLd, pageHead } from "~/lib/seo";

export const Route = createFileRoute("/privacy-policy")({
  head: () =>
    pageHead({
      title: "Privacy Policy",
      description:
        "What Toolora stores (almost nothing), what it never collects, and how to clear the two settings kept in your own browser.",
      path: "/privacy-policy",
      jsonLd: [
        breadcrumbLd([
          { name: "Home", path: "/" },
          { name: "Privacy Policy", path: "/privacy-policy" },
        ]),
      ],
    }),
  component: Privacy,
});

function Privacy() {
  return (
    <Page>
      <PageHeader
        eyebrow="Legal"
        title="Privacy Policy"
        intro="The short version: Toolora has no accounts, no analytics, no advertising and no database. This page lists everything that is stored, and it is a short list."
        breadcrumbs={[{ name: "Home", to: "/" }, { name: "Privacy Policy" }]}
      />

      <Section labelledBy="stored-heading" className="mt-10">
        <div className="max-w-3xl">
          <h2 id="stored-heading" className="text-xl font-semibold tracking-tight sm:text-2xl">
            What is stored, and where
          </h2>
          <div className="prose-block mt-4">
            <p>
              Two things are kept in your own browser&apos;s local storage, on your device only:
            </p>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                <span className="font-medium text-ink">Theme choice</span> — whether you picked the
                light or dark theme, so the site opens the same way next time.
              </li>
              <li>
                <span className="font-medium text-ink">Recently used tools</span> — the identifiers
                of up to six tool pages you opened, so the homepage can list them. Nothing you type
                into a tool is included.
              </li>
            </ul>
            <p>
              Both are used only to make the site behave the way you left it. Neither is sent to a
              server, and both can be cleared in one click with the “Clear history” button on the
              homepage, or by clearing site data in your browser settings.
            </p>
          </div>
        </div>
      </Section>

      <Section labelledBy="not-collected-heading">
        <div className="max-w-3xl">
          <h2 id="not-collected-heading" className="text-xl font-semibold tracking-tight sm:text-2xl">
            What is never collected
          </h2>
          <ul className="mt-4 space-y-2 text-sm leading-relaxed text-muted">
            <li>No account, name, email address or phone number — there is nothing to sign up to.</li>
            <li>
              No values typed into a tool. Calculations run in your browser, so the numbers, dates
              and text you enter stay on your device.
            </li>
            <li>No advertising identifiers, no tracking pixels, no affiliate links.</li>
            <li>No analytics or usage profiling scripts from third parties.</li>
            <li>No cookies set by Toolora for tracking or advertising.</li>
          </ul>
        </div>
      </Section>

      <Section labelledBy="serving-heading">
        <div className="max-w-3xl">
          <h2 id="serving-heading" className="text-xl font-semibold tracking-tight sm:text-2xl">
            Serving the pages
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-muted">
            The site is delivered by a hosting provider, which necessarily processes the request in
            order to send a page back — as any web server does. Standard server logging is
            controlled by that provider, not by Toolora, and Toolora does not use those logs to
            build profiles or reports.
          </p>
        </div>
      </Section>

      <Section labelledBy="changes-heading">
        <div className="max-w-3xl">
          <h2 id="changes-heading" className="text-xl font-semibold tracking-tight sm:text-2xl">
            Contact and changes
          </h2>
          <div className="prose-block mt-4">
            <p>
              Questions about privacy: <span className="font-medium text-ink">[contact email to be added]</span>
            </p>
            <p>
              If anything here changes — for example if a counter or a contact form is ever added —
              this page will be updated before that feature goes live. See also the{" "}
              <Link to="/terms-of-use" className="link">
                Terms of Use
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
