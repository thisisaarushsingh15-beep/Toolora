import { IconSearch } from "~/components/icons";

/**
 * Plain GET form to /search — works without JavaScript, keeps the query in the
 * URL so results are shareable, and needs no client-side routing to submit.
 */
export function SearchForm({
  id,
  defaultValue = "",
  size = "page",
  submitLabel = "Search",
  placeholder = "What do you need to calculate or create?",
  className = "",
}: {
  id: string;
  defaultValue?: string;
  size?: "page" | "hero";
  submitLabel?: string;
  placeholder?: string;
  className?: string;
}) {
  return (
    <form action="/search" method="get" role="search" className={className}>
      <label htmlFor={id} className="sr-only">
        Search tools
      </label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <IconSearch className="pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-muted" />
          <input
            id={id}
            name="q"
            type="search"
            defaultValue={defaultValue}
            placeholder={placeholder}
            autoComplete="off"
            enterKeyHint="search"
            className={`field pl-12 ${size === "hero" ? "h-13 sm:text-base" : ""}`}
          />
        </div>
        <button type="submit" className="btn btn-primary shrink-0 sm:px-6">
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
