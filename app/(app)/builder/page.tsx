"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import type { FormDef, FormPageDef } from "../../../src/components/page-def/builder/pageDef";
import BuilderLeftPanel from "../../../src/components/page-def/builder/BuilderLeftPanel";
import { BuilderTopBar, type SaveState } from "../../../src/components/page-def/builder/BuilderTopBar";
import PageCanvas from "../../../src/components/page-def/builder/PageCanvas";
import ComponentConfigPanel from "../../../src/components/page-def/builder/ComponentConfigPanel";
import { PublishFlowModal, type PublishModalMode } from "../../../src/components/publish/PublishFlowModal";
import { PageLoader } from "../../../src/components/ui/PageLoader";
import { ApiError } from "../../../src/api/http";
import { deriveFormLifecycle, isEditableFormLifecycle } from "../../../src/lib/formLifecycle";
import { EMPTY_FORM_DEF, getActivePage, getPageIndex, normalizeFormDef } from "../../../src/lib/normalizeFormDef";
import { PAGE_DEF_TEMPLATES } from "../../../src/lib/page-def-templates";
import { cloneTemplatePageDef, toBuilderFormDef } from "../../../src/lib/template-to-builder-page-def";
import { useAppDispatch, useAppSelector } from "../../../src/store/hooks";
import {
  clearFormsError,
  fetchPublishStatus,
  loadFormDraft,
  publishForm,
  saveFormDraft,
} from "../../../src/store/slices/formsSlice";
import { buildPublicUrl } from "../../../src/utils/publicUrl";

const DEBOUNCE_MS = 400;

function BuilderPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const saving = useAppSelector((s) => s.forms.saving);
  const publishing = useAppSelector((s) => s.forms.publishing);
  const publishStatus = useAppSelector((s) => s.forms.publishStatus);
  const publication = useAppSelector((s) => s.forms.publicationByForm);
  const lastPublishResult = useAppSelector((s) => s.forms.lastPublishResult);
  const publishError = useAppSelector((s) => s.forms.error);

  const workspaceId = searchParams.get("workspaceId") ?? "";
  const formId = searchParams.get("formId") ?? "";
  const apiMode = Boolean(workspaceId && formId);

  const formFromList = useAppSelector((s) =>
    workspaceId ? (s.forms.byWorkspace[workspaceId] ?? []).find((f) => f.id === formId) : undefined,
  );

  const [formDef, setFormDef] = useState<FormDef>(EMPTY_FORM_DEF);
  const [activePageId, setActivePageId] = useState(EMPTY_FORM_DEF.pages[0]!.id);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showJson, setShowJson] = useState(false);
  const [jsonInput, setJsonInput] = useState(JSON.stringify(EMPTY_FORM_DEF, null, 2));
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(!apiMode);
  const [loadBlocked, setLoadBlocked] = useState(false);
  const [savedSnapshot, setSavedSnapshot] = useState<string | null>(null);
  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const [publishModalMode, setPublishModalMode] = useState<PublishModalMode>("publish");

  const activePage = useMemo(
    () => getActivePage(formDef, activePageId) ?? formDef.pages[0]!,
    [formDef, activePageId],
  );

  const pageIndex = useMemo(() => getPageIndex(formDef, activePage.id), [formDef, activePage.id]);
  const isLastPage = pageIndex === formDef.pages.length - 1;
  const isFirstPage = pageIndex <= 0;

  const formDefJson = useMemo(() => JSON.stringify(formDef), [formDef]);

  const saveState: SaveState = useMemo(() => {
    if (saving) return "saving";
    if (apiMode && savedSnapshot !== null && formDefJson !== savedSnapshot) return "unsaved";
    return "saved";
  }, [saving, apiMode, savedSnapshot, formDefJson]);

  const lifecycle = useMemo(() => {
    const base = deriveFormLifecycle({
      formStatus: formFromList?.status,
      publishStatus: publishStatus?.status ? publishStatus : null,
      publication: formId ? publication[formId] : null,
      lastPublishResult,
    });
    if (base.kind === "live" && saveState === "unsaved") {
      return { ...base, draftChangedSincePublish: true };
    }
    return base;
  }, [formFromList?.status, publishStatus, publication, formId, lastPublishResult, saveState]);

  const updateActivePage = useCallback((updater: (prev: FormPageDef) => FormPageDef) => {
    setFormDef((prev) => ({
      ...prev,
      pages: prev.pages.map((p) => (p.id === activePageId ? updater(p) : p)),
    }));
  }, [activePageId]);

  useEffect(() => {
    if (!apiMode) return;
    dispatch(loadFormDraft({ workspaceId, formId }))
      .unwrap()
      .then(({ draft }) => {
        const parsed = normalizeFormDef(draft);
        if (parsed) {
          setFormDef(parsed);
          setActivePageId(parsed.pages[0]!.id);
          setSavedSnapshot(JSON.stringify(parsed));
        }
        setLoaded(true);
      })
      .catch((e: unknown) => {
        const status = e instanceof ApiError ? e.status : 0;
        if (status === 404) {
          toast.error("This form was not found or has been archived.");
          router.replace(workspaceId ? `/workspaces/${workspaceId}` : "/workspaces");
        } else {
          toast.error(e instanceof Error ? e.message : "Could not load form");
        }
        setLoadBlocked(true);
        setLoaded(true);
      });
  }, [apiMode, workspaceId, formId, dispatch, router]);

  useEffect(() => {
    if (!apiMode || !loaded || loadBlocked) return;
    if (formFromList?.status === "ARCHIVED") {
      toast.info("Archived forms cannot be edited.");
      router.replace(`/workspaces/${workspaceId}`);
      return;
    }
    dispatch(fetchPublishStatus({ workspaceId, formId }));
  }, [apiMode, loaded, loadBlocked, formFromList?.status, workspaceId, formId, dispatch, router]);

  useEffect(() => {
    const templateKey = searchParams.get("template");
    if (!templateKey) return;

    const template = PAGE_DEF_TEMPLATES[templateKey];
    if (!template) {
      toast.error("Unknown template.");
      router.replace("/builder");
      return;
    }

    try {
      const parsed = toBuilderFormDef(cloneTemplatePageDef(template));
      setFormDef(parsed);
      setActivePageId(parsed.pages[0]!.id);
      setSelectedId(null);
      setShowJson(false);
      setJsonError(null);
      toast.success("Template loaded into Formvity.");
    } catch {
      toast.error("Could not load selected template.");
    }

    router.replace("/builder");
  }, [searchParams, router]);

  useEffect(() => {
    setJsonInput(JSON.stringify(formDef, null, 2));
  }, [formDef]);

  useEffect(() => {
    if (!showJson) return;
    const t = setTimeout(() => {
      setJsonError(null);
      try {
        const parsed = JSON.parse(jsonInput) as unknown;
        const normalized = normalizeFormDef(parsed);
        if (!normalized) throw new Error("Need version 1 FormDef with pages[], or legacy single-page shape.");
        setFormDef(normalized);
        setActivePageId(normalized.pages[0]!.id);
      } catch (e) {
        setJsonError(e instanceof Error ? e.message : "Invalid JSON");
      }
    }, DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [showJson, jsonInput]);

  const selectedComponent = activePage.components.find((c) => c.id === selectedId) ?? null;

  const deleteSelected = useCallback(() => {
    if (!selectedId) return;
    updateActivePage((prev) => ({
      ...prev,
      components: prev.components.filter((c) => c.id !== selectedId),
    }));
    setSelectedId(null);
  }, [selectedId, updateActivePage]);

  const persistDraft = useCallback(async () => {
    if (!apiMode) {
      toast.success("Draft saved.");
      return;
    }
    await dispatch(
      saveFormDraft({ workspaceId, formId, title: formDef.title, draftPageDef: formDef }),
    ).unwrap();
    setSavedSnapshot(formDefJson);
  }, [apiMode, dispatch, formDef, formDefJson, formId, workspaceId]);

  const handleSave = () => {
    persistDraft()
      .then(() => {
        if (apiMode) toast.success("Saved to API.");
      })
      .catch((e: Error) => toast.error(e.message));
  };

  useEffect(() => {
    if (!apiMode || !loaded || loadBlocked) return;
    const t = setTimeout(() => {
      dispatch(saveFormDraft({ workspaceId, formId, title: formDef.title, draftPageDef: formDef }))
        .unwrap()
        .then(() => setSavedSnapshot(JSON.stringify(formDef)))
        .catch(() => undefined);
    }, 1500);
    return () => clearTimeout(t);
  }, [apiMode, loaded, loadBlocked, workspaceId, formId, formDef, dispatch]);

  const openPublishModal = (mode: PublishModalMode) => {
    dispatch(clearFormsError());
    setPublishModalMode(mode);
    setPublishModalOpen(true);
  };

  const closePublishModal = () => {
    setPublishModalOpen(false);
    dispatch(clearFormsError());
  };

  const handlePublish = async (_slug?: string) => {
    if (!apiMode) return;
    await dispatch(
      saveFormDraft({ workspaceId, formId, title: formDef.title, draftPageDef: formDef }),
    ).unwrap();
    setSavedSnapshot(formDefJson);
    return dispatch(publishForm({ workspaceId, formId })).unwrap();
  };

  const existingSlug = lifecycle.slug ?? lastPublishResult?.slug;
  const existingPublicUrl =
    lifecycle.publicUrl ?? lastPublishResult?.publicUrl ?? (existingSlug ? buildPublicUrl(existingSlug) : undefined);

  if (apiMode && !loaded) {
    return <PageLoader message="Loading form from server…" className="bg-slate-100" />;
  }

  if (apiMode && loadBlocked) {
    return <PageLoader message="Redirecting…" className="bg-slate-100" />;
  }

  if (apiMode && formFromList && !isEditableFormLifecycle(lifecycle)) {
    return <PageLoader message="Redirecting…" className="bg-slate-100" />;
  }

  return (
    <div className="flex min-h-0 flex-1 bg-slate-100">
      <aside className="flex w-72 shrink-0 flex-col overflow-hidden border-r border-slate-200 bg-white shadow-sm">
        <BuilderLeftPanel
          formDef={formDef}
          activePageId={activePageId}
          onActivePageChange={setActivePageId}
          onFormDefChange={setFormDef}
          onClearSelection={() => setSelectedId(null)}
        />
      </aside>
      <main className="flex min-w-0 flex-1 flex-col overflow-hidden p-4">
        <BuilderTopBar
          formTitle={formDef.title}
          saveState={saveState}
          apiMode={apiMode}
          lifecycle={apiMode ? lifecycle : null}
          showJson={showJson}
          onToggleJson={() => setShowJson((v) => !v)}
          onSave={handleSave}
          onPublish={() => openPublishModal("publish")}
          onShare={() => openPublishModal("share")}
          onUpdateLive={() => openPublishModal("republish")}
          saving={saving}
          publishing={publishing}
        />
        {!showJson ? (
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <PageCanvas
              key={activePage.id}
              formDef={formDef}
              page={activePage}
              pageIndex={pageIndex}
              totalPages={formDef.pages.length}
              selectedId={selectedId}
              onSelect={setSelectedId}
              onFormDefChange={setFormDef}
              onPageChange={updateActivePage}
              isLastPage={isLastPage}
              isFirstPage={isFirstPage}
            />
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="border-b border-slate-200 p-3">
              <span className="text-sm text-slate-600">FormDef JSON — full document including all pages</span>
            </div>
            <textarea
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              className="w-full flex-1 resize-none bg-slate-50 p-4 font-mono text-sm text-slate-800 focus:outline-none"
              spellCheck={false}
            />
            {jsonError ? (
              <p className="border-t border-rose-100 bg-rose-50 px-4 py-2 text-sm text-rose-600">{jsonError}</p>
            ) : null}
          </div>
        )}
      </main>
      <aside className="flex w-72 shrink-0 flex-col overflow-hidden border-l border-slate-200 bg-white shadow-sm">
        <ComponentConfigPanel
          formDef={formDef}
          selectedComponent={selectedComponent}
          onFormDefChange={setFormDef}
          onPageChange={updateActivePage}
          onClearSelection={() => setSelectedId(null)}
          onDeleteSelected={selectedId ? deleteSelected : undefined}
        />
      </aside>

      {apiMode ? (
        <PublishFlowModal
          open={publishModalOpen}
          mode={publishModalMode}
          formDef={formDef}
          existingSlug={existingSlug}
          existingPublicUrl={existingPublicUrl}
          publishing={publishing}
          onClose={closePublishModal}
          onPublish={handlePublish}
          publishResult={lastPublishResult}
          error={publishError}
        />
      ) : null}
    </div>
  );
}

export default function BuilderPage() {
  return (
    <Suspense fallback={<PageLoader message="Opening builder…" className="bg-slate-100" />}>
      <BuilderPageInner />
    </Suspense>
  );
}
