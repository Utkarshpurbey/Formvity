/**
 * GitHub Pages serves 404.html for unknown paths (real UUIDs, slugs, etc.).
 * This loader picks the correct pre-exported Next shell, stashes the intended path,
 * and redirects — the app restores the full URL client-side (see DeepLinkRestore).
 */
import { existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const outDir = join(process.cwd(), "out");
const fallback404 = join(outDir, "404.html");

/** Inline script — runs before React; must stay ES5-safe for older WebViews. */
const loaderScript = `
(function () {
  var STORAGE_KEY = "formvity.intendedPath";
  var APP_ROUTE = "(?:workspaces|workspace|builder|login|register|templates|home|r)";
  var path = location.pathname;
  var baseMatch = path.match(new RegExp("^(\\\\/[^/]+)\\\\/" + APP_ROUTE + "(?:\\\\/|$)"));
  var base = baseMatch ? baseMatch[1] : "";
  var route = base ? path.slice(base.length) : path;
  if (!route) route = "/";

  var shellRoute = "";
  if (/^\\\\/r\\\\//.test(route)) shellRoute = "/r/_/";
  else if (/^\\\\/workspaces\\\\/[^/]+\\\\/forms\\\\/[^/]+\\\\/analytics\\\\/?$/.test(route)) shellRoute = "/workspaces/_/forms/_/analytics/";
  else if (/^\\\\/workspaces\\\\/[^/]+\\\\/forms\\\\/[^/]+\\\\/?$/.test(route)) shellRoute = "/workspaces/_/forms/_/";
  else if (/^\\\\/workspaces\\\\/[^/]+\\\\/settings\\\\/?$/.test(route)) shellRoute = "/workspaces/_/settings/";
  else if (/^\\\\/workspaces\\\\/[^/]+\\\\/?$/.test(route)) shellRoute = "/workspaces/_/";
  else if (/^\\\\/builder\\\\//.test(route)) shellRoute = "/builder/";

  if (!shellRoute) return;

  var normalize = function (p) { return p.replace(/\\\\/$/, "") || "/"; };
  if (normalize(route) === normalize(shellRoute)) return;

  try {
    sessionStorage.setItem(STORAGE_KEY, route + location.search + location.hash);
  } catch (e) {}

  location.replace(base + shellRoute);
})();
`.trim();

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Formvity</title>
<script>${loaderScript}</script>
</head>
<body style="margin:0;font-family:system-ui,sans-serif;color:#5f6368">
<p style="padding:2rem">Loading…</p>
</body>
</html>
`;

writeFileSync(fallback404, html);
writeFileSync(join(outDir, ".nojekyll"), "");
console.log("patch-static-export: wrote smart 404.html (shell router + deep-link restore)");
