/**
 * Site-wide SEO constants and one head builder, so every route ships a unique
 * title, a meta description, a canonical link and Open Graph / Twitter tags.
 */

/**
 * The origin every canonical, Open Graph URL and sitemap entry is built from.
 *
 * Defaults to the live preview origin. The static GitHub Pages build sets
 * VITE_SITE_URL (see vite.config.pages.ts / the deploy-pages workflow) because
 * that build is served from https://<user>.github.io/Toolora instead — the
 * value is read at build time, so each output embeds its own origin.
 */
const DEFAULT_ORIGIN = "https://f87ba6f3a5b73ddd0c1ad37f4d1c6ad1.ctonew.app";

function configuredOrigin(): string {
  let fromEnv: string | undefined;
  try {
    // Vite replaces import.meta.env at build time (client and SSR builds).
    fromEnv = (import.meta as unknown as { env?: Record<string, string | undefined> }).env
      ?.VITE_SITE_URL;
  } catch {
    fromEnv = undefined;
  }
  if (!fromEnv && typeof process !== "undefined" && process.env) {
    fromEnv = process.env.VITE_SITE_URL;
  }
  return (fromEnv || DEFAULT_ORIGIN).replace(/\/+$/, "");
}

export const SITE = {
  name: "Toolora",
  tagline: "Useful Tools. Zero Hassle.",
  /** Public origin of the live site. Overridable at build time with VITE_SITE_URL. */
  url: configuredOrigin(),
  description:
    "Free online tools that run in your browser — percentage, grade, age and date calculators, a word counter, text and unit converters, a budget planner and a study timer. No account needed.",
};

export function absoluteUrl(path: string): string {
  return `${SITE.url}${path.startsWith("/") ? path : `/${path}`}`;
}

export type HeadInput = {
  title: string;
  description: string;
  /** Path used for the canonical link, e.g. "/tools/word-counter". */
  path: string;
  /** Hide from search engines (used on /search). */
  noindex?: boolean;
  /**
   * JSON-LD objects. Use breadcrumbLd() where the breadcrumb is real.
   * (No og:image yet — the site ships no raster asset, and a fake one would be
   * worse than none. Add a real 1200x630 PNG in phase 4 if wanted.)
   */
  jsonLd?: Record<string, unknown>[];
};

export function pageHead({ title, description, path, noindex, jsonLd }: HeadInput) {
  const url = absoluteUrl(path);
  const fullTitle = title.includes(SITE.name) ? title : `${title} | ${SITE.name}`;
  return {
    meta: [
      { title: fullTitle },
      { name: "description", content: description },
      { name: "theme-color", content: "#4f46e5" },
      ...(noindex ? [{ name: "robots", content: "noindex, follow" }] : []),
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: SITE.name },
      { property: "og:title", content: fullTitle },
      { property: "og:description", content: description },
      { property: "og:url", content: url },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: fullTitle },
      { name: "twitter:description", content: description },
    ],
    links: [{ rel: "canonical", href: url }],
    ...(jsonLd && jsonLd.length > 0
      ? {
          scripts: jsonLd.map((data) => ({
            type: "application/ld+json",
            children: JSON.stringify(data),
          })),
        }
      : {}),
  };
}

/** BreadcrumbList JSON-LD — only call this where the breadcrumb is real. */
export function breadcrumbLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}
