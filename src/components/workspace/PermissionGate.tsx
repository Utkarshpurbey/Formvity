import type { ReactNode } from "react";
import type { Permission } from "../../lib/permissions";
import { useWorkspacePermissions } from "../../hooks/useWorkspacePermissions";

type PermissionGateProps = {
  workspaceId: string;
  permission: Permission;
  children: ReactNode;
  fallback?: ReactNode;
};

/** Hides children when RBAC is enforced and the user lacks permission. */
export function PermissionGate({ workspaceId, permission, children, fallback = null }: PermissionGateProps) {
  const { can } = useWorkspacePermissions(workspaceId);
  if (!can(permission)) return <>{fallback}</>;
  return <>{children}</>;
}
