"use client";

import { useCallback, useState } from "react";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import type { WorkspaceMember, WorkspaceRole } from "../../api/types";
import { RBAC_ENFORCED, hasPermission, roleLabel, type Permission } from "../../lib/permissions";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  fetchMembers,
  inviteWorkspaceMember,
  selectMembersForWorkspace,
  updateWorkspaceMemberRole,
} from "../../store/slices/workspaceSlice";
import { stripAppBasePath } from "../../utils/appBasePath";
import { notifyError, notifySuccess } from "../ui/AppToast";
import { AppLink } from "../ui/AppLink";
import { SkeletonRows, Spinner } from "../ui/index";
import { InviteMemberDialog, MEMBER_INVITE_ROLES } from "./InviteMemberDialog";

const ROLE_STYLES: Record<WorkspaceRole, string> = {
  ADMIN: "bg-violet-100 text-violet-800 ring-violet-200",
  EDITOR: "bg-sky-100 text-sky-800 ring-sky-200",
  VIEWER: "bg-slate-100 text-slate-700 ring-slate-200",
  ATTENDEE: "bg-amber-100 text-amber-800 ring-amber-200",
};

export function RoleBadge({ role, className = "" }: { role: WorkspaceRole; className?: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${ROLE_STYLES[role]} ${className}`}
    >
      {roleLabel(role)}
    </span>
  );
}

type WorkspaceSubNavProps = {
  workspaceId: string;
  workspaceName?: string;
};

const tabs = (workspaceId: string) => [
  { href: `/workspaces/${workspaceId}`, label: "Forms", exact: true },
  { href: `/workspaces/${workspaceId}/settings`, label: "Settings", exact: false },
];

export function WorkspaceSubNav({ workspaceId, workspaceName }: WorkspaceSubNavProps) {
  const pathname = stripAppBasePath(usePathname() ?? "/");

  return (
    <div className="mt-6 border-b border-slate-200">
      <nav className="-mb-px flex gap-6" aria-label="Workspace sections">
        {tabs(workspaceId).map((tab) => {
          const active = tab.exact ? pathname === tab.href : pathname.startsWith(tab.href);
          return (
            <AppLink
              key={tab.href}
              href={tab.href}
              className={`border-b-2 pb-3 text-sm font-semibold transition ${
                active
                  ? "border-violet-600 text-violet-700"
                  : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-800"
              }`}
              aria-current={active ? "page" : undefined}
            >
              {tab.label}
            </AppLink>
          );
        })}
      </nav>
      {workspaceName ? <p className="sr-only">Workspace: {workspaceName}</p> : null}
    </div>
  );
}

type MembersPanelProps = {
  workspaceId: string;
  members: WorkspaceMember[];
  loading: boolean;
  currentUserId?: string;
  canManageMembers?: boolean;
};

export function MembersPanel({
  workspaceId,
  members,
  loading,
  currentUserId,
  canManageMembers = true,
}: MembersPanelProps) {
  const dispatch = useAppDispatch();
  const inviting = useAppSelector((s) => Boolean(s.workspace.invitingByWorkspace[workspaceId]));
  const updatingRoleIds = useAppSelector((s) => s.workspace.updatingMemberRoleIds);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [pendingInviteUrl, setPendingInviteUrl] = useState<string | null>(null);
  const [lastInviteEmail, setLastInviteEmail] = useState<string | null>(null);

  const closeInviteDialog = useCallback(() => {
    setInviteOpen(false);
    setPendingInviteUrl(null);
    setLastInviteEmail(null);
  }, []);

  const handleInvite = useCallback(
    async (email: string, role: WorkspaceRole) => {
      try {
        const { result } = await dispatch(inviteWorkspaceMember({ workspaceId, email, role })).unwrap();
        if (result.isNewUser && result.inviteUrl) {
          setPendingInviteUrl(result.inviteUrl);
          setLastInviteEmail(result.emailId);
          notifySuccess("Invitation sent — share the activate link.");
        } else {
          notifySuccess(`${result.emailId} was added to the workspace.`);
          closeInviteDialog();
          dispatch(fetchMembers(workspaceId));
        }
      } catch (e) {
        notifyError(e instanceof Error ? e.message : "Could not send invite");
      }
    },
    [dispatch, workspaceId, closeInviteDialog],
  );

  const handleRoleChange = useCallback(
    async (userId: string, role: WorkspaceRole) => {
      try {
        await dispatch(updateWorkspaceMemberRole({ workspaceId, userId, role })).unwrap();
        notifySuccess("Member role updated.");
      } catch (e) {
        notifyError(e instanceof Error ? e.message : "Could not update role");
        dispatch(fetchMembers(workspaceId));
      }
    },
    [dispatch, workspaceId],
  );

  return (
    <>
      <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm ring-1 ring-slate-900/[0.03]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-6 py-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Team members</h2>
            <p className="mt-0.5 text-xs text-slate-500">
              {RBAC_ENFORCED
                ? "Only admins can invite members and change roles."
                : "Invite teammates by email. Roles control access when enforcement is enabled."}
            </p>
          </div>
          {canManageMembers ? (
            <button
              type="button"
              onClick={() => setInviteOpen(true)}
              className="rounded-lg border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-700 transition hover:bg-violet-100"
            >
              Invite member
            </button>
          ) : null}
        </div>

        {loading ? (
          <SkeletonRows count={3} className="p-6" rowClassName="h-12" />
        ) : members.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-slate-500">No members loaded.</div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {members.map((member) => {
              const isSelf = member.userId === currentUserId;
              const roleUpdating = Boolean(updatingRoleIds[member.userId]);
              const showRoleSelect = canManageMembers && !isSelf;

              return (
                <li key={member.userId} className="flex items-center justify-between gap-4 px-6 py-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900">
                      {member.displayName ?? member.email ?? "Member"}
                      {isSelf ? <span className="ml-2 text-xs font-normal text-slate-500">(you)</span> : null}
                    </p>
                    {member.email ? (
                      <p className="truncate text-xs text-slate-500">{member.email}</p>
                    ) : (
                      <p className="truncate font-mono text-xs text-slate-400">{member.userId}</p>
                    )}
                  </div>
                  {showRoleSelect ? (
                    <div className="relative shrink-0">
                      <select
                        value={member.role}
                        disabled={roleUpdating}
                        onChange={(e) => handleRoleChange(member.userId, e.target.value as WorkspaceRole)}
                        className="rounded-lg border border-slate-200 bg-white py-1.5 pl-2.5 pr-8 text-xs font-semibold text-slate-700 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 disabled:opacity-60"
                        aria-label={`Role for ${member.displayName ?? member.email ?? "member"}`}
                      >
                        {MEMBER_INVITE_ROLES.map((r) => (
                          <option key={r} value={r}>
                            {roleLabel(r)}
                          </option>
                        ))}
                      </select>
                      {roleUpdating ? (
                        <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
                          <Spinner size="sm" />
                        </span>
                      ) : null}
                    </div>
                  ) : (
                    <RoleBadge role={member.role} />
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <InviteMemberDialog
        open={inviteOpen}
        inviting={inviting}
        onClose={closeInviteDialog}
        onSubmit={handleInvite}
        inviteUrl={pendingInviteUrl}
        lastInviteEmail={lastInviteEmail}
      />
    </>
  );
}

type PermissionGateProps = {
  workspaceId: string;
  permission: Permission;
  children: ReactNode;
  fallback?: ReactNode;
};

/** Hides children when RBAC is enforced and the user lacks permission. */
export function PermissionGate({ workspaceId, permission, children, fallback = null }: PermissionGateProps) {
  const userId = useAppSelector((s) => s.auth.user?.id);
  const members = useAppSelector((s) => selectMembersForWorkspace(s, workspaceId));
  const role = members.find((m) => m.userId === userId)?.role ?? null;
  if (!hasPermission(role, permission)) return <>{fallback}</>;
  return <>{children}</>;
}

/** Resolve workspace role for the signed-in user. */
export function useWorkspaceRole(workspaceId: string): WorkspaceRole | null {
  const userId = useAppSelector((s) => s.auth.user?.id);
  const members = useAppSelector((s) => selectMembersForWorkspace(s, workspaceId));
  return members.find((m) => m.userId === userId)?.role ?? null;
}

export function workspaceCan(role: WorkspaceRole | null, permission: Permission): boolean {
  return hasPermission(role, permission);
}
