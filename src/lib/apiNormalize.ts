import type {
  ActivateUserResponse,
  FormSummary,
  InviteMemberResponse,
  InvitePreview,
  WorkspaceDashboard,
  WorkspaceMember,
  WorkspaceRole,
  WorkspaceSummary,
} from "../api/types";

const ROLES: WorkspaceRole[] = ["ADMIN", "EDITOR", "VIEWER", "ATTENDEE"];

function normalizeRole(raw: unknown): WorkspaceRole {
  const upper = String(raw ?? "VIEWER").toUpperCase();
  return ROLES.includes(upper as WorkspaceRole) ? (upper as WorkspaceRole) : "VIEWER";
}

/** Map backend field names (workspaceId / workspaceName) to app shape. */
export function normalizeWorkspaceSummary(raw: unknown): WorkspaceSummary {
  const r = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const formCountRaw = r.formCount;
  return {
    workSpaceId: String(r.workSpaceId ?? r.workspaceId ?? r.id ?? ""),
    workSpaceName: String(r.workSpaceName ?? r.workspaceName ?? r.name ?? "Workspace"),
    formCount: typeof formCountRaw === "number" ? formCountRaw : undefined,
  };
}

export function normalizeWorkspaceList(raw: unknown): WorkspaceSummary[] {
  if (!Array.isArray(raw)) return [];
  return raw.map(normalizeWorkspaceSummary).filter((w) => w.workSpaceId);
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

export function normalizeInviteMemberResponse(raw: unknown): InviteMemberResponse {
  const r = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  return {
    workspaceId: String(r.workspaceId ?? ""),
    userId: r.userId != null ? String(r.userId) : null,
    emailId: String(r.emailId ?? r.email ?? ""),
    roles: normalizeRole(r.roles ?? r.role),
    joinedAt: r.joinedAt != null ? String(r.joinedAt) : null,
    inviteUrl: r.inviteUrl != null ? String(r.inviteUrl) : null,
    isNewUser: Boolean(r.isNewUser),
  };
}

/** @deprecated Use normalizeInviteMemberResponse */
export const normalizeInviteMemberResult = normalizeInviteMemberResponse;

export function normalizeInvitePreview(raw: unknown): InvitePreview {
  const r = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  return {
    email: String(r.email ?? r.emailId ?? ""),
    workspaceId: String(r.workspaceId ?? ""),
    workspaceName: String(r.workspaceName ?? r.workSpaceName ?? "Workspace"),
    role: normalizeRole(r.role ?? r.roles),
    expiresAt: String(r.expiresAt ?? ""),
  };
}

export function normalizeActivateUserResponse(raw: unknown): ActivateUserResponse {
  const r = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  return {
    token: String(r.token ?? ""),
    id: String(r.id ?? ""),
    displayName: String(r.displayName ?? ""),
    workspaceId: String(r.workspaceId ?? ""),
    joinedAt: String(r.joinedAt ?? ""),
  };
}

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
