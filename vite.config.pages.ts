/**
 * Second Vite config: a fully static export of the same site for GitHub Pages.
 *
 * GitHub Pages can only serve static files, so this build prerenders every route
 * to real HTML (with `autoSubfolderIndex`, so `/tools/x/` is a directory with an
 * index.html) and emits it under a subpath base, because Project Pages are served
 * from https://<user>.github.io/<repo>/ rather than the origin root.
 *
 * `vite.config.ts` is deliberately untouched: `bun run build` / `bun run publish`
 * keep serving the SSR preview on port 3000 with base "/".
 *
 * Output: see scripts/pages-postbuild.ts — the client directory is published as
 * dist/pages (self-contained: HTML, assets, sitemap.xml, .nojekyll).
 */
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";

/** Where the static site lives on GitHub Pages. */
const PAGES_BASE = "/Toolora/";
/** Absolute origin, used for canonicals, Open Graph and the sitemap. */
const PAGES_ORIGIN = "https://thisisaarushsingh15-beep.github.io/Toolora";
/** Working directory for the build; scripts/pages-postbuild.ts moves it to dist/pages. */
const RAW_OUT = "dist/pages-raw";

export default defineConfig({
  base: PAGES_BASE,
  build: {
    // The Start plugin puts the client build in <root>/client and the server
    // build in <root>/server. Prerendered HTML is written into the client
    // directory, so it becomes a complete static site after postbuild.
    outDir: RAW_OUT,
  },
  plugins: [
    tailwindcss(),
    tsConfigPaths({
      projects: ["./tsconfig.json"],
    }),
    tanstackStart({
      // The router needs the base path itself (not just Vite's asset base),
      // otherwise <Link> renders /tools/x instead of /Toolora/tools/x and every
      // deep link 404s on Pages.
      router: { basepath: PAGES_BASE },
      prerender: {
        enabled: true,
        crawlLinks: true,
        autoSubfolderIndex: true,
        failOnError: true,
        // Crawling follows every internal link, including ones with query
        // strings (/tools?category=…). Those are the same file as /tools/ and
        // would otherwise land in the sitemap as duplicate entries.
        filter: (page) => !page.path.includes("?"),
      },
      // The plugin's own sitemap generator, driven by the route tree.
      sitemap: { enabled: true, host: PAGES_ORIGIN },
    }),
    viteReact(),
  ],
});
