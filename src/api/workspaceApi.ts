import { apiData } from "./http";
import type { WorkspaceMember, WorkspaceSummary } from "./types";
import { normalizeWorkspaceList, normalizeWorkspaceSummary } from "../lib/normalizeWorkspace";

export async function listWorkspaces(): Promise<WorkspaceSummary[]> {
  const raw = await apiData<unknown>("workspaces");
  return normalizeWorkspaceList(raw);
}

export function createWorkspace(workSpaceName: string) {
  return apiData<{ id: string; name: string }>("workspaces", {
    method: "POST",
    body: JSON.stringify({ workSpaceName }),
  });
}

export function getWorkspace(workSpaceId: string) {
  return apiData<unknown>(`workspaces/${workSpaceId}`);
}

export function deleteWorkspace(workSpaceId: string) {
  return apiData<string>(`workspaces/${workSpaceId}`, { method: "DELETE" });
}

export function listMembers(workSpaceId: string) {
  return apiData<WorkspaceMember[]>(`workspaces/${workSpaceId}/members`);
}
