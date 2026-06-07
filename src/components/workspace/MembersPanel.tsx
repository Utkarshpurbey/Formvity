"use client";

import { SkeletonRows } from "../ui/Skeleton";
import { RoleBadge } from "./RoleBadge";
import type { WorkspaceMember } from "../../api/types";
import { RBAC_ENFORCED } from "../../lib/permissions";

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
