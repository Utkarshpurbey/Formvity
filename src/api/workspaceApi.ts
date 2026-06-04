import { apiData } from "./http";
import type { WorkspaceMember, WorkspaceSummary } from "./types";

export function listWorkspaces() {
  return apiData<WorkspaceSummary[]>("workspace");
}

export function createWorkspace(workSpaceName: string) {
  return apiData<{ id: string; name: string }>("workspace", {
    method: "POST",
    body: JSON.stringify({ workSpaceName }),
  });
}

export function getWorkspace(workSpaceId: string) {
  return apiData<unknown>(`workspace/${workSpaceId}`);
}

export function deleteWorkspace(workSpaceId: string) {
  return apiData<string>(`workspace/${workSpaceId}`, { method: "DELETE" });
}

export function listMembers(workSpaceId: string) {
  return apiData<WorkspaceMember[]>(`workspace/${workSpaceId}/members`);
}
