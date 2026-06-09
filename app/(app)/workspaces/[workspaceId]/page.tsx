"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useWorkspaceId } from "@/src/hooks/useRouteIds";
import { isDeepLinkRestorePending } from "@/src/utils/routeParams";
import { toast } from "react-toastify";
import { AppPageContainer } from "@/src/components/layout/AppPageContainer";
import { FormLifecycleBadge } from "@/src/components/ui/FormLifecycleBadge";
import { PageLoader, SkeletonRows, Spinner, StatCard } from "@/src/components/ui/index";
import { deriveFormLifecycle } from "@/src/lib/publish";
import { EMPTY_FORM_DEF } from "@/src/lib/normalizeFormDef";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import {
  createForm,
  fetchForms,
  selectActiveFormsForWorkspace,
  selectFormsInitialLoading,
  selectFormsRefreshing,
} from "@/src/store/slices/formsSlice";
import {
  fetchWorkspaceDashboard,
  fetchWorkspaces,
  selectDashboardForWorkspace,
  setActiveWorkspace,
} from "@/src/store/slices/workspaceSlice";
import { PermissionGate, WorkspaceSubNav, useWorkspaceRole, workspaceCan } from "@/src/components/workspace/index";
import type { FormSummary } from "@/src/api/types";
import { useFormResponseCount } from "@/src/hooks/useFormAnalytics";

function FormTableRow({ form, workspaceId }: { form: FormSummary; workspaceId: string }) {
  const publication = useAppSelector((s) => s.forms.publicationByForm[form.id]);
  const lifecycle = deriveFormLifecycle({ formStatus: form.status, publication });
  const responseCount = useFormResponseCount(workspaceId, form.id, lifecycle.isLive);

  return (
    <tr className="group border-b border-slate-100 last:border-0 hover:bg-slate-50/80">
      <td className="px-6 py-4">
        <Link
          href={`/workspaces/${workspaceId}/forms/${form.id}`}
          className="font-semibold text-slate-900 hover:text-violet-700"
        >
          {form.title.trim() || "Untitled form"}
        </Link>
        <p className="mt-0.5 text-xs text-slate-500">
          Updated {new Date(form.updatedAt).toLocaleString()}
          {responseCount != null ? ` · ${responseCount} response${responseCount === 1 ? "" : "s"}` : null}
        </p>
      </td>
      <td className="px-6 py-4">
        <FormLifecycleBadge lifecycle={lifecycle} />
      </td>
      <td className="px-6 py-4 text-right">
        <div className="flex items-center justify-end gap-2 opacity-100 transition sm:opacity-70 sm:group-hover:opacity-100">
          <Link
            href={`/builder/v2?workspaceId=${workspaceId}&formId=${form.id}`}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            Edit
          </Link>
          <Link
            href={`/workspaces/${workspaceId}/forms/${form.id}`}
            className="rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-violet-700"
          >
            Manage
          </Link>
          <Link
            href={`/workspaces/${workspaceId}/forms/${form.id}/analytics`}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            Analytics
          </Link>
        </div>
      </td>
    </tr>
  );
}

export default function WorkspaceDetailPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const workspaceId = useWorkspaceId();
  const { user, ready } = useAppSelector((s) => s.auth);
  const workspaces = useAppSelector((s) => s.workspace.list);
  const dashboard = useAppSelector((s) => selectDashboardForWorkspace(s, workspaceId));
  const forms = useAppSelector((s) => selectActiveFormsForWorkspace(s, workspaceId));
  const initialLoading = useAppSelector((s) => selectFormsInitialLoading(s, workspaceId));
  const refreshing = useAppSelector((s) => selectFormsRefreshing(s, workspaceId));
  const [creatingForm, setCreatingForm] = useState(false);
  const role = useWorkspaceRole(workspaceId);
  const can = (p: Parameters<typeof workspaceCan>[1]) => workspaceCan(role, p);

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
    dispatch(fetchWorkspaceDashboard(workspaceId))
      .unwrap()
      .catch(() => {
        dispatch(fetchForms(workspaceId));
      });
  }, [workspaceId, dispatch]);

  const publishedCount = forms.filter((f) => f.status === "PUBLISHED").length;
  const draftCount = forms.filter((f) => f.status === "DRAFT").length;
  const unpublishedCount = forms.filter((f) => f.status === "UNPUBLISHED").length;

  const handleNewForm = useCallback(async () => {
    if (!workspaceId || creatingForm || !can("form.create")) return;
    setCreatingForm(true);
    try {
      const form = await dispatch(
        createForm({ workspaceId, title: "Untitled form", draftPageDef: EMPTY_FORM_DEF }),
      ).unwrap();
      router.push(`/builder/v2?workspaceId=${workspaceId}&formId=${form.id}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not create form");
    } finally {
      setCreatingForm(false);
    }
  }, [workspaceId, creatingForm, can, dispatch, router]);

  const workspaceName = workspace?.workSpaceName ?? "Workspace";

  if (!ready || isDeepLinkRestorePending()) return <PageLoader message="Loading workspace…" className="min-h-[50vh]" />;

  if (!workspaceId) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-slate-600">
        Invalid workspace.
      </div>
    );
  }

  return (
    <AppPageContainer>
      <nav className="text-sm text-slate-500">
        <Link href="/workspaces" className="hover:text-violet-600">
          Workspaces
        </Link>
        <span className="mx-2">/</span>
        <span className="font-medium text-slate-800">{workspaceName}</span>
      </nav>

      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">{workspaceName}</h1>
          <p className="mt-2 text-sm text-slate-600">
            Manage forms, publishing, and sharing for this workspace.
            {refreshing ? (
              <span className="ml-2 inline-flex items-center gap-1 text-xs text-violet-600">
                <Spinner size="sm" />
                Syncing…
              </span>
            ) : null}
          </p>
        </div>
        <PermissionGate workspaceId={workspaceId} permission="form.create">
          <button
            type="button"
            onClick={handleNewForm}
            disabled={creatingForm}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-violet-600 px-4 text-sm font-semibold text-white shadow-md shadow-violet-600/20 hover:bg-violet-700 disabled:opacity-60"
          >
            {creatingForm ? <Spinner size="sm" className="border-white/30 border-t-white" /> : null}
            {creatingForm ? "Creating…" : "+ New form"}
          </button>
        </PermissionGate>
      </div>

      <WorkspaceSubNav workspaceId={workspaceId} workspaceName={workspaceName} />

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total forms" value={initialLoading ? "—" : forms.length} />
        <StatCard label="Live" value={initialLoading ? "—" : publishedCount} hint="Accepting responses" />
        <StatCard label="Never published" value={initialLoading ? "—" : draftCount} hint="Draft only" />
        <StatCard label="Unpublished" value={initialLoading ? "—" : unpublishedCount} hint="Taken offline" />
      </div>

      <section className="mt-8 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm ring-1 ring-slate-900/[0.03]">
        <div className="border-b border-slate-100 px-6 py-4">
          <h2 className="text-sm font-semibold text-slate-900">All forms</h2>
        </div>
        {initialLoading ? (
          <SkeletonRows count={4} className="p-6" rowClassName="h-14" />
        ) : forms.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="font-semibold text-slate-900">No forms in this workspace</p>
            <p className="mt-1 text-sm text-slate-500">Create your first form to start building.</p>
            <button
              type="button"
              onClick={handleNewForm}
              disabled={creatingForm || !can("form.create")}
              className="mt-6 rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-60"
            >
              Create form
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-6 py-3">Form</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {forms.map((f) => (
                  <FormTableRow key={f.id} form={f} workspaceId={workspaceId} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </AppPageContainer>
  );
}
