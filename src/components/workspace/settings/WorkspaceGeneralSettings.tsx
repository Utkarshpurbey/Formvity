"use client";

import { useCallback } from "react";
import { notifyError, notifySuccess } from "@/src/components/ui/AppToast";
import { WorkspaceNameEditor } from "../WorkspaceNameEditor";
import { RoleBadge } from "../index";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { renameWorkspace } from "../../../store/slices/workspaceSlice";
import type { WorkspaceRole } from "../../../api/types";

type WorkspaceGeneralSettingsProps = {
  workspaceId: string;
  workspaceName: string;
  formCount: number | string;
  role: WorkspaceRole | null;
  canEdit: boolean;
};

export function WorkspaceGeneralSettings({
  workspaceId,
  workspaceName,
  formCount,
  role,
  canEdit,
}: WorkspaceGeneralSettingsProps) {
  const dispatch = useAppDispatch();
  const renaming = useAppSelector((s) => Boolean(s.workspace.renamingWorkspaceIds[workspaceId]));

  const handleRename = useCallback(
    async (nextName: string) => {
      try {
        await dispatch(renameWorkspace({ workspaceId, workspaceName: nextName })).unwrap();
        notifySuccess("Workspace name updated.");
      } catch (e) {
        notifyError(e instanceof Error ? e.message : "Unable to update workspace name.");
      }
    },
    [dispatch, workspaceId],
  );

  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm ring-1 ring-slate-900/[0.03]">
      <h2 className="text-sm font-semibold text-slate-900">General</h2>
      <p className="mt-0.5 text-xs text-slate-500">Basic information about this workspace.</p>

      <dl className="mt-5 space-y-5">
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Workspace name</dt>
          <dd className="mt-2">
            <WorkspaceNameEditor name={workspaceName} canEdit={canEdit} saving={renaming} onSave={handleRename} />
          </dd>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Workspace ID</dt>
            <dd className="mt-2 break-all font-mono text-xs text-slate-800">{workspaceId}</dd>
          </div>
          <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Forms</dt>
            <dd className="mt-1.5 text-lg font-semibold text-slate-900">{formCount}</dd>
          </div>
          <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Your role</dt>
            <dd className="mt-2">{role ? <RoleBadge role={role} /> : <span className="text-slate-500">—</span>}</dd>
          </div>
        </div>
      </dl>
    </section>
  );
}
