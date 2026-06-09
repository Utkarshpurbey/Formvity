"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import type { WorkspaceMember, WorkspaceRole } from "../../api/types";
import { RBAC_ENFORCED, hasPermission, roleLabel, type Permission } from "../../lib/permissions";
import { useAppSelector } from "../../store/hooks";
import { selectMembersForWorkspace } from "../../store/slices/workspaceSlice";
import { stripAppBasePath } from "../../utils/appBasePath";
import { RouterNavButton } from "../ui/RouterNavButton";
import { SkeletonRows } from "../ui/index";

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
            <RouterNavButton
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
            </RouterNavButton>
          );
        })}
      </nav>
      {workspaceName ? <p className="sr-only">Workspace: {workspaceName}</p> : null}
    </div>
  );
}

type MembersPanelProps = {
  members: WorkspaceMember[];
  loading: boolean;
  currentUserId?: string;
};

export function MembersPanel({ members, loading, currentUserId }: MembersPanelProps) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm ring-1 ring-slate-900/[0.03]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-6 py-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Team members</h2>
          <p className="mt-0.5 text-xs text-slate-500">
            {RBAC_ENFORCED
              ? "Roles control what each member can do in this workspace."
              : "Roles are shown for visibility — full access control is coming soon."}
          </p>
        </div>
        <button
          type="button"
          disabled
          title="Member invites will be available when the backend adds POST /workspaces/{id}/members"
          className="cursor-not-allowed rounded-lg border border-dashed border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-400"
        >
          Invite member (soon)
        </button>
      </div>

      {loading ? (
        <SkeletonRows count={3} className="p-6" rowClassName="h-12" />
      ) : members.length === 0 ? (
        <div className="px-6 py-10 text-center text-sm text-slate-500">No members loaded.</div>
      ) : (
        <ul className="divide-y divide-slate-100">
          {members.map((member) => (
            <li key={member.userId} className="flex items-center justify-between gap-4 px-6 py-4">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-900">
                  {member.displayName ?? member.email ?? "Member"}
                  {member.userId === currentUserId ? (
                    <span className="ml-2 text-xs font-normal text-slate-500">(you)</span>
                  ) : null}
                </p>
                {member.email ? (
                  <p className="truncate text-xs text-slate-500">{member.email}</p>
                ) : (
                  <p className="truncate font-mono text-xs text-slate-400">{member.userId}</p>
                )}
              </div>
              <RoleBadge role={member.role} />
            </li>
          ))}
        </ul>
      )}
    </section>
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
