import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { IconChevronRight } from "~/components/icons";

/** One container width for the whole site. */
export const container = "mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8";

export function Page({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`${container} ${className}`}>{children}</div>;
}

export function Section({
  children,
  className = "",
  labelledBy,
}: {
  children: ReactNode;
  className?: string;
  labelledBy?: string;
}) {
  return (
    <section aria-labelledby={labelledBy} className={`mt-14 sm:mt-20 ${className}`}>
      {children}
    </section>
  );
}

export function SectionHeading({
  id,
  eyebrow,
  title,
  description,
  action,
}: {
  id?: string;
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-2xl">
        {eyebrow ? <p className="eyebrow mb-2">{eyebrow}</p> : null}
        <h2 id={id} className="text-xl font-semibold tracking-tight sm:text-2xl">
          {title}
        </h2>
        {description ? <p className="mt-2 text-sm leading-relaxed text-muted">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export type Crumb = { name: string; to?: string; params?: Record<string, string> };

/**
 * Real breadcrumbs only — never invented depth. The final crumb is plain text
 * because it is the current page.
 */
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm">
      <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-muted">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={`${item.name}-${String(index)}`} className="flex items-center gap-1.5">
              {item.to && !isLast ? (
                <Link
                  to={item.to as never}
                  params={item.params as never}
                  className="rounded-sm hover:text-accent hover:underline"
                >
                  {item.name}
                </Link>
              ) : (
                <span aria-current={isLast ? "page" : undefined} className="text-ink">
                  {item.name}
                </span>
              )}
              {!isLast ? <IconChevronRight className="h-3.5 w-3.5 shrink-0 text-muted/70" /> : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/** Standard page header for content pages (about, contact, legal). */
export function PageHeader({
  eyebrow,
  title,
  intro,
  breadcrumbs,
  children,
}: {
  eyebrow?: string;
  title: string;
  intro?: string;
  breadcrumbs?: Crumb[];
  children?: ReactNode;
}) {
  return (
    <header className="pt-8 sm:pt-12">
      {breadcrumbs ? <Breadcrumbs items={breadcrumbs} /> : null}
      <div className="mt-6 max-w-3xl">
        {eyebrow ? <p className="eyebrow mb-3">{eyebrow}</p> : null}
        <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">{title}</h1>
        {intro ? <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg">{intro}</p> : null}
        {children}
      </div>
    </header>
  );
}
