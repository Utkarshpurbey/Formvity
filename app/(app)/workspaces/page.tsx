"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { notifyError, notifySuccess } from "@/src/components/ui/AppToast";
import { AppPageContainer } from "@/src/components/layout/AppPageContainer";
import { AppLink } from "@/src/components/ui/AppLink";
import { PageLoader, SkeletonRows, Spinner } from "@/src/components/ui/index";
import { WorkspaceAvatar } from "@/src/components/workspace/WorkspaceAvatar";
import { RoleBadge, useWorkspaceRole } from "@/src/components/workspace/index";
import { readActiveWorkspaceId } from "@/src/lib/activeWorkspaceStorage";
import { normalizeWorkspaceSummary } from "@/src/lib/apiNormalize";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import {
  createWorkspace,
  refreshWorkspaces,
  setActiveWorkspace,
} from "@/src/store/slices/workspaceSlice";
import type { WorkspaceSummary } from "@/src/api/types";

function WorkspaceListItem({
  workspace,
  formCount,
  memberCount,
  isActive,
}: {
  workspace: WorkspaceSummary;
  formCount: number;
  memberCount?: number;
  isActive: boolean;
}) {
  const role = useWorkspaceRole(workspace.workSpaceId);

  return (
    <AppLink
      href={`/workspaces/${workspace.workSpaceId}`}
      className={`group flex items-center gap-3 rounded-xl border bg-white p-3.5 shadow-sm transition hover:shadow-md ${
        isActive
          ? "border-violet-300 ring-1 ring-violet-100"
          : "border-slate-200/80 ring-1 ring-slate-900/[0.03] hover:border-violet-200"
      }`}
    >
      <WorkspaceAvatar name={workspace.workSpaceName} size="md" />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <h3 className="truncate text-sm font-semibold text-slate-900 group-hover:text-violet-700">
            {workspace.workSpaceName}
          </h3>
          {isActive ? (
            <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-violet-700">
              Active
            </span>
          ) : null}
          {role ? <RoleBadge role={role} /> : null}
        </div>
        <p className="mt-0.5 text-xs text-slate-500">
          {formCount} {formCount === 1 ? "form" : "forms"}
          {memberCount != null ? ` · ${memberCount} ${memberCount === 1 ? "member" : "members"}` : ""}
        </p>
      </div>
      <svg
        className="size-5 shrink-0 text-slate-300 transition group-hover:text-violet-500"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
        aria-hidden
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
      </svg>
    </AppLink>
  );
}

export default function WorkspacesPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, ready } = useAppSelector((s) => s.auth);
  const { list: workspaces, loading, creating, activeId } = useAppSelector((s) => s.workspace);
  const formsByWorkspace = useAppSelector((s) => s.forms.byWorkspace);
  const membersByWorkspace = useAppSelector((s) => s.workspace.membersByWorkspace);
  const [newName, setNewName] = useState("");
  const [redirectChecked, setRedirectChecked] = useState(false);

  useEffect(() => {
    if (!ready) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    dispatch(refreshWorkspaces());
  }, [ready, user, router, dispatch]);

  useEffect(() => {
    if (loading || !ready || redirectChecked) return;
    if (workspaces.length === 1 && workspaces[0]) {
      router.replace(`/workspaces/${workspaces[0].workSpaceId}`);
      return;
    }
    setRedirectChecked(true);
  }, [loading, ready, workspaces, router, redirectChecked]);

  const handleCreate = useCallback(() => {
    const name = newName.trim();
    if (!name) return;
    dispatch(createWorkspace(name))
      .unwrap()
      .then((raw) => {
        setNewName("");
        notifySuccess("Workspace created.");
        const ws = normalizeWorkspaceSummary(raw);
        if (ws.workSpaceId) router.push(`/workspaces/${ws.workSpaceId}`);
      })
      .catch((e: Error) => notifyError(e.message));
  }, [dispatch, newName, router]);

  if (!ready || (loading && workspaces.length === 0)) {
    return <PageLoader message="Loading workspaces…" className="min-h-[50vh]" />;
  }

  if (workspaces.length === 1 && !redirectChecked) {
    return <PageLoader message="Opening workspace…" className="min-h-[50vh]" />;
  }

  const storedActiveId = readActiveWorkspaceId();

  return (
    <AppPageContainer>
      <div className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-600">Your spaces</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Workspaces</h1>
        <p className="mt-2 text-sm text-slate-600">
          Each workspace is a shared team space for forms, members, and settings. Switch anytime from the sidebar.
        </p>
      </div>

      {storedActiveId && workspaces.some((w) => w.workSpaceId === storedActiveId) ? (
        <div className="mt-6">
          <AppLink
            href={`/workspaces/${storedActiveId}`}
            className="inline-flex items-center gap-2 rounded-xl border border-violet-200 bg-violet-50/60 px-4 py-2.5 text-sm font-semibold text-violet-800 hover:bg-violet-100/80"
          >
            Continue to {workspaces.find((w) => w.workSpaceId === storedActiveId)?.workSpaceName ?? "workspace"}
            <svg className="size-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          </AppLink>
        </div>
      ) : null}

      <section className="mt-8 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">Create a workspace</h2>
        <p className="mt-1 text-xs text-slate-500">For a team, department, or project.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="e.g. Marketing, HR, Product"
            className="h-10 min-w-[220px] flex-1 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-200"
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          />
          <button
            type="button"
            onClick={handleCreate}
            disabled={creating || !newName.trim()}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-violet-600 px-5 text-sm font-semibold text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {creating ? <Spinner size="sm" className="border-white/30 border-t-white" /> : null}
            {creating ? "Creating…" : "New workspace"}
          </button>
        </div>
      </section>

      {workspaces.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center">
          <p className="font-semibold text-slate-900">No workspaces yet</p>
          <p className="mt-1 text-sm text-slate-500">Create your first workspace above to get started.</p>
        </div>
      ) : (
        <div className="mt-8 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {workspaces.length} workspace{workspaces.length === 1 ? "" : "s"}
          </p>
          {workspaces.map((w) => (
            <WorkspaceListItem
              key={w.workSpaceId}
              workspace={w}
              formCount={w.formCount ?? (formsByWorkspace[w.workSpaceId] ?? []).length}
              memberCount={membersByWorkspace[w.workSpaceId]?.length}
              isActive={w.workSpaceId === (activeId ?? storedActiveId)}
            />
          ))}
        </div>
      )}

      {loading ? <SkeletonRows count={2} className="mt-4" rowClassName="h-20" /> : null}
    </AppPageContainer>
  );
}
