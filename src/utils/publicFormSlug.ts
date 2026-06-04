import { stripAppBasePath } from "./appBasePath";

/** Read published form slug from the browser URL (reliable on GitHub Pages static export). */
export function getPublicFormSlugFromLocation(): string {
  if (typeof window === "undefined") return "";
  const path = stripAppBasePath(window.location.pathname);
  const match = path.match(/^\/r\/([^/?#]+)\/?$/);
  if (!match?.[1]) return "";
  const slug = decodeURIComponent(match[1]);
  // Static export pre-renders a placeholder route at /r/_
  return slug === "_" ? "" : slug;
}
