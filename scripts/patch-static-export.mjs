/**
 * GitHub Pages: unknown paths (e.g. /Formvity/workspaces/{uuid}) need a SPA fallback.
 * Use the main app shell (index.html) — NOT r/_.html — so workspace/builder routes hydrate.
 * Public /r/{slug} URLs rely on StaticExportRouteFix + getPublicFormSlugFromLocation().
 */
import { copyFileSync, existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const outDir = join(process.cwd(), "out");
const indexHtml = join(outDir, "index.html");
const fallback404 = join(outDir, "404.html");

if (!existsSync(indexHtml)) {
  console.warn("patch-static-export: index.html not found at", indexHtml);
  process.exit(0);
}

copyFileSync(indexHtml, fallback404);
writeFileSync(join(outDir, ".nojekyll"), "");
console.log("patch-static-export: wrote 404.html from index.html (app shell SPA fallback)");
