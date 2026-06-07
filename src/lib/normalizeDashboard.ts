import type { FormSummary, WorkspaceDashboard } from "../api/types";

export function normalizeWorkspaceDashboard(raw: unknown): WorkspaceDashboard {
  const r = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const recentForms = (Array.isArray(r.recentForms) ? r.recentForms : []) as FormSummary[];
  const workspaceId = String(r.workspaceId ?? r.workSpaceId ?? "");
  return {
    workspaceId,
    workspaceName: String(r.workspaceName ?? r.workSpaceName ?? "Workspace"),
    formCount: Number(r.formCount ?? recentForms.length),
    recentForms,
  };
}
