/**
 * GitHub Pages: unknown paths (e.g. /r/my-published-slug) need a SPA fallback.
 * Use the public form shell so /r/* routes hydrate and fetch by slug client-side.
 */
import { copyFileSync, existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const outDir = join(process.cwd(), "out");
const publicFormShell = join(outDir, "r", "_.html");
const indexHtml = join(outDir, "index.html");
const fallback404 = join(outDir, "404.html");

const source = existsSync(publicFormShell) ? publicFormShell : indexHtml;
if (!existsSync(source)) {
  console.warn("patch-static-export: no export shell found at", source);
  process.exit(0);
}

copyFileSync(source, fallback404);
writeFileSync(join(outDir, ".nojekyll"), "");
console.log(`patch-static-export: wrote 404.html from ${source === publicFormShell ? "r/_.html" : "index.html"}`);
