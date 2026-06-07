import type { WorkspaceMember, WorkspaceRole } from "../api/types";

const ROLES: WorkspaceRole[] = ["ADMIN", "EDITOR", "VIEWER", "ATTENDEE"];

function normalizeRole(raw: unknown): WorkspaceRole {
  const upper = String(raw ?? "VIEWER").toUpperCase();
  return ROLES.includes(upper as WorkspaceRole) ? (upper as WorkspaceRole) : "VIEWER";
}

export function normalizeWorkspaceMember(raw: unknown): WorkspaceMember {
  const r = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  return {
    userId: String(r.userId ?? r.id ?? ""),
    displayName: r.displayName ? String(r.displayName) : undefined,
    email: r.email ? String(r.email) : undefined,
    role: normalizeRole(r.role),
  };
}

export function normalizeMemberList(raw: unknown): WorkspaceMember[] {
  if (!Array.isArray(raw)) return [];
  return raw.map(normalizeWorkspaceMember).filter((m) => m.userId);
}
