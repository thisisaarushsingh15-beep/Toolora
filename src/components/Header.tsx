import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { IconClose, IconMenu, IconSearch } from "~/components/icons";
import { Logo } from "~/components/Logo";
import { ThemeToggle } from "~/components/ThemeToggle";
import { container } from "~/components/ui";

const NAV = [
  { to: "/", label: "Home", exact: true },
  { to: "/tools", label: "All Tools", exact: false },
  { to: "/categories", label: "Categories", exact: false },
  { to: "/about", label: "About", exact: false },
] as const;

const linkClass = "rounded-pill px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-surface-2 hover:text-ink";

export function Header() {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  // The menu is one-hand-friendly; it closes as soon as navigation happens.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-canvas">
      <div className={`${container} flex h-16 items-center gap-2 sm:gap-4`}>
        <Logo className="shrink-0" />

        <nav aria-label="Main" className="hidden items-center gap-0.5 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.exact }}
              className={linkClass}
              activeProps={{
                className:
                  "rounded-pill px-3 py-2 text-sm font-semibold text-accent bg-accent-soft",
              }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <form action="/search" method="get" role="search" className="relative hidden sm:block">
            <label htmlFor="header-search" className="sr-only">
              Search tools
            </label>
            <IconSearch className="pointer-events-none absolute top-1/2 left-3.5 h-4.5 w-4.5 -translate-y-1/2 text-muted" />
            <input
              id="header-search"
              name="q"
              type="search"
              placeholder="Search tools"
              autoComplete="off"
              enterKeyHint="search"
              className="field h-11 w-44 pl-10 lg:w-60"
            />
          </form>

          <Link to="/search" aria-label="Search tools" className="btn btn-ghost h-11 w-11 px-0 sm:hidden">
            <IconSearch className="h-5 w-5" />
          </Link>

          <ThemeToggle />

          <button
            type="button"
            className="btn btn-ghost h-11 w-11 px-0 md:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <IconClose className="h-5 w-5" /> : <IconMenu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open ? (
        <div id="mobile-menu" className="border-t border-line bg-surface md:hidden">
          <div className={`${container} py-5`}>
            <form action="/search" method="get" role="search">
              <label htmlFor="mobile-search" className="sr-only">
                Search tools
              </label>
              <div className="relative">
                <IconSearch className="pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-muted" />
                <input
                  id="mobile-search"
                  name="q"
                  type="search"
                  placeholder="Search tools"
                  autoComplete="off"
                  enterKeyHint="search"
                  className="field pl-12"
                />
              </div>
            </form>
            <nav aria-label="Mobile" className="mt-4 flex flex-col gap-1">
              {NAV.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  activeOptions={{ exact: item.exact }}
                  className="flex min-h-12 items-center rounded-card px-3 text-sm font-medium text-ink hover:bg-surface-2"
                  activeProps={{
                    className:
                      "flex min-h-12 items-center rounded-card px-3 text-sm font-semibold text-accent bg-accent-soft",
                  }}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      ) : null}
    </header>
  );
}
