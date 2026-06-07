import { useCallback, useMemo } from "react";
import type { Permission } from "../lib/permissions";
import { hasPermission } from "../lib/permissions";
import type { WorkspaceRole } from "../api/types";
import { useAppSelector } from "../store/hooks";
import { selectMembersForWorkspace } from "../store/slices/workspaceSlice";

export function useWorkspacePermissions(workspaceId: string) {
  const userId = useAppSelector((s) => s.auth.user?.id);
  const members = useAppSelector((s) => selectMembersForWorkspace(s, workspaceId));

  const role = useMemo((): WorkspaceRole | null => {
    if (!userId || members.length === 0) return null;
    const member = members.find((m) => m.userId === userId);
    return member?.role ?? null;
  }, [members, userId]);

  const can = useCallback((permission: Permission) => hasPermission(role, permission), [role]);

  return {
    role,
    can,
    membersLoaded: members.length > 0,
  };
}
