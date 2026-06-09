/**
 * GitHub Pages serves 404.html for URLs that have no static file (real UUIDs, slugs).
 * Next export only pre-renders placeholder `_` routes as *.html files, e.g. workspaces/_.html
 * — NOT workspaces/{uuid}/ or workspaces/_/ .
 *
 * This script writes a tiny 404 loader that redirects to the correct *.html shell,
 * stores the intended path, and lets DeepLinkRestore (React) put the real URL back.
 */
import { existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const outDir = join(process.cwd(), "out");
const fallback404 = join(outDir, "404.html");

const basePath = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").trim().replace(/\/+$/, "");
const bp = basePath || "";

function shellPath(...segments) {
  const path = segments.join("/");
  return bp ? `${bp}/${path}` : `/${path}`;
}

const shells = {
  publicForm: shellPath("r/_.html"),
  workspace: shellPath("workspaces/_.html"),
  form: shellPath("workspaces/_/forms/_.html"),
  analytics: shellPath("workspaces/_/forms/_/analytics.html"),
  settings: shellPath("workspaces/_/settings.html"),
  builder: shellPath("builder.html"),
  builderV2: shellPath("builder/v2.html"),
};

for (const [key, shell] of Object.entries(shells)) {
  let rel = shell.startsWith("/") ? shell.slice(1) : shell;
  if (bp) {
    const prefix = bp.startsWith("/") ? bp.slice(1) : bp;
    if (rel.startsWith(`${prefix}/`)) rel = rel.slice(prefix.length + 1);
  }
  const file = join(outDir, rel);
  if (!existsSync(file)) {
    console.warn(`patch-static-export: missing shell for ${key}: ${file}`);
  }
}

const loaderScript = `(function () {
  var STORAGE_KEY = "formvity.intendedPath";
  var BASE = ${JSON.stringify(bp)};
  var SHELLS = ${JSON.stringify(shells)};

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
})();`;

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
console.log("patch-static-export: wrote 404.html with shell URLs:", shells);
