/** Optional NEXT_PUBLIC_BASE_PATH for subpath deployments; empty on Vercel by default. */
function appBasePath(): string {
  return (process.env.NEXT_PUBLIC_BASE_PATH ?? "").trim().replace(/\/+$/, "");
}

export function withAppBasePath(href: string): string {
  const base = appBasePath();
  if (!base || base === "/") return href;
  if (href.startsWith("http")) return href;
  if (href.startsWith(base)) return href;
  return `${base}${href.startsWith("/") ? href : `/${href}`}`;
}

export function stripAppBasePath(pathname: string): string {
  const base = appBasePath();
  if (!base || base === "/") return pathname;
  if (pathname === base) return "/";
  if (pathname.startsWith(`${base}/`)) return pathname.slice(base.length) || "/";
  return pathname;
}

/** App origin for public form links, e.g. https://your-app.vercel.app */
export function getAppOrigin(): string {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  const fromEnv = (process.env.NEXT_PUBLIC_APP_URL ?? process.env.VERCEL_PROJECT_PRODUCTION_URL ?? "").trim().replace(/\/+$/, "");
  if (fromEnv) {
    if (fromEnv.startsWith("http://") || fromEnv.startsWith("https://")) return fromEnv;
    return `https://${fromEnv}`;
  }
  return "https://formvity.in";
}
