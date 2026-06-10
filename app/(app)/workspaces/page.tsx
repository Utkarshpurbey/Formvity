"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { AppPageContainer } from "@/src/components/layout/AppPageContainer";
import { AppLink } from "@/src/components/ui/AppLink";
import { PageLoader, SkeletonRows, Spinner } from "@/src/components/ui/index";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import {
  createWorkspace,
  fetchWorkspaces,
  setActiveWorkspace,
} from "@/src/store/slices/workspaceSlice";
import { normalizeWorkspaceSummary } from "@/src/lib/apiNormalize";
import type { WorkspaceSummary } from "@/src/api/types";

function WorkspaceCard({ workspace, formCount }: { workspace: WorkspaceSummary; formCount: number }) {
  return (
    <AppLink
      href={`/workspaces/${workspace.workSpaceId}`}
      className="group flex w-full flex-col rounded-2xl border border-slate-200/80 bg-white p-6 text-left shadow-sm ring-1 ring-slate-900/[0.03] transition hover:border-violet-200 hover:shadow-md hover:shadow-violet-500/5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/10 to-indigo-500/10 text-violet-700">
          <svg className="size-5" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
          </svg>
        </div>
        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
          {formCount} {formCount === 1 ? "form" : "forms"}
        </span>
      </div>
      <h3 className="mt-4 text-lg font-semibold text-slate-900 group-hover:text-violet-700">
        {workspace.workSpaceName}
      </h3>
      <p className="mt-1 text-xs text-slate-500">Open workspace →</p>
    </AppLink>
  );
}

export default function WorkspacesPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, ready } = useAppSelector((s) => s.auth);
  const { list: workspaces, loading, creating } = useAppSelector((s) => s.workspace);
  const formsByWorkspace = useAppSelector((s) => s.forms.byWorkspace);
  const [newName, setNewName] = useState("");

  useEffect(() => {
    if (!ready) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    dispatch(fetchWorkspaces());
  }, [ready, user, router, dispatch]);

  const handleCreate = useCallback(() => {
    const name = newName.trim();
    if (!name) return;
    dispatch(createWorkspace(name))
      .unwrap()
      .then((raw) => {
        setNewName("");
        toast.success("Workspace created.");
        const ws = normalizeWorkspaceSummary(raw);
        if (ws.workSpaceId) router.push(`/workspaces/${ws.workSpaceId}`);
      })
      .catch((e: Error) => toast.error(e.message));
  }, [dispatch, newName, router]);

  if (!ready) return <PageLoader message="Loading workspaces…" className="min-h-[50vh]" />;

  return (
    <AppPageContainer>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-600">Workspaces</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Your teams & projects</h1>
          <p className="mt-2 max-w-xl text-sm text-slate-600">
            Organize forms by workspace. Each workspace has its own forms, publish settings, and team access.
          </p>
        </div>
      </div>

      <section className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white/60 p-5">
        <h2 className="text-sm font-semibold text-slate-900">Create workspace</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="e.g. Marketing, HR, Product"
            className="h-10 min-w-[200px] flex-1 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-200"
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

      {loading ? (
        <SkeletonRows count={3} className="mt-8" rowClassName="h-36" />
      ) : workspaces.length === 0 ? (
        <div className="mt-12 rounded-2xl border border-slate-200 bg-white py-16 text-center">
          <p className="font-semibold text-slate-900">No workspaces yet</p>
          <p className="mt-1 text-sm text-slate-500">Create one above to get started.</p>
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {workspaces.map((w) => (
            <WorkspaceCard
              key={w.workSpaceId}
              workspace={w}
              formCount={w.formCount ?? (formsByWorkspace[w.workSpaceId] ?? []).length}
            />
          ))}
        </div>
      )}
    </AppPageContainer>
  );
}
