import { Link } from "@tanstack/react-router";

/**
 * Hand-coded SVG wordmark: a hex nut with a spanner slot through the middle,
 * in the single accent colour. No external image assets anywhere on the site.
 */
export function LogoMark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      aria-hidden="true"
      focusable="false"
      fill="none"
    >
      <path
        d="M16 1.9 28.2 8.95v14.1L16 30.1 3.8 23.05V8.95Z"
        className="fill-accent"
      />
      <path
        d="M16 6.6 23.9 11.2v9.6L16 25.4 8.1 20.8v-9.6Z"
        className="fill-canvas"
      />
      <path
        d="M16 10.4 20.6 13v5.2L16 20.8 11.4 18.2V13Z"
        className="fill-accent"
      />
      <path d="M7.4 22.6 24.6 9.4" className="stroke-canvas" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link
      to="/"
      className={`inline-flex items-center gap-2.5 rounded-lg text-ink ${className}`}
      aria-label="Toolora — home"
    >
      <LogoMark className="h-8 w-8 shrink-0" />
      <span className="text-[1.35rem] leading-none font-semibold tracking-tight">Toolora</span>
    </Link>
  );
}
