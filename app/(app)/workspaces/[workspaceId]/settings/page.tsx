"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AppPageContainer } from "@/src/components/layout/AppPageContainer";
import { WorkspaceTagManager } from "@/src/components/tags/WorkspaceTagManager";
import { PageLoader } from "@/src/components/ui/index";
import { MembersPanel, RoleBadge, useWorkspacePage, workspaceCan } from "@/src/components/workspace/index";
import {
  WorkspaceDangerSettings,
  WorkspaceGeneralSettings,
  parseSettingsSection,
} from "@/src/components/workspace/settings";
import { selectMembersLoading } from "@/src/store/slices/workspaceSlice";
import { useAppSelector } from "@/src/store/hooks";

const SECTION_TITLES = {
  general: { title: "General", description: "Basic information about this workspace." },
  members: { title: "Members", description: "Invite teammates and manage roles." },
  tags: { title: "Tags", description: "Create labels for organizing submissions." },
  danger: { title: "Danger zone", description: "Irreversible workspace actions." },
} as const;

function WorkspaceSettingsContent() {
  const searchParams = useSearchParams();
  const section = parseSettingsSection(searchParams.get("section"));
  const { workspaceId, workspaceName, dashboard, workspace, members, user, role, ready } = useWorkspacePage();
  const membersLoading = useAppSelector((s) => selectMembersLoading(s, workspaceId));
  const canManage = workspaceCan(role, "workspace.manage_members");
  const meta = SECTION_TITLES[section];

  if (!ready) return <PageLoader message="Loading settings…" className="min-h-[50vh]" />;

  if (!workspaceId) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-slate-600">
        Invalid workspace.
      </div>
    );
  }

  const formCount = dashboard?.formCount ?? workspace?.formCount ?? "—";

  return (
    <AppPageContainer>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-violet-600">
            Settings · {meta.title}
          </p>
          <h1 className="mt-1.5 text-lg font-semibold tracking-tight text-slate-900">{workspaceName}</h1>
          <p className="mt-1 text-xs text-slate-500">{meta.description}</p>
        </div>
        {role ? <RoleBadge role={role} /> : null}
      </div>

      <div className="mt-8">
        {section === "general" ? (
          <WorkspaceGeneralSettings
            workspaceId={workspaceId}
            workspaceName={workspaceName}
            formCount={formCount}
            role={role}
            canEdit={canManage}
          />
        ) : null}

        {section === "members" ? (
          <MembersPanel
            workspaceId={workspaceId}
            members={members}
            loading={membersLoading}
            currentUserId={user?.id}
            canManageMembers={canManage}
          />
        ) : null}

        {section === "tags" ? (
          <WorkspaceTagManager workspaceId={workspaceId} canManage={canManage} />
        ) : null}

        {section === "danger" ? (
          <WorkspaceDangerSettings workspaceId={workspaceId} workspaceName={workspaceName} role={role} />
        ) : null}
      </div>
    </AppPageContainer>
  );
}

export default function WorkspaceSettingsPage() {
  return (
    <Suspense fallback={<PageLoader message="Loading settings…" className="min-h-[50vh]" />}>
      <WorkspaceSettingsContent />
    </Suspense>
  );
}
