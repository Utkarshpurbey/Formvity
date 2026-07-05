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

const DEFAULT_API_ORIGIN = "https://api-formvity.onrender.com";

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

/** Resolve a relative API path to a full request URL. */
export const getCompleteHost = (endpoint: string) =>
  joinUrl(resolveApiBase(), API_PATH, endpoint);

/**
 * Relative paths under `/api/v1`. Pass to `apiFetch` / `apiData` or wrap with `getCompleteHost`.
 */
export const ApiPath = {
  auth: {
    login: "auth/login",
    register: "auth/register",
    me: "auth/me",
    logout: "auth/logout",
    invitePreview: (token: string) => `auth/invite/${encodeURIComponent(token)}`,
    activate: "auth/activate",
  },
  workspaces: {
    list: "workspaces",
    byId: (workspaceId: string) => `workspaces/${workspaceId}`,
    dashboard: (workspaceId: string) => `workspaces/${workspaceId}/dashboard`,
    members: (workspaceId: string) => `workspaces/${workspaceId}/members`,
  },
  forms: {
    list: (workspaceId: string) => `workspaces/${workspaceId}/forms`,
    byId: (workspaceId: string, formId: string) => `workspaces/${workspaceId}/forms/${formId}`,
    delete: (workspaceId: string, formId: string, hard = false) =>
      `workspaces/${workspaceId}/forms/${formId}${hard ? "?hard=true" : ""}`,
    publishStatus: (workspaceId: string, formId: string) =>
      `workspaces/${workspaceId}/forms/${formId}/publish-status`,
    publish: (workspaceId: string, formId: string) =>
      `workspaces/${workspaceId}/forms/${formId}/publish`,
    unpublish: (workspaceId: string, formId: string) =>
      `workspaces/${workspaceId}/forms/${formId}/unpublish`,
    /** FormAnalyticsController — GET …/analytics?days= */
    analyticsOverview: (workspaceId: string, formId: string, days = 7) =>
      `workspaces/${workspaceId}/forms/${formId}/analytics?days=${days}`,
    /** GET …/analytics/summary */
    analyticsSummary: (workspaceId: string, formId: string) =>
      `workspaces/${workspaceId}/forms/${formId}/analytics/summary`,
    /** GET …/analytics/timeline?days= */
    analyticsTimeline: (workspaceId: string, formId: string, days = 7) =>
      `workspaces/${workspaceId}/forms/${formId}/analytics/timeline?days=${days}`,
    /** GET …/analytics/questions */
    analyticsQuestions: (workspaceId: string, formId: string) =>
      `workspaces/${workspaceId}/forms/${formId}/analytics/questions`,
    /** GET …/analytics/insights */
    analyticsInsights: (workspaceId: string, formId: string, days = 7) =>
      `workspaces/${workspaceId}/forms/${formId}/analytics/insights?days=${days}`,
    /** GET …/submissions?page=&size= */
    submissions: (workspaceId: string, formId: string, page = 0, size = 20) =>
      `workspaces/${workspaceId}/forms/${formId}/submissions?page=${page}&size=${size}`,
  },
  public: {
    form: (slug: string) => `public/forms/${slug}`,
    submit: (slug: string) => `public/forms/${slug}/submit`,
  },
} as const;

/** Full URLs for requests that bypass `apiFetch` (e.g. raw `fetch` with AbortSignal). */
export const apiUrl = {
  publicForm: (slug: string) => getCompleteHost(ApiPath.public.form(slug)),
  publicSubmit: (slug: string) => getCompleteHost(ApiPath.public.submit(slug)),
  workspaceForm: (workspaceId: string, formId: string) =>
    getCompleteHost(ApiPath.forms.byId(workspaceId, formId)),
};
