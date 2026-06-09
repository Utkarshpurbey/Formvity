"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAppRouter } from "@/src/hooks/useAppRouter";
import { useFormId, useWorkspaceId } from "@/src/hooks/useRouteIds";
import { toast } from "react-toastify";
import { AppPageContainer } from "@/src/components/layout/AppPageContainer";
import { ConfirmDialog } from "@/src/components/ui/ConfirmDialog";
import { PublishFlowModal, type PublishModalMode } from "@/src/components/publish/PublishFlowModal";
import { FormPublishingPanel } from "@/src/components/publish/FormPublishingPanel";
import { FormLifecycleBadge } from "@/src/components/ui/FormLifecycleBadge";
import { PageLoader } from "@/src/components/ui/index";
import { deriveFormLifecycle, isEditableFormLifecycle } from "@/src/lib/publish";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import {
  archiveForm,
  clearFormsError,
  fetchForms,
  fetchPublishStatus,
  publishForm,
  selectFormsForWorkspace,
  selectFormsInitialLoading,
  unpublishForm,
} from "@/src/store/slices/formsSlice";
import { fetchWorkspaces } from "@/src/store/slices/workspaceSlice";
import { EMPTY_FORM_DEF } from "@/src/lib/normalizeFormDef";
import { PermissionGate, useWorkspaceRole, workspaceCan } from "@/src/components/workspace/index";
import { FormSubNav } from "@/src/components/form/index";
import { buildPublicUrl } from "@/src/utils/publicUrl";

export default function FormDetailPage() {
  const router = useAppRouter();
  const dispatch = useAppDispatch();
  const workspaceId = useWorkspaceId();
  const formId = useFormId();
  const { user, ready } = useAppSelector((s) => s.auth);
  const workspaces = useAppSelector((s) => s.workspace.list);
  const forms = useAppSelector((s) => selectFormsForWorkspace(s, workspaceId));
  const formsLoading = useAppSelector((s) => selectFormsInitialLoading(s, workspaceId));
  const publication = useAppSelector((s) => s.forms.publicationByForm[formId]);
  const publishStatus = useAppSelector((s) => s.forms.publishStatus);
  const publishing = useAppSelector((s) => s.forms.publishing);
  const unpublishing = useAppSelector((s) => s.forms.unpublishingFormIds[formId]);
  const publishError = useAppSelector((s) => s.forms.error);
  const lastPublishResult = useAppSelector((s) => s.forms.lastPublishResult);
  const role = useWorkspaceRole(workspaceId);
  const can = (p: Parameters<typeof workspaceCan>[1]) => workspaceCan(role, p);

  const form = useMemo(() => forms.find((f) => f.id === formId), [forms, formId]);
  const workspace = useMemo(
    () => workspaces.find((w) => w.workSpaceId === workspaceId),
    [workspaces, workspaceId],
  );

  const lifecycle = useMemo(
    () =>
      deriveFormLifecycle({
        formStatus: form?.status,
        notFound: ready && !formsLoading && !form,
        publishStatus,
        publication,
        lastPublishResult,
      }),
    [form?.status, ready, formsLoading, form, publishStatus, publication, lastPublishResult],
  );

  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const [publishModalMode, setPublishModalMode] = useState<PublishModalMode>("publish");
  const [unpublishOpen, setUnpublishOpen] = useState(false);
  const [archiving, setArchiving] = useState(false);

  const slug = lifecycle.slug ?? lifecycle.previousSlug ?? lastPublishResult?.slug;
  const publicUrl =
    lifecycle.publicUrl ??
    lifecycle.previousPublicUrl ??
    (slug ? buildPublicUrl(slug) : "");

  useEffect(() => {
    if (!ready) return;
    if (!user) router.replace("/login");
  }, [ready, user, router]);

  useEffect(() => {
    if (!ready || !user || !workspaceId) return;
    dispatch(fetchWorkspaces());
    dispatch(fetchForms(workspaceId));
  }, [ready, user, workspaceId, dispatch]);

  useEffect(() => {
    if (!ready || !user || !workspaceId || !formId) return;
    dispatch(fetchPublishStatus({ workspaceId, formId }));
  }, [ready, user, workspaceId, formId, dispatch]);

  useEffect(() => {
    if (!ready || formsLoading) return;
    if (lifecycle.kind === "archived" || lifecycle.kind === "not_found") {
      router.replace(`/workspaces/${workspaceId}`);
    }
  }, [ready, formsLoading, lifecycle.kind, router, workspaceId]);

  const openPublish = (mode: PublishModalMode) => {
    dispatch(clearFormsError());
    setPublishModalMode(mode);
    setPublishModalOpen(true);
  };

  const handlePublish = async (_newSlug?: string) => {
    return dispatch(publishForm({ workspaceId, formId })).unwrap();
  };

  const handleUnpublish = useCallback(async () => {
    try {
      await dispatch(unpublishForm({ workspaceId, formId })).unwrap();
      setUnpublishOpen(false);
      toast.success("Form is now offline.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not unpublish");
    }
  }, [dispatch, workspaceId, formId]);

  const handleArchive = useCallback(async () => {
    if (archiving || !can("form.delete")) return;
    setArchiving(true);
    try {
      await dispatch(archiveForm({ workspaceId, formId })).unwrap();
      toast.info("Form archived.");
      router.push(`/workspaces/${workspaceId}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not archive");
    } finally {
      setArchiving(false);
    }
  }, [archiving, can, dispatch, workspaceId, formId, router]);

  if (!ready || (formsLoading && !form)) {
    return <PageLoader message="Loading form…" className="min-h-[50vh]" />;
  }

  if (!workspaceId || !formId || !form || !isEditableFormLifecycle(lifecycle)) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 px-4 text-center">
        <p className="font-semibold text-slate-900">Form not available</p>
        <p className="text-sm text-slate-500">It may have been archived or removed.</p>
        <button
          type="button"
          onClick={() => router.push(`/workspaces/${workspaceId}`)}
          className="text-sm text-violet-600 hover:underline"
        >
          Back to workspace
        </button>
      </div>
    );
  }

  return (
    <AppPageContainer>
      <nav className="text-sm text-slate-500">
        <button type="button" onClick={() => router.push("/workspaces")} className="hover:text-violet-600">
          Workspaces
        </button>
        <span className="mx-2">/</span>
        <button
          type="button"
          onClick={() => router.push(`/workspaces/${workspaceId}`)}
          className="hover:text-violet-600"
        >
          {workspace?.workSpaceName ?? "Workspace"}
        </button>
        <span className="mx-2">/</span>
        <span className="font-medium text-slate-800">{form.title.trim() || "Untitled form"}</span>
      </nav>

      <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              {form.title.trim() || "Untitled form"}
            </h1>
            <FormLifecycleBadge lifecycle={lifecycle} size="md" />
          </div>
          <p className="mt-2 text-sm text-slate-500">
            Created {new Date(form.createdAt).toLocaleDateString()} · Updated{" "}
            {new Date(form.updatedAt).toLocaleString()}
          </p>
        </div>
        <button
          type="button"
          onClick={() => router.push(`/builder/v2?workspaceId=${workspaceId}&formId=${formId}`)}
          className="inline-flex h-10 items-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Open in builder
        </button>
      </div>

        <FormSubNav workspaceId={workspaceId} formId={formId} />

      <div className="mt-8 grid gap-6 lg:grid-cols-5">
        <section className="lg:col-span-3 space-y-6">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900">Publishing</h2>
            <p className="mt-1 text-sm text-slate-500">
              Control whether this form is live and accepting responses.
            </p>

            <FormPublishingPanel
              lifecycle={lifecycle}
              loading={formsLoading}
              onPublish={() => openPublish("publish")}
              onRepublish={() => openPublish("republish")}
              onShare={() => openPublish("share")}
              onUnpublish={() => setUnpublishOpen(true)}
              publishing={publishing}
              unpublishing={Boolean(unpublishing)}
              canPublish={can("form.publish")}
              canUnpublish={can("form.unpublish")}
            />
          </div>
        </section>

        <aside className="lg:col-span-2 space-y-4">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Details</h3>
            <dl className="mt-4 space-y-3 text-sm">
              <div>
                <dt className="text-slate-500">Form ID</dt>
                <dd className="mt-0.5 truncate font-mono text-xs text-slate-800">{form.id}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Workspace</dt>
                <dd className="mt-0.5 font-medium text-slate-900">{workspace?.workSpaceName}</dd>
              </div>
              {slug ? (
                <div>
                  <dt className="text-slate-500">Public slug</dt>
                  <dd className="mt-0.5 font-mono text-xs text-slate-800">/r/{slug}</dd>
                </div>
              ) : null}
            </dl>
          </div>

          <PermissionGate workspaceId={workspaceId} permission="form.delete">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Danger zone</h3>
              <p className="mt-2 text-xs text-slate-500">Archive removes this form from your workspace list.</p>
              <button
                type="button"
                onClick={handleArchive}
                disabled={archiving}
                className="mt-4 w-full rounded-lg border border-rose-200 px-3 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50 disabled:opacity-60"
              >
                {archiving ? "Archiving…" : "Archive form"}
              </button>
            </div>
          </PermissionGate>
        </aside>
      </div>

      <PublishFlowModal
        open={publishModalOpen}
        mode={publishModalMode}
        formDef={{ ...EMPTY_FORM_DEF, title: form.title }}
        existingSlug={slug}
        existingPublicUrl={publicUrl}
        publishing={publishing}
        onClose={() => setPublishModalOpen(false)}
        onPublish={handlePublish}
        publishResult={lastPublishResult}
        error={publishError}
      />

      <ConfirmDialog
        open={unpublishOpen}
        title="Take form offline?"
        description={
          <>
            <span className="font-medium text-slate-800">{form.title.trim() || "Untitled form"}</span> will no
            longer be available at its public link. Respondents will see an unavailable message.
          </>
        }
        confirmLabel="Unpublish"
        confirmingLabel="Unpublishing…"
        confirming={Boolean(unpublishing)}
        onClose={() => setUnpublishOpen(false)}
        onConfirm={handleUnpublish}
      />
    </AppPageContainer>
  );
}
