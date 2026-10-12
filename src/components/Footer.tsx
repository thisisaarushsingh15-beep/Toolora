import { Link } from "@tanstack/react-router";
import { LogoMark } from "~/components/Logo";
import { container } from "~/components/ui";
import { SITE } from "~/lib/seo";

const EXPLORE = [
  { to: "/tools", label: "All Tools" },
  { to: "/categories", label: "Categories" },
  { to: "/search", label: "Search" },
] as const;

const COMPANY = [
  { to: "/about", label: "About Us" },
  { to: "/contact", label: "Contact" },
] as const;

const LEGAL = [
  { to: "/privacy-policy", label: "Privacy Policy" },
  { to: "/terms-of-use", label: "Terms of Use" },
  { to: "/disclaimer", label: "Disclaimer" },
] as const;

const footerLink = "rounded-sm text-sm text-muted hover:text-accent hover:underline";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-16 border-t border-line bg-surface sm:mt-24">
      <div className={`${container} py-12 sm:py-16`}>
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2.5">
              <LogoMark className="h-8 w-8" />
              <span className="text-[1.35rem] leading-none font-semibold tracking-tight">
                {SITE.name}
              </span>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted">
              {SITE.tagline} Free browser-based tools for everyday calculations, text and
              conversions. No account, no charge.
            </p>
          </div>

          <nav aria-labelledby="footer-explore" className="flex flex-col gap-3">
            <h2 id="footer-explore" className="text-xs font-semibold tracking-[0.14em] text-ink uppercase">
              Explore
            </h2>
            {EXPLORE.map((item) => (
              <Link key={item.to} to={item.to} className={footerLink}>
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex flex-col gap-3">
            <nav aria-labelledby="footer-about" className="flex flex-col gap-3">
              <h2 id="footer-about" className="text-xs font-semibold tracking-[0.14em] text-ink uppercase">
                About
              </h2>
              {COMPANY.map((item) => (
                <Link key={item.to} to={item.to} className={footerLink}>
                  {item.label}
                </Link>
              ))}
            </nav>
            <nav aria-labelledby="footer-legal" className="mt-4 flex flex-col gap-3">
              <h2 id="footer-legal" className="text-xs font-semibold tracking-[0.14em] text-ink uppercase">
                Legal
              </h2>
              {LEGAL.map((item) => (
                <Link key={item.to} to={item.to} className={footerLink}>
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-line pt-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} {SITE.name}. All calculations run in your browser.</p>
          <p>Useful Tools. Zero Hassle.</p>
        </div>
      </div>
    </footer>
  );
}
