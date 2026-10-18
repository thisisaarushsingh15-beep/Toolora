/**
 * Turn the raw GitHub Pages build into a self-contained static directory.
 *
 * The Start plugin writes the prerendered HTML into the *client* half of
 * <outDir> (dist/pages-raw/client) and a server bundle into dist/pages-raw/server.
 * GitHub Pages needs only the client half, at the root of the artifact, plus a
 * `.nojekyll` file (otherwise Jekyll drops directories starting with `_` and
 * processes the whole tree).
 *
 *   dist/pages-raw/client/**  ->  dist/pages/**
 *   dist/pages/.nojekyll      (created here)
 *   dist/pages-raw            (removed)
 */
import { cp, mkdir, rm, writeFile, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";

const RAW_OUT = "dist/pages-raw";
const CLIENT_DIR = join(RAW_OUT, "client");
const OUT_DIR = "dist/pages";

async function countHtml(dir: string): Promise<number> {
  let n = 0;
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) n += await countHtml(join(dir, entry.name));
    else if (entry.name.endsWith(".html")) n += 1;
  }
  return n;
}

if (!existsSync(CLIENT_DIR)) {
  throw new Error(`pages-postbuild: ${CLIENT_DIR} not found — did the build run?`);
}

await rm(OUT_DIR, { recursive: true, force: true });
await mkdir(OUT_DIR, { recursive: true });
await cp(CLIENT_DIR, OUT_DIR, { recursive: true });
await writeFile(join(OUT_DIR, ".nojekyll"), "");

await rm(RAW_OUT, { recursive: true, force: true });

const htmlFiles = await countHtml(OUT_DIR);
const indexExists = existsSync(join(OUT_DIR, "index.html"));
if (!indexExists) throw new Error("pages-postbuild: output has no index.html");
if (htmlFiles < 2) {
  // A single index.html would mean prerendering silently did not happen.
  throw new Error(`pages-postbuild: expected prerendered HTML files, found ${htmlFiles}`);
}

console.log(`pages-postbuild: wrote ${OUT_DIR} (${htmlFiles} prerendered html files)`);
