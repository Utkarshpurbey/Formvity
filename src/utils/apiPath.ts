/** Join base URL and path segments without accidental `//` from leading/trailing slashes. */
function joinUrl(base: string, ...segments: string[]): string {
  const root = base.replace(/\/+$/, "");
  const path = segments
    .map((s) => s.replace(/^\/+|\/+$/g, ""))
    .filter(Boolean)
    .join("/");
  if (!path) return root || "";
  return root ? `${root}/${path}` : `/${path}`;
}

const DEFAULT_API_ORIGIN = "https://formvity-backend.onrender.com";

const API_PATH = (process.env.NEXT_PUBLIC_API_PATH ?? "api/v1").replace(/^\/+|\/+$/g, "");

/**
 * Browser: direct `NEXT_PUBLIC_API_URL/api/v1/*` by default (same as GitHub Pages).
 * Set NEXT_PUBLIC_API_DIRECT=false to use same-origin `/api/v1` Next proxy (local backend only).
 */
function resolveApiBase(): string {
  const origin = (process.env.NEXT_PUBLIC_API_URL ?? process.env.API_PROXY_TARGET ?? DEFAULT_API_ORIGIN)
    .trim()
    .replace(/\/+$/, "");

  if (typeof window !== "undefined") {
    if (process.env.NEXT_PUBLIC_API_DIRECT === "false") return "";
    return origin;
  }
  return origin;
}

export const getCompleteHost = (endpoint: string) =>
  joinUrl(resolveApiBase(), API_PATH, endpoint);

/** Published form for responder runtime (`GET` → `{ data: { formDef } }`). */
export const publicFormApi = (slug: string) => getCompleteHost(`public/forms/${slug}`);

/** Maker form definition (`GET` → `{ data: { formDef } }`). */
export const workspaceFormApi = (workspaceId: string, formId: string) =>
  getCompleteHost(`workspaces/${workspaceId}/forms/${formId}`);
