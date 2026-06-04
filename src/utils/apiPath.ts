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

const API_PATH = (process.env.NEXT_PUBLIC_API_PATH ?? "api/v1").replace(/^\/+|\/+$/g, "");

/**
 * Browser: same-origin `/api/v1/*` (Next route handler proxies to backend and strips
 * strips WWW-Authenticate on 401 to avoid browser auth dialogs).
 * Server: direct backend URL when configured.
 */
function resolveApiBase(): string {
  if (typeof window !== "undefined") {
    if (process.env.NEXT_PUBLIC_API_DIRECT === "true") {
      const direct = (process.env.NEXT_PUBLIC_API_URL ?? "").trim().replace(/\/+$/, "");
      return direct;
    }
    return "";
  }
  return (process.env.NEXT_PUBLIC_API_URL ?? process.env.API_PROXY_TARGET ?? "http://localhost:8081")
    .trim()
    .replace(/\/+$/, "");
}

export const getCompleteHost = (endpoint: string) =>
  joinUrl(resolveApiBase(), API_PATH, endpoint);

/** Published form for responder runtime (`GET` → `{ data: { formDef } }`). */
export const publicFormApi = (slug: string) => getCompleteHost(`public/forms/${slug}`);

/** Maker form definition (`GET` → `{ data: { formDef } }`). */
export const workspaceFormApi = (workspaceId: string, formId: string) =>
  getCompleteHost(`workspace/${workspaceId}/forms/${formId}`);
