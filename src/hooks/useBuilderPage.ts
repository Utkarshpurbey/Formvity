"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import type { FormDef, FormPageDef } from "../components/page-def/builder/pageDef";
import type { SaveState } from "../components/page-def/builder/BuilderTopBar";
import type { PublishModalMode } from "../components/publish/PublishFlowModal";
import { ApiError } from "../api/http";
import { deriveFormLifecycle, isEditableFormLifecycle } from "../lib/publish";
import { EMPTY_FORM_DEF, getActivePage, getPageIndex, normalizeFormDef } from "../lib/normalizeFormDef";
import { PAGE_DEF_TEMPLATES } from "../lib/page-def-templates";
import { cloneTemplatePageDef, toBuilderFormDef } from "../lib/template-to-builder-page-def";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  clearFormsError,
  fetchPublishStatus,
  loadFormDraft,
  publishForm,
  saveFormDraft,
  selectPublishStatusForForm,
} from "../store/slices/formsSlice";
import { buildPublicUrl } from "../utils/publicUrl";

const DEBOUNCE_MS = 400;

export function useBuilderPage(builderBasePath = "/builder") {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const saving = useAppSelector((s) => s.forms.saving);
  const publishing = useAppSelector((s) => s.forms.publishing);
  const publishStatus = useAppSelector((s) => selectPublishStatusForForm(s, formId || null));
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
      router.replace(builderBasePath);
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

    router.replace(builderBasePath);
  }, [searchParams, router, builderBasePath]);

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

  return {
    apiMode,
    loaded,
    loadBlocked,
    formDef,
    setFormDef,
    activePage,
    activePageId,
    setActivePageId,
    pageIndex,
    isLastPage,
    isFirstPage,
    selectedId,
    setSelectedId,
    selectedComponent,
    showJson,
    setShowJson,
    jsonInput,
    setJsonInput,
    jsonError,
    saveState,
    lifecycle,
    saving,
    publishing,
    publishModalOpen,
    publishModalMode,
    publishError,
    lastPublishResult,
    existingSlug,
    existingPublicUrl,
    updateActivePage,
    deleteSelected,
    handleSave,
    openPublishModal,
    closePublishModal,
    handlePublish,
    formFromList,
  };
}
