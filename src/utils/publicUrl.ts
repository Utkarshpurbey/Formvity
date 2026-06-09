import { getAppOrigin, stripAppBasePath } from "./appBasePath";
import { stripStaticHtmlSuffix } from "./routeParams";

/** Build the public responder URL for a published form slug. */
export function buildPublicUrl(slug: string): string {
  const base = getAppOrigin();
  return `${base}/r/${slug}`;
}

/** Slugify a form title for URL suggestions (lowercase, hyphens, no leading/trailing hyphens). */
export function slugifyTitle(title: string): string {
  return title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

/** Read published form slug from the browser URL (reliable on GitHub Pages static export). */
export function getPublicFormSlugFromLocation(): string {
  if (typeof window === "undefined") return "";
  const path = stripStaticHtmlSuffix(stripAppBasePath(window.location.pathname));
  const match = path.match(/^\/r\/([^/?#]+)\/?$/);
  if (!match?.[1]) return "";
  const slug = decodeURIComponent(match[1]);
  return slug === "_" ? "" : slug;
}
