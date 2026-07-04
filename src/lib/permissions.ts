import type { WorkspaceRole } from "../api/types";

/**
 * Flip to true when backend enforces RBAC on all endpoints.
 * Until then, UI shows role labels but allows actions for authenticated members.
 */
export const RBAC_ENFORCED = false;

export type Permission =
  | "workspace.read"
  | "workspace.delete"
  | "workspace.manage_members"
  | "form.create"
  | "form.edit"
  | "form.delete"
  | "form.publish"
  | "form.unpublish";

const ROLE_PERMISSIONS: Record<WorkspaceRole, Permission[]> = {
  ADMIN: [
    "workspace.read",
    "workspace.delete",
    "workspace.manage_members",
    "form.create",
    "form.edit",
    "form.delete",
    "form.publish",
    "form.unpublish",
  ],
  EDITOR: [
    "workspace.read",
    "form.create",
    "form.edit",
    "form.delete",
    "form.publish",
    "form.unpublish",
  ],
  VIEWER: ["workspace.read"],
  ATTENDEE: ["workspace.read"],
};

export function hasPermission(role: WorkspaceRole | null | undefined, permission: Permission): boolean {
  if (!RBAC_ENFORCED) return true;
  if (!role) return false;
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function roleLabel(role: WorkspaceRole): string {
  switch (role) {
    case "ADMIN":
      return "Admin";
    case "EDITOR":
      return "Editor";
    case "VIEWER":
      return "Viewer";
    case "ATTENDEE":
      return "Attendee";
    default:
      return role;
  }
}

