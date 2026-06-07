import { apiData } from "./http";
import type { WorkspaceDashboard, WorkspaceMember, WorkspaceSummary } from "./types";
import { normalizeWorkspaceDashboard } from "../lib/normalizeDashboard";
import { normalizeMemberList } from "../lib/normalizeMember";
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

export async function getWorkspaceDashboard(workSpaceId: string): Promise<WorkspaceDashboard> {
  const raw = await apiData<unknown>(`workspaces/${workSpaceId}/dashboard`);
  return normalizeWorkspaceDashboard(raw);
}

export async function listMembers(workSpaceId: string): Promise<WorkspaceMember[]> {
  const raw = await apiData<unknown>(`workspaces/${workSpaceId}/members`);
  return normalizeMemberList(raw);
}
