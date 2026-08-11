"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { notifyError } from "@/src/components/ui/AppToast";
import { AppPageContainer } from "@/src/components/layout/AppPageContainer";
import { FormLifecycleBadge } from "@/src/components/ui/FormLifecycleBadge";
import { AppLink } from "@/src/components/ui/AppLink";
import { PageLoader, SkeletonRows, Spinner } from "@/src/components/ui/index";
import {
  PermissionGate,
  RoleBadge,
  WorkspaceAvatar,
  useWorkspacePage,
  workspaceCan,
} from "@/src/components/workspace/index";
import { settingsPath } from "@/src/components/workspace/settings";
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
import type { FormSummary } from "@/src/api/types";

function FormRow({ form, workspaceId }: { form: FormSummary; workspaceId: string }) {
  const publication = useAppSelector((s) => s.forms.publicationByForm[form.id]);
  const lifecycle = deriveFormLifecycle({ formStatus: form.status, publication });
  const formHref = `/workspaces/${workspaceId}/forms/${form.id}`;
  const builderHref = `/builder?workspaceId=${workspaceId}&formId=${form.id}`;

  return (
    <li className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-4 py-2.5 last:border-0 hover:bg-slate-50/70">
      <div className="min-w-0 flex-1">
        <AppLink
          href={formHref}
          prefetch={false}
          className="text-[13px] font-medium text-slate-900 hover:text-violet-700"
        >
          {form.title.trim() || "Untitled form"}
        </AppLink>
        <p className="mt-0.5 text-[11px] text-slate-500">Updated {new Date(form.updatedAt).toLocaleString()}</p>
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        <FormLifecycleBadge lifecycle={lifecycle} />
        <AppLink
          href={builderHref}
          prefetch={false}
          className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-50"
        >
          Edit
        </AppLink>
        <AppLink
          href={formHref}
          prefetch={false}
          className="rounded-md bg-violet-600 px-2 py-1 text-[11px] font-medium text-white hover:bg-violet-700"
        >
          Open
        </AppLink>
      </div>
    </li>
  );
}

export default function WorkspaceOverviewPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { workspaceId, workspaceName, dashboard, role, ready } = useWorkspacePage();
  const forms = useAppSelector((s) => selectActiveFormsForWorkspace(s, workspaceId));
  const initialLoading = useAppSelector((s) => selectFormsInitialLoading(s, workspaceId));
  const refreshing = useAppSelector((s) => selectFormsRefreshing(s, workspaceId));
  const members = useAppSelector((s) => s.workspace.membersByWorkspace[workspaceId] ?? []);
  const [creatingForm, setCreatingForm] = useState(false);
  const can = (p: Parameters<typeof workspaceCan>[1]) => workspaceCan(role, p);

  const publishedCount = forms.filter((f) => f.status === "PUBLISHED").length;
  const draftCount = forms.filter((f) => f.status === "DRAFT").length;
  const unpublishedCount = forms.filter((f) => f.status === "UNPUBLISHED").length;
  const recentForms = dashboard?.recentForms?.length ? dashboard.recentForms : forms.slice(0, 5);

  const handleNewForm = useCallback(async () => {
    if (!workspaceId || creatingForm || !can("form.create")) return;
    setCreatingForm(true);
    try {
      const form = await dispatch(
        createForm({ workspaceId, title: "Untitled form", draftPageDef: EMPTY_FORM_DEF }),
      ).unwrap();
      router.push(`/builder?workspaceId=${workspaceId}&formId=${form.id}`);
    } catch (e) {
      notifyError(e instanceof Error ? e.message : "Unable to create form.");
    } finally {
      setCreatingForm(false);
    }
  }, [workspaceId, creatingForm, can, dispatch, router]);

  if (!ready) return <PageLoader message="Loading workspace…" className="min-h-[50vh]" />;

  if (!workspaceId) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-slate-600">
        Invalid workspace.
      </div>
    );
  }

  return (
    <AppPageContainer>
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm ring-1 ring-slate-900/[0.03]">
        <div className="border-b border-slate-100 bg-gradient-to-br from-violet-50/80 via-white to-indigo-50/40 px-5 py-5 sm:px-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <WorkspaceAvatar name={workspaceName} size="md" className="rounded-xl" />
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-lg font-semibold tracking-tight text-slate-900">{workspaceName}</h1>
                  {role ? <RoleBadge role={role} /> : null}
                </div>
                <p className="mt-1 text-xs text-slate-600">
                  Team workspace · {members.length || "—"} members · {forms.length} forms
                  {refreshing ? (
                    <span className="ml-2 inline-flex items-center gap-1 text-xs text-violet-600">
                      <Spinner size="sm" />
                      Syncing…
                    </span>
                  ) : null}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <AppLink
                href={settingsPath(workspaceId, "general")}
                className="inline-flex h-9 items-center rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Settings
              </AppLink>
              <PermissionGate workspaceId={workspaceId} permission="form.create">
                <button
                  type="button"
                  onClick={handleNewForm}
                  disabled={creatingForm}
                  className="inline-flex h-9 items-center gap-2 rounded-lg bg-violet-600 px-3 text-xs font-semibold text-white shadow-sm shadow-violet-600/20 hover:bg-violet-700 disabled:opacity-60"
                >
                  {creatingForm ? <Spinner size="sm" className="border-white/30 border-t-white" /> : null}
                  {creatingForm ? "Creating…" : "New form"}
                </button>
              </PermissionGate>
            </div>
          </div>
        </div>

        <div className="grid gap-px bg-slate-100 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Total forms", value: initialLoading ? "—" : forms.length },
            { label: "Live", value: initialLoading ? "—" : publishedCount, hint: "Accepting responses" },
            { label: "Draft", value: initialLoading ? "—" : draftCount, hint: "Not yet published" },
            { label: "Offline", value: initialLoading ? "—" : unpublishedCount, hint: "Unpublished" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white px-5 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{stat.label}</p>
              <p className="mt-1 text-xl font-semibold tracking-tight text-slate-900">{stat.value}</p>
              {stat.hint ? <p className="mt-1 text-xs text-slate-500">{stat.hint}</p> : null}
            </div>
          ))}
        </div>
      </div>

      <section className="mt-6 overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm ring-1 ring-slate-900/[0.03]">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-4 py-2.5">
          <div>
            <h2 className="text-xs font-semibold text-slate-900">Recent forms</h2>
            <p className="text-[11px] text-slate-500">Latest updates in this workspace</p>
          </div>
          {forms.length > 5 ? (
            <span className="text-[11px] text-slate-500">Showing {recentForms.length} of {forms.length}</span>
          ) : null}
        </div>

        {initialLoading ? (
          <SkeletonRows count={4} className="p-4" rowClassName="h-10" />
        ) : forms.length === 0 ? (
          <div className="px-4 py-10 text-center">
            <p className="text-sm font-medium text-slate-900">No forms yet</p>
            <p className="mt-1 text-xs text-slate-500">Create your first form to start collecting responses.</p>
            <button
              type="button"
              onClick={handleNewForm}
              disabled={creatingForm || !can("form.create")}
              className="mt-4 rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-violet-700 disabled:opacity-60"
            >
              Create form
            </button>
          </div>
        ) : (
          <ul>
            {recentForms.map((f) => (
              <FormRow key={f.id} form={f} workspaceId={workspaceId} />
            ))}
          </ul>
        )}
      </section>

      {forms.length > recentForms.length ? (
        <section className="mt-4 overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm ring-1 ring-slate-900/[0.03]">
          <div className="border-b border-slate-100 px-4 py-2.5">
            <h2 className="text-xs font-semibold text-slate-900">All forms</h2>
          </div>
          <ul>
            {forms.map((f) => (
              <FormRow key={f.id} form={f} workspaceId={workspaceId} />
            ))}
          </ul>
        </section>
      ) : null}
    </AppPageContainer>
  );
}
