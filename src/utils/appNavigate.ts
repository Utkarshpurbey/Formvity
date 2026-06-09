import { getAppBasePath, stripAppBasePath } from "./appBasePath";
import { DEEP_LINK_STORAGE_KEY } from "./routeParams";

/** True when built for GitHub Pages (base path baked in at build time). */
function isGitHubPagesBuild(): boolean {
  const base = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").trim();
  return Boolean(base && base !== "/");
}

/** Routes pre-exported only as `_` placeholder shells — real UUIDs need shell routing. */
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

/** Map a real UUID path to the pre-exported Next shell (RSC *.txt exists only for `_`). */
export function toShellRoute(path: string): string {
  const route = path.split(/[?#]/)[0] ?? path;
  if (/^\/workspaces\/[^/]+\/forms\/[^/]+\/analytics\/?$/.test(route)) {
    return "/workspaces/_/forms/_/analytics";
  }
  if (/^\/workspaces\/[^/]+\/forms\/[^/]+\/?$/.test(route)) {
    return "/workspaces/_/forms/_";
  }
  if (/^\/workspaces\/[^/]+\/settings\/?$/.test(route)) {
    return "/workspaces/_/settings";
  }
  if (/^\/workspaces\/[^/]+\/?$/.test(route)) {
    return "/workspaces/_";
  }
  if (/^\/r\/[^/]+\/?$/.test(route)) {
    return "/r/_";
  }
  return route;
}

function storeIntendedPath(path: string): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(DEEP_LINK_STORAGE_KEY, stripAppBasePath(path));
  } catch {
    /* ignore */
  }
}

type AppRouter = { push: (path: string) => void; replace?: (path: string) => void };

/**
 * Client navigation for GitHub Pages static export.
 * Dynamic UUID/slug paths soft-navigate to `_` shells (existing RSC payloads),
 * stash the real path in sessionStorage, and DeepLinkRestore updates the address bar.
 */
export function navigateApp(path: string, router: AppRouter, options?: { replace?: boolean }): void {
  const normalized = path.startsWith("/") ? path : `/${path}`;

  if (typeof window !== "undefined" && isGitHubPagesBuild() && isDynamicDeepLink(normalized)) {
    storeIntendedPath(normalized);
    const shell = toShellRoute(normalized);
    if (options?.replace && router.replace) router.replace(shell);
    else router.push(shell);
    return;
  }

  if (options?.replace && router.replace) router.replace(normalized);
  else router.push(normalized);
}

export function replaceApp(path: string, router: AppRouter): void {
  navigateApp(path, router, { replace: true });
}

/** Full-page open for external links / bookmarks only (404.html loader handles routing). */
export function openAppPath(path: string): void {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const base = getAppBasePath();
  window.location.assign(`${window.location.origin}${base}${normalized}`);
}
