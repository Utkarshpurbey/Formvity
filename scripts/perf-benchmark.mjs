#!/usr/bin/env node
/**
 * Captures Next.js build output and static perf signals for before/after comparison.
 * Usage: node scripts/perf-benchmark.mjs [--label baseline|after]
 */
import { execSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const reportsDir = join(root, "perf", "reports");

const label = process.argv.includes("--label")
  ? process.argv[process.argv.indexOf("--label") + 1] ?? "run"
  : `run-${Date.now()}`;

function parseBuildOutput(output) {
  const routes = [];
  const routeRe = /(\/[^\s]+)\s+([\d.]+\s*k?B)\s+([\d.]+\s*k?B)/;
  for (const line of output.split("\n")) {
    if (!line.includes("kB")) continue;
    const m = line.match(routeRe);
    if (!m) continue;
    routes.push({
      route: m[1],
      size: m[2].trim(),
      firstLoadJs: m[3].trim(),
    });
  }

  const sharedMatch = output.match(/First Load JS shared by all\s+([\d.]+\s*k?B)/);
  const sharedFirstLoadJs = sharedMatch?.[1] ?? null;

  return { routes, sharedFirstLoadJs };
}

function countPattern(fileGlob, pattern) {
  try {
    const out = execSync(`rg -l "${pattern}" ${fileGlob}`, {
      cwd: root,
      encoding: "utf8",
      stdio: ["pipe", "pipe", "ignore"],
    });
    return out.trim() ? out.trim().split("\n").length : 0;
  } catch {
    return 0;
  }
}

function analyzeSourceSignals() {
  const workspacePage = join(root, "app/(app)/workspaces/[workspaceId]/page.tsx");
  const authBootstrap = join(root, "src/components/AuthBootstrap.tsx");
  const appShell = join(root, "src/components/layout/AppShellChrome.tsx");

  const signals = {
    perFormAnalyticsCalls: 0,
    authBlocksOnPathname: false,
    pageContentRemountsOnNav: false,
    fetchWorkspacesHasCacheGuard: false,
    fetchFormsHasCacheGuard: false,
    authUserCache: false,
  };

  if (existsSync(workspacePage)) {
    const src = readFileSync(workspacePage, "utf8");
    signals.perFormAnalyticsCalls = (src.match(/useFormResponseCount/g) ?? []).length;
  }
  if (existsSync(authBootstrap)) {
    const src = readFileSync(authBootstrap, "utf8");
    signals.authBlocksOnPathname = /\[pathname/.test(src);
  }
  if (existsSync(appShell)) {
    const src = readFileSync(appShell, "utf8");
    signals.pageContentRemountsOnNav = /key=\{pathname\}/.test(src);
  }

  const wsSlice = join(root, "src/store/slices/workspaceSlice.ts");
  const formsSlice = join(root, "src/store/slices/formsSlice.ts");
  if (existsSync(wsSlice)) {
    signals.fetchWorkspacesHasCacheGuard = /condition:/.test(readFileSync(wsSlice, "utf8"));
  }
  if (existsSync(formsSlice)) {
    signals.fetchFormsHasCacheGuard = /condition:/.test(readFileSync(formsSlice, "utf8"));
  }

  signals.authUserCache = existsSync(join(root, "src/utils/userCache.ts"));

  return signals;
}

function compareReports(before, after) {
  const beforeByRoute = Object.fromEntries(before.build.routes.map((r) => [r.route, r]));
  const deltas = after.build.routes.map((route) => {
    const prev = beforeByRoute[route.route];
    if (!prev) return { route: route.route, firstLoadJs: route.firstLoadJs, delta: "new" };
    return {
      route: route.route,
      before: prev.firstLoadJs,
      after: route.firstLoadJs,
      delta: prev.firstLoadJs === route.firstLoadJs ? "unchanged" : "changed",
    };
  });
  return { deltas, signals: { before: before.signals, after: after.signals } };
}

console.log(`\n⏱  Running perf benchmark (${label})…\n`);

const buildOutput = execSync("npm run build", {
  cwd: root,
  encoding: "utf8",
  stdio: ["pipe", "pipe", "pipe"],
});

const report = {
  label,
  timestamp: new Date().toISOString(),
  build: parseBuildOutput(buildOutput),
  signals: analyzeSourceSignals(),
};

mkdirSync(reportsDir, { recursive: true });
const outPath = join(reportsDir, `${label}.json`);
writeFileSync(outPath, JSON.stringify(report, null, 2));

console.log("Build route sizes (First Load JS):");
for (const r of report.build.routes) {
  console.log(`  ${r.route.padEnd(52)} ${r.firstLoadJs}`);
}
console.log(`\nShared First Load JS: ${report.build.sharedFirstLoadJs ?? "n/a"}`);
console.log("\nSource signals:");
console.log(JSON.stringify(report.signals, null, 2));
console.log(`\n✓ Report saved to ${outPath}`);

const baselinePath = join(reportsDir, "baseline.json");
if (label !== "baseline" && existsSync(baselinePath)) {
  const baseline = JSON.parse(readFileSync(baselinePath, "utf8"));
  const comparison = compareReports(baseline, report);
  const comparePath = join(reportsDir, `compare-${label}.json`);
  writeFileSync(comparePath, JSON.stringify(comparison, null, 2));
  console.log(`\nComparison vs baseline saved to ${comparePath}`);
}
