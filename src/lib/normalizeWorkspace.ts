import type { WorkspaceSummary } from "../api/types";

/** Map backend field names (workspaceId / workspaceName) to app shape. */
export function normalizeWorkspaceSummary(raw: unknown): WorkspaceSummary {
  const r = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  return {
    workSpaceId: String(r.workSpaceId ?? r.workspaceId ?? r.id ?? ""),
    workSpaceName: String(r.workSpaceName ?? r.workspaceName ?? r.name ?? "Workspace"),
  };
}

export function normalizeWorkspaceList(raw: unknown): WorkspaceSummary[] {
  if (!Array.isArray(raw)) return [];
  return raw.map(normalizeWorkspaceSummary).filter((w) => w.workSpaceId);
}
