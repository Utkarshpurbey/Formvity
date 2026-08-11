"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { notifyError, notifySuccess } from "@/src/components/ui/AppToast";
import { ConfirmDialog } from "@/src/components/ui/ConfirmDialog";
import { PermissionGate, workspaceCan } from "../index";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { removeWorkspace } from "../../../store/slices/workspaceSlice";
import type { WorkspaceRole } from "../../../api/types";

type WorkspaceDangerSettingsProps = {
  workspaceId: string;
  workspaceName: string;
  role: WorkspaceRole | null;
};

export function WorkspaceDangerSettings({ workspaceId, workspaceName, role }: WorkspaceDangerSettingsProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const deleting = useAppSelector((s) => Boolean(s.workspace.deletingWorkspaceIds[workspaceId]));
  const [deleteOpen, setDeleteOpen] = useState(false);
  const canDelete = workspaceCan(role, "workspace.delete");

  const handleDelete = useCallback(async () => {
    try {
      await dispatch(removeWorkspace(workspaceId)).unwrap();
      notifySuccess("Workspace deactivated.");
      router.push("/workspaces");
    } catch (e) {
      notifyError(e instanceof Error ? e.message : "Unable to deactivate workspace.");
    }
  }, [dispatch, workspaceId, router]);

  return (
    <PermissionGate
      workspaceId={workspaceId}
      permission="workspace.delete"
      fallback={
        <section className="rounded-xl border border-slate-200/80 bg-slate-50 p-4 text-xs text-slate-500">
          Only workspace administrators can deactivate this workspace.
        </section>
      }
    >
      <section className="rounded-xl border border-rose-100 bg-rose-50/40 p-4">
        <h2 className="text-sm font-semibold text-rose-800">Danger zone</h2>
        <p className="mt-1 text-xs leading-relaxed text-slate-600">
          Deactivating removes this workspace from your dashboard. Published forms may stay online until you take
          them offline.
        </p>
        {canDelete ? (
          <button
            type="button"
            onClick={() => setDeleteOpen(true)}
            disabled={deleting}
            className="mt-3 rounded-md border border-rose-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-60"
          >
            Deactivate workspace
          </button>
        ) : null}
      </section>

      <ConfirmDialog
        open={deleteOpen}
        title="Deactivate workspace?"
        description={
          <>
            <span className="font-medium text-slate-800">{workspaceName}</span> will be deactivated and removed from
            your dashboard.
          </>
        }
        confirmLabel="Deactivate workspace"
        confirmingLabel="Deactivating…"
        confirming={deleting}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
      />
    </PermissionGate>
  );
}
