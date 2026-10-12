# Toolora

**Useful Tools. Zero Hassle.**

Toolora is a free, no-account online tools website: ten focused browser-based tools
(calculators, converters, text utilities, a budget planner and a study timer) on fast,
mobile-friendly pages. Every calculation runs in the visitor's own browser — there is no
backend, no database, no account and no paid API.

## Stack

- **TanStack Start** (React 19) with file-based routing — `src/routes/` maps to URLs
- **TypeScript**, strict
- **Tailwind CSS v4** with design tokens in `src/styles/app.css` (light + dark themes)
- **Bun** as the package manager, runner and production server
- **Bun's built-in test runner** (`bun test`) — no extra test dependency

## Getting started

```bash
bun install
bun run dev      # dev server on http://localhost:3000
bun test         # unit tests for the pure calculation modules
bun run build    # production build
bun run start    # serve the production build on port 3000
```

## Project layout

```
src/
  routes/            one file per URL (TanStack Start file-based routing)
  components/        shared UI: header, footer, cards, tool page template
  components/tools/  the interactive calculator for each tool + a slug → component map
  lib/               the tool registry, SEO head builder, theme + recent-tools storage
  lib/calc/          PURE calculation modules (no React, no DOM) and their tests
  styles/app.css     design tokens and component classes
public/              favicon and static assets
```

Tool logic deliberately lives in `src/lib/calc/` as pure functions so it can be unit
tested without a browser. The UI components are thin: they read state, call the pure
function, and render the result and any field-level errors.

## The ten tools

| Tool | URL |
| --- | --- |
| Percentage Calculator | `/tools/percentage-calculator` |
| Grade Calculator | `/tools/grade-calculator` |
| Age Calculator | `/tools/age-calculator` |
| Date Difference Calculator | `/tools/date-difference-calculator` |
| Word & Character Counter | `/tools/word-counter` |
| Text Case Converter | `/tools/text-case-converter` |
| Duplicate Line Remover | `/tools/remove-duplicate-lines` |
| Unit Converter | `/tools/unit-converter` |
| Budget Planner | `/tools/budget-planner` |
| Study Timer | `/tools/study-timer` |

Add a tool by adding one entry to the registry in `src/lib/tools.ts` — the homepage,
search, category pages, related-tool links and the sitemap all read from it.

## Privacy

Nothing a visitor types is uploaded. Text and numbers are processed in the browser and
discarded when the page closes. The only thing stored locally is a list of recently
opened tool names (`localStorage`), which the visitor can clear from the homepage.

## Licence

Source is provided for the Toolora project. See the site's Terms of Use and Disclaimer
pages for how the tools may be used.
