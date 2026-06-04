/** Build the public responder URL for a published form slug. */
export function buildPublicUrl(slug: string): string {
  const base =
    typeof process !== "undefined" && process.env.NEXT_PUBLIC_APP_URL
      ? process.env.NEXT_PUBLIC_APP_URL.replace(/\/+$/, "")
      : typeof window !== "undefined"
        ? window.location.origin
        : "";
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
