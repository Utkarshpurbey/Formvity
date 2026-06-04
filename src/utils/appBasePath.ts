/** Known app route segments (first segment after optional GitHub Pages repo prefix). */
const APP_ROUTE = "(?:workspace|builder|login|register|templates|home|r)";

/** Infer `/RepoName` prefix when env was not baked in at build time (GitHub Pages project sites). */
function inferBasePathFromLocation(pathname: string): string {
  const match = pathname.match(new RegExp(`^(\\/[^/]+)\\/${APP_ROUTE}(?:\\/|$)`));
  return match?.[1] ?? "";
}

/** App base path for GitHub Pages project sites (empty for user sites or local dev). */
export function getAppBasePath(): string {
  const envBase = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").trim().replace(/\/+$/, "");
  if (envBase && envBase !== "/") return envBase;

  if (typeof window !== "undefined") {
    return inferBasePathFromLocation(window.location.pathname);
  }
  return "";
}

/** Strip GitHub Pages repo prefix so `/Form-Builder-UI/r/x` → `/r/x`. */
export function stripAppBasePath(pathname: string): string {
  const base = getAppBasePath();
  if (!base) return pathname;
  if (pathname === base) return "/";
  if (pathname.startsWith(`${base}/`)) return pathname.slice(base.length) || "/";
  return pathname;
}

/** Origin + optional base path, e.g. https://user.github.io/Form-Builder-UI */
export function getAppOrigin(): string {
  const basePath = getAppBasePath();
  if (typeof window !== "undefined") {
    return `${window.location.origin}${basePath}`;
  }
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "").trim().replace(/\/+$/, "");
  return appUrl ? `${appUrl}${basePath}` : basePath || "";
}
