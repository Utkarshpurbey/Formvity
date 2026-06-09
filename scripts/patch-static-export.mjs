/**
 * GitHub Pages serves 404.html for URLs that have no static file (real UUIDs, slugs).
 * Next export only pre-renders placeholder `_` routes as *.html files, e.g. workspaces/_.html
 * — NOT workspaces/{uuid}/ or workspaces/_/.
 *
 * This script writes a tiny 404 loader that redirects to the correct *.html shell,
 * stores the intended path, and lets DeepLinkRestore (React) put the real URL back.
 */
import { existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const outDir = join(process.cwd(), "out");
const fallback404 = join(outDir, "404.html");

const basePath = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").trim().replace(/\/+$/, "");

/** Files that exist under out/ after `next build`. */
const SHELLS = {
  publicForm: "r/_.html",
  workspace: "workspaces/_.html",
  form: "workspaces/_/forms/_.html",
  analytics: "workspaces/_/forms/_/analytics.html",
  settings: "workspaces/_/settings.html",
  builder: "builder.html",
  builderV2: "builder/v2.html",
};

for (const [key, rel] of Object.entries(SHELLS)) {
  if (!existsSync(join(outDir, rel))) {
    console.warn(`patch-static-export: shell missing (${key}): ${rel}`);
  }
}

function webPath(relativeFile) {
  return basePath ? `${basePath}/${relativeFile}` : `/${relativeFile}`;
}

const shellUrls = Object.fromEntries(
  Object.entries(SHELLS).map(([k, rel]) => [k, webPath(rel)]),
);

const loaderScript = `
(function () {
  var STORAGE_KEY = "formvity.intendedPath";
  var BASE = ${JSON.stringify(basePath)};
  var SHELLS = ${JSON.stringify(shellUrls)};

  function stripBase(path) {
    if (!BASE) return path;
    if (path === BASE) return "/";
    if (path.indexOf(BASE + "/") === 0) return path.slice(BASE.length) || "/";
    return path;
  }

  function routeOnly(path) {
    return stripBase(path).split(/[?#]/)[0].replace(/\\/$/, "").replace(/\\.html$/i, "") || "/";
  }

  function pickShell(route) {
    if (/^\\/r\\//.test(route)) return SHELLS.publicForm;
    if (/^\\/workspaces\\/[^/]+\\/forms\\/[^/]+\\/analytics\\/?$/.test(route)) return SHELLS.analytics;
    if (/^\\/workspaces\\/[^/]+\\/forms\\/[^/]+\\/?$/.test(route)) return SHELLS.form;
    if (/^\\/workspaces\\/[^/]+\\/settings\\/?$/.test(route)) return SHELLS.settings;
    if (/^\\/workspaces\\/[^/]+\\/?$/.test(route)) return SHELLS.workspace;
    if (/^\\/builder\\/v2\\/?$/.test(route)) return SHELLS.builderV2;
    if (/^\\/builder\\/?$/.test(route)) return SHELLS.builder;
    return "";
  }

  var full = location.pathname + location.search + location.hash;
  var route = routeOnly(location.pathname);
  var shell = pickShell(route);

  if (!shell) {
    location.replace(BASE ? BASE + "/" : "/");
    return;
  }

  try {
    if (location.pathname !== shell) {
      sessionStorage.setItem(STORAGE_KEY, stripBase(full));
    }
  } catch (e) {}

  if (location.pathname === shell) return;

  location.replace(shell + location.search + location.hash);
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
console.log("patch-static-export: wrote 404.html with shell URLs:", shellUrls);
