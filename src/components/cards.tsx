import { Link } from "@tanstack/react-router";
import { IconArrowRight, IconChevronRight } from "~/components/icons";
import { categoryName, toolCountIn, type Category, type Tool } from "~/lib/tools";

export function ToolCard({ tool }: { tool: Tool }) {
  const Icon = tool.icon;
  return (
    <li className="h-full">
      <Link
        to="/tools/$slug"
        params={{ slug: tool.slug }}
        className="card card-link group p-5 sm:p-6"
      >
        <span className="icon-tile">
          <Icon className="h-6 w-6" />
        </span>
        <h3 className="mt-4 text-base font-semibold tracking-tight text-ink">{tool.name}</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted">{tool.shortDescription}</p>
        <p className="mt-3 text-sm leading-relaxed text-muted">{tool.whatItDoes}</p>
        <span className="mt-auto inline-flex items-center gap-1.5 pt-5 text-sm font-semibold text-accent">
          Open tool
          <IconArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </span>
      </Link>
    </li>
  );
}

export function ToolCardGrid({ tools, className = "" }: { tools: Tool[]; className?: string }) {
  return (
    <ul className={`grid gap-4 sm:grid-cols-2 lg:grid-cols-3 ${className}`}>
      {tools.map((tool) => (
        <ToolCard key={tool.slug} tool={tool} />
      ))}
    </ul>
  );
}

export function CategoryCard({ category }: { category: Category }) {
  const Icon = category.icon;
  const count = toolCountIn(category.slug);
  return (
    <li className="h-full">
      <Link
        to="/categories/$slug"
        params={{ slug: category.slug }}
        className="card card-link group p-5"
      >
        <span className="icon-tile">
          <Icon className="h-6 w-6" />
        </span>
        <h3 className="mt-4 text-base font-semibold tracking-tight text-ink">{category.name}</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted">{category.description}</p>
        <span className="mt-auto inline-flex items-center gap-1.5 pt-5 text-sm font-semibold text-accent">
          {count === 1 ? "1 tool" : `${String(count)} tools`}
          <IconChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </span>
      </Link>
    </li>
  );
}

export function CategoryCardGrid({ categories }: { categories: Category[] }) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {categories.map((category) => (
        <CategoryCard key={category.slug} category={category} />
      ))}
    </ul>
  );
}

export function CategoryPill({ slug }: { slug: Tool["category"] }) {
  return (
    <Link
      to="/categories/$slug"
      params={{ slug }}
      className="inline-flex min-h-9 items-center rounded-pill border border-line bg-surface-2 px-3 text-xs font-medium text-muted hover:border-accent hover:text-accent"
    >
      {categoryName(slug)}
    </Link>
  );
}
