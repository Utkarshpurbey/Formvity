"use client";

import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { EMPTY_FORM_DEF } from "@/src/lib/normalizeFormDef";
import { StatCard } from "@/src/components/ui/StatCard";
import { SkeletonRows } from "@/src/components/ui/Skeleton";
import { Spinner } from "@/src/components/ui/Spinner";
import { FormRowActions } from "@/src/components/workspace/FormRowActions";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import {
  createForm,
  fetchForms,
  selectFormsForWorkspace,
  selectFormsInitialLoading,
  selectFormsRefreshing,
} from "@/src/store/slices/formsSlice";
import {
  createWorkspace,
  fetchMembers,
  fetchWorkspaces,
  selectMembersForWorkspace,
  selectMembersLoading,
  setActiveWorkspace,
} from "@/src/store/slices/workspaceSlice";
import type { FormSummary, WorkspaceSummary } from "@/src/api/types";

const WorkspaceListPanel = memo(function WorkspaceListPanel({
  workspaces,
  activeId,
  loading,
  creating,
  newWsName,
  onNewWsNameChange,
  onSelect,
  onCreate,
}: {
  workspaces: WorkspaceSummary[];
  activeId: string | null;
  loading: boolean;
  creating: boolean;
  newWsName: string;
  onNewWsNameChange: (value: string) => void;
  onSelect: (id: string) => void;
  onCreate: () => void;
}) {
  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm ring-1 ring-slate-900/[0.03]">
      <h2 className="text-sm font-semibold text-slate-900">Workspaces</h2>
      {loading ? (
        <SkeletonRows count={2} className="mt-4" rowClassName="h-11" />
      ) : (
        <ul className="mt-4 space-y-1.5">
          {workspaces.map((w) => (
            <li key={w.workSpaceId}>
              <button
                type="button"
                onClick={() => onSelect(w.workSpaceId)}
                className={`w-full rounded-xl border px-3 py-2.5 text-left text-sm transition-colors duration-150 ${
                  activeId === w.workSpaceId
                    ? "border-indigo-200 bg-indigo-50 font-semibold text-indigo-800 shadow-sm"
                    : "border-transparent text-slate-700 hover:border-slate-200 hover:bg-slate-50"
                }`}
              >
                {w.workSpaceName}
              </button>
            </li>
          ))}
        </ul>
      )}
      {!workspaces.length && !loading ? (
        <p className="mt-4 text-sm text-slate-500">Create your first workspace below.</p>
      ) : null}
      <div className="mt-4 flex gap-2">
        <input
          value={newWsName}
          onChange={(e) => onNewWsNameChange(e.target.value)}
          placeholder="Workspace name"
          className="h-10 min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50/50 px-3 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-200"
        />
        <button
          type="button"
          onClick={onCreate}
          disabled={creating || !newWsName.trim()}
          className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {creating ? (
            <>
              <Spinner size="sm" className="border-white/30 border-t-white" />
              Adding…
            </>
          ) : (
            "Add"
          )}
        </button>
      </div>
    </section>
  );
});

const WorkspaceFormsPanel = memo(function WorkspaceFormsPanel({
  activeId,
  activeName,
  forms,
  initialLoading,
  refreshing,
  creatingForm,
  onNewForm,
}: {
  activeId: string | null;
  activeName: string | undefined;
  forms: FormSummary[];
  initialLoading: boolean;
  refreshing: boolean;
  creatingForm: boolean;
  onNewForm: () => void;
}) {
  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white shadow-sm ring-1 ring-slate-900/[0.03]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-6 py-5">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Forms</h2>
          <p className="text-sm text-slate-500">
            {activeName ?? "Select a workspace"}
            {refreshing ? (
              <span className="ml-2 inline-flex items-center gap-1 text-xs text-indigo-600">
                <Spinner size="sm" />
                Updating…
              </span>
            ) : null}
          </p>
        </div>
        <button
          type="button"
          disabled={!activeId || creatingForm}
          onClick={onNewForm}
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white shadow-md shadow-indigo-600/20 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300"
        >
          {creatingForm ? (
            <>
              <Spinner size="sm" className="border-white/30 border-t-white" />
              Creating…
            </>
          ) : (
            <>
              <span className="text-lg leading-none">+</span>
              New form
            </>
          )}
        </button>
      </div>

      {!activeId ? (
        <p className="px-6 py-10 text-center text-sm text-slate-500">Select or create a workspace to see forms.</p>
      ) : initialLoading ? (
        <SkeletonRows count={3} className="px-6 py-6" rowClassName="h-16" />
      ) : forms.length === 0 ? (
        <div className="px-6 py-14 text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
            <svg className="size-7" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2Z" />
            </svg>
          </div>
          <p className="mt-4 font-semibold text-slate-900">No forms yet</p>
          <p className="mt-1 text-sm text-slate-500">Create your first form to start building.</p>
        </div>
      ) : (
        <ul className={`divide-y divide-slate-100 ${refreshing ? "opacity-70 transition-opacity duration-150" : ""}`}>
          {forms.map((f) => (
            <li
              key={f.id}
              className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 transition-colors hover:bg-slate-50/80"
            >
              <div className="min-w-0">
                <p className="font-semibold text-slate-900">{f.title}</p>
                <p className="text-xs text-slate-500">Updated {new Date(f.updatedAt).toLocaleString()}</p>
              </div>
              {activeId ? <FormRowActions form={f} workspaceId={activeId} /> : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
});

export default function WorkspacePage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, ready } = useAppSelector((s) => s.auth);
  const { list: workspaces, activeId, loading: wsLoading, creating: wsCreating } = useAppSelector((s) => s.workspace);
  const forms = useAppSelector((s) => selectFormsForWorkspace(s, activeId));
  const formsInitialLoading = useAppSelector((s) => selectFormsInitialLoading(s, activeId));
  const formsRefreshing = useAppSelector((s) => selectFormsRefreshing(s, activeId));
  const members = useAppSelector((s) => selectMembersForWorkspace(s, activeId));
  const membersLoading = useAppSelector((s) => selectMembersLoading(s, activeId));
  const [newWsName, setNewWsName] = useState("");
  const [creatingForm, setCreatingForm] = useState(false);

  useEffect(() => {
    if (!ready) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    dispatch(fetchWorkspaces());
  }, [ready, user, router, dispatch]);

  useEffect(() => {
    if (!activeId) return;
    dispatch(fetchForms(activeId));
    dispatch(fetchMembers(activeId));
  }, [activeId, dispatch]);

  const handleSelectWorkspace = useCallback((id: string) => {
    dispatch(setActiveWorkspace(id));
  }, [dispatch]);

  const handleCreateWorkspace = useCallback(() => {
    const name = newWsName.trim();
    if (!name) return;
    dispatch(createWorkspace(name))
      .unwrap()
      .then(() => {
        setNewWsName("");
        toast.success("Workspace created.");
      })
      .catch((e: Error) => toast.error(e.message));
  }, [dispatch, newWsName]);

  const handleNewForm = useCallback(async () => {
    if (!activeId || creatingForm) return;
    setCreatingForm(true);
    try {
      const form = await dispatch(
        createForm({ workspaceId: activeId, title: "Untitled form", draftPageDef: EMPTY_FORM_DEF }),
      ).unwrap();
      router.push(`/builder?workspaceId=${activeId}&formId=${form.id}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not create form");
    } finally {
      setCreatingForm(false);
    }
  }, [activeId, creatingForm, dispatch, router]);

  const activeName = useMemo(
    () => workspaces.find((w) => w.workSpaceId === activeId)?.workSpaceName,
    [workspaces, activeId],
  );
  const publishedCount = useMemo(() => forms.filter((f) => f.status === "PUBLISHED").length, [forms]);
  const draftCount = useMemo(() => forms.filter((f) => f.status === "DRAFT").length, [forms]);
  const statsLoading = formsInitialLoading && !forms.length;

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="border-b border-slate-200/80 bg-white/70 px-4 py-8 backdrop-blur-sm sm:px-8">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600">Dashboard</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            {user?.displayName ? `Welcome back, ${user.displayName.split(" ")[0]}` : "Your workspace"}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600 sm:text-base">
            Build forms in the editor, then publish to get a shareable link.
          </p>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 sm:px-8">
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Workspaces" value={wsLoading ? "—" : workspaces.length} />
          <StatCard label="Draft forms" value={statsLoading ? "—" : draftCount} hint={activeName ? `In ${activeName}` : undefined} />
          <StatCard label="Published" value={statsLoading ? "—" : publishedCount} hint="Live forms" />
        </div>

        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <WorkspaceListPanel
            workspaces={workspaces}
            activeId={activeId}
            loading={wsLoading}
            creating={wsCreating}
            newWsName={newWsName}
            onNewWsNameChange={setNewWsName}
            onSelect={handleSelectWorkspace}
            onCreate={handleCreateWorkspace}
          />
          <WorkspaceFormsPanel
            activeId={activeId}
            activeName={activeName}
            forms={forms}
            initialLoading={formsInitialLoading}
            refreshing={formsRefreshing}
            creatingForm={creatingForm}
            onNewForm={handleNewForm}
          />
        </div>

        {activeId && (membersLoading || members.length > 0) ? (
          <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm ring-1 ring-slate-900/[0.03]">
            <h2 className="text-sm font-semibold text-slate-900">Team members</h2>
            {membersLoading ? (
              <SkeletonRows count={2} className="mt-4" rowClassName="h-10 w-48" />
            ) : (
              <ul className="mt-4 flex flex-wrap gap-2">
                {members.map((m) => (
                  <li key={m.userId} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
                    <span className="font-semibold text-slate-800">{m.role}</span>
                    <span className="ml-2 text-slate-500">{m.userId.slice(0, 8)}…</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ) : null}
      </div>
    </div>
  );
}
