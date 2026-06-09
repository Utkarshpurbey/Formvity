"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useWorkspaceId } from "@/src/hooks/useRouteIds";
import { toast } from "react-toastify";
import { AppPageContainer } from "@/src/components/layout/AppPageContainer";
import { ConfirmDialog } from "@/src/components/ui/ConfirmDialog";
import {
  MembersPanel,
  PermissionGate,
  RoleBadge,
  WorkspaceSubNav,
  useWorkspaceRole,
  workspaceCan,
} from "@/src/components/workspace/index";
import { PageLoader } from "@/src/components/ui/index";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import {
  fetchMembers,
  fetchWorkspaceDashboard,
  fetchWorkspaces,
  removeWorkspace,
  selectDashboardForWorkspace,
  selectMembersForWorkspace,
  selectMembersLoading,
  setActiveWorkspace,
} from "@/src/store/slices/workspaceSlice";

export default function WorkspaceSettingsPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const workspaceId = useWorkspaceId();
  const { user, ready } = useAppSelector((s) => s.auth);
  const workspaces = useAppSelector((s) => s.workspace.list);
  const dashboard = useAppSelector((s) => selectDashboardForWorkspace(s, workspaceId));
  const members = useAppSelector((s) => selectMembersForWorkspace(s, workspaceId));
  const membersLoading = useAppSelector((s) => selectMembersLoading(s, workspaceId));
  const deleting = useAppSelector((s) => Boolean(s.workspace.deletingWorkspaceIds[workspaceId]));
  const role = useWorkspaceRole(workspaceId);
  const can = (p: Parameters<typeof workspaceCan>[1]) => workspaceCan(role, p);

  const [deleteOpen, setDeleteOpen] = useState(false);

  const workspace = useMemo(() => {
    const fromList = workspaces.find((w) => w.workSpaceId === workspaceId);
    if (fromList) return fromList;
    if (dashboard) {
      return {
        workSpaceId: dashboard.workspaceId,
        workSpaceName: dashboard.workspaceName,
        formCount: dashboard.formCount,
      };
    }
    return undefined;
  }, [workspaces, workspaceId, dashboard]);

  useEffect(() => {
    if (!ready) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    dispatch(fetchWorkspaces());
  }, [ready, user, router, dispatch]);

  useEffect(() => {
    if (!workspaceId) return;
    dispatch(setActiveWorkspace(workspaceId));
    dispatch(fetchWorkspaceDashboard(workspaceId));
    dispatch(fetchMembers(workspaceId));
  }, [workspaceId, dispatch]);

  const handleDelete = useCallback(async () => {
    try {
      await dispatch(removeWorkspace(workspaceId)).unwrap();
      toast.success("Workspace deactivated.");
      router.push("/workspaces");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not deactivate workspace");
    }
  }, [dispatch, workspaceId, router]);

  if (!ready) return <PageLoader message="Loading settings…" className="min-h-[50vh]" />;

  if (!workspaceId) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-slate-600">
        Invalid workspace.
      </div>
    );
  }

  const workspaceName = workspace?.workSpaceName ?? "Workspace";

  return (
    <AppPageContainer>
      <nav className="text-sm text-slate-500">
        <Link href="/workspaces" className="hover:text-violet-600">
          Workspaces
        </Link>
        <span className="mx-2">/</span>
        <Link href={`/workspaces/${workspaceId}`} className="hover:text-violet-600">
          {workspaceName}
        </Link>
        <span className="mx-2">/</span>
        <span className="font-medium text-slate-800">Settings</span>
      </nav>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">{workspaceName}</h1>
          <p className="mt-2 text-sm text-slate-600">Workspace settings, team, and danger zone.</p>
        </div>
        {role ? <RoleBadge role={role} /> : null}
      </div>

      <WorkspaceSubNav workspaceId={workspaceId} workspaceName={workspaceName} />

      <div className="mt-8 space-y-8">
        <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">General</h2>
          <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-slate-500">Workspace ID</dt>
              <dd className="mt-1 font-mono text-xs text-slate-800">{workspaceId}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Forms</dt>
              <dd className="mt-1 font-medium text-slate-900">
                {dashboard?.formCount ?? workspace?.formCount ?? "—"}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Your role</dt>
              <dd className="mt-1">{role ? <RoleBadge role={role} /> : <span className="text-slate-500">—</span>}</dd>
            </div>
          </dl>
        </section>

        <MembersPanel members={members} loading={membersLoading} currentUserId={user?.id} />

        <PermissionGate
          workspaceId={workspaceId}
          permission="workspace.delete"
          fallback={
            <section className="rounded-2xl border border-slate-200/80 bg-slate-50 p-6 text-sm text-slate-500">
              Only workspace admins can deactivate this workspace when role enforcement is enabled.
            </section>
          }
        >
          <section className="rounded-2xl border border-rose-200/80 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-rose-800">Danger zone</h2>
            <p className="mt-2 text-sm text-slate-600">
              Deactivating removes this workspace from your list. Published forms may still be reachable until
              unpublished separately.
            </p>
            {can("workspace.delete") ? (
              <button
                type="button"
                onClick={() => setDeleteOpen(true)}
                disabled={deleting}
                className="mt-4 rounded-lg border border-rose-300 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-100 disabled:opacity-60"
              >
                Deactivate workspace
              </button>
            ) : null}
          </section>
        </PermissionGate>
      </div>

      <ConfirmDialog
        open={deleteOpen}
        title="Deactivate workspace?"
        description={
          <>
            <span className="font-medium text-slate-800">{workspaceName}</span> will be deactivated. Forms in this
            workspace will no longer appear in your dashboard. This action can be reversed by an administrator on
            the backend.
            <p className="mt-3 text-xs text-slate-500">
              Type the workspace name in your head — there is no undo button in the UI yet.
            </p>
          </>
        }
        confirmLabel="Deactivate workspace"
        confirmingLabel="Deactivating…"
        confirming={deleting}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
      />
    </AppPageContainer>
  );
}
