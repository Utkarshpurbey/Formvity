import { getAppBasePath } from "./appBasePath";

/** True when built for GitHub Pages (base path baked in at build time). */
function isGitHubPagesBuild(): boolean {
  const base = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").trim();
  return Boolean(base && base !== "/");
}

/** Routes pre-exported only as `_` placeholder shells — real UUIDs need a full page load. */
export function isDynamicDeepLink(path: string): boolean {
  const route = path.split(/[?#]/)[0] ?? path;
  const ws = route.match(/^\/workspaces\/([^/]+)/)?.[1];
  if (ws && ws !== "_") return true;
  const form = route.match(/\/forms\/([^/]+)/)?.[1];
  if (form && form !== "_") return true;
  const slug = route.match(/^\/r\/([^/]+)/)?.[1];
  if (slug && slug !== "_") return true;
  return false;
}

type AppRouter = { push: (path: string) => void; replace?: (path: string) => void };

/** Client navigation that uses full page loads for dynamic IDs on static export. */
export function navigateApp(path: string, router: AppRouter, options?: { replace?: boolean }): void {
  const normalized = path.startsWith("/") ? path : `/${path}`;

  if (typeof window !== "undefined" && isGitHubPagesBuild() && isDynamicDeepLink(normalized)) {
    const base = getAppBasePath();
    const url = `${window.location.origin}${base}${normalized}`;
    if (options?.replace) window.location.replace(url);
    else window.location.assign(url);
    return;
  }

  if (options?.replace && router.replace) router.replace(normalized);
  else router.push(normalized);
}

export function replaceApp(path: string, router: AppRouter): void {
  navigateApp(path, router, { replace: true });
}
