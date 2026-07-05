import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { FormDef } from "../../components/page-def/builder/pageDef";
import * as api from "../../api/client";
import { normalizeWorkspaceSummary, normalizeWorkspaceList } from "../../lib/apiNormalize";
import { derivePublishStatusFromForm } from "../../lib/publish";
import { filterActiveForms } from "../../lib/publish";
import type { FormSummary, PublicationMeta, PublishResponse, PublishStatus } from "../../api/types";
import { buildPublicUrl } from "../../utils/publicUrl";
import { fetchWorkspaceDashboard } from "./workspaceSlice";

type FormsState = {
  byWorkspace: Record<string, FormSummary[]>;
  loadingByWorkspace: Record<string, boolean>;
  archivingFormIds: Record<string, boolean>;
  unpublishingFormIds: Record<string, boolean>;
  saving: boolean;
  publishing: boolean;
  unpublishing: boolean;
  error: string | null;
  currentFormId: string | null;
  publishStatusByForm: Record<string, PublishStatus>;
  publishStatusLoadingByForm: Record<string, boolean>;
  lastPublishResult: PublishResponse | null;
  publicationByForm: Record<string, PublicationMeta>;
};

const initialState: FormsState = {
  byWorkspace: {},
  loadingByWorkspace: {},
  archivingFormIds: {},
  unpublishingFormIds: {},
  saving: false,
  publishing: false,
  unpublishing: false,
  error: null,
  currentFormId: null,
  publishStatusByForm: {},
  publishStatusLoadingByForm: {},
  lastPublishResult: null,
  publicationByForm: {},
};

function upsertForm(state: FormsState, form: FormSummary) {
  const wsId = form.workspaceId;
  const list = state.byWorkspace[wsId] ?? [];
  const idx = list.findIndex((f) => f.id === form.id);
  if (idx >= 0) list[idx] = form;
  else list.unshift(form);
  state.byWorkspace[wsId] = list;
}

function removeForm(state: FormsState, formId: string) {
  for (const wsId of Object.keys(state.byWorkspace)) {
    state.byWorkspace[wsId] = state.byWorkspace[wsId]!.filter((f) => f.id !== formId);
  }
}

export const selectFormsForWorkspace = (state: { forms: FormsState }, workspaceId: string | null) =>
  workspaceId ? (state.forms.byWorkspace[workspaceId] ?? []) : [];

export const selectActiveFormsForWorkspace = (state: { forms: FormsState }, workspaceId: string | null) =>
  filterActiveForms(selectFormsForWorkspace(state, workspaceId));

export const selectFormsInitialLoading = (state: { forms: FormsState }, workspaceId: string | null) =>
  Boolean(workspaceId && state.forms.loadingByWorkspace[workspaceId] && !state.forms.byWorkspace[workspaceId]?.length);

export const selectFormsRefreshing = (state: { forms: FormsState }, workspaceId: string | null) =>
  Boolean(workspaceId && state.forms.loadingByWorkspace[workspaceId] && (state.forms.byWorkspace[workspaceId]?.length ?? 0) > 0);

export const selectPublishStatusForForm = (state: { forms: FormsState }, formId: string | null) =>
  formId ? (state.forms.publishStatusByForm[formId] ?? null) : null;

type FetchFormsArg = string | { workspaceId: string; force?: boolean };

function resolveFormsWorkspaceId(arg: FetchFormsArg): string {
  return typeof arg === "string" ? arg : arg.workspaceId;
}

export const fetchForms = createAsyncThunk(
  "forms/list",
  async (arg: FetchFormsArg) => api.listForms(resolveFormsWorkspaceId(arg)),
  {
    condition: (arg, { getState }) => {
      const workspaceId = resolveFormsWorkspaceId(arg);
      const force = typeof arg === "object" && arg.force;
      if (force) return true;
      const state = getState() as { forms: FormsState };
      if (state.forms.loadingByWorkspace[workspaceId]) return false;
      return (state.forms.byWorkspace[workspaceId]?.length ?? 0) === 0;
    },
  },
);

export const createForm = createAsyncThunk(
  "forms/create",
  async ({ workspaceId, title, draftPageDef }: { workspaceId: string; title: string; draftPageDef: FormDef }) =>
    api.createForm(workspaceId, title, draftPageDef),
);

export const loadFormDraft = createAsyncThunk(
  "forms/loadDraft",
  async ({ workspaceId, formId }: { workspaceId: string; formId: string }) => {
    const draft = await api.getFormDraft(workspaceId, formId);
    return { formId, draft };
  },
);

export const saveFormDraft = createAsyncThunk(
  "forms/saveDraft",
  async ({
    workspaceId,
    formId,
    title,
    draftPageDef,
  }: {
    workspaceId: string;
    formId: string;
    title: string;
    draftPageDef: FormDef;
  }) => api.patchForm(workspaceId, formId, { title, draftPageDef }),
);

export const archiveForm = createAsyncThunk(
  "forms/archive",
  async ({ workspaceId, formId }: { workspaceId: string; formId: string }) => {
    await api.deleteForm(workspaceId, formId, false);
    return formId;
  },
);

type FetchPublishStatusArg = { workspaceId: string; formId: string; force?: boolean };

export const fetchPublishStatus = createAsyncThunk(
  "forms/fetchPublishStatus",
  async ({ workspaceId, formId }: FetchPublishStatusArg, { getState }) => {
    const remote = await api.getPublishStatus(workspaceId, formId);
    if (remote) return { formId, status: remote };

    const state = getState() as { forms: FormsState };
    const form = state.forms.byWorkspace[workspaceId]?.find((f) => f.id === formId);
    const pub = state.forms.publicationByForm[formId];
    return {
      formId,
      status: derivePublishStatusFromForm(form?.status, pub?.slug, pub?.lastPublishedAt),
    };
  },
  {
    condition: ({ formId, force }, { getState }) => {
      if (force) return true;
      const state = getState() as { forms: FormsState };
      if (state.forms.publishStatusLoadingByForm[formId]) return false;
      return state.forms.publishStatusByForm[formId] === undefined;
    },
  },
);

export const publishForm = createAsyncThunk(
  "forms/publish",
  async ({ workspaceId, formId }: { workspaceId: string; formId: string }) =>
    api.publishForm(workspaceId, formId),
);

export const unpublishForm = createAsyncThunk(
  "forms/unpublish",
  async ({ workspaceId, formId }: { workspaceId: string; formId: string }) =>
    api.unpublishForm(workspaceId, formId),
);

const formsSlice = createSlice({
  name: "forms",
  initialState,
  reducers: {
    setCurrentFormId(state, action: { payload: string | null }) {
      state.currentFormId = action.payload;
    },
    clearFormsError(state) {
      state.error = null;
    },
    clearPublishStatus(state, action: { payload?: string }) {
      if (action.payload) {
        delete state.publishStatusByForm[action.payload];
      } else {
        state.publishStatusByForm = {};
      }
      state.lastPublishResult = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWorkspaceDashboard.pending, (s, a) => {
        s.loadingByWorkspace[a.meta.arg] = true;
      })
      .addCase(fetchWorkspaceDashboard.fulfilled, (s, a) => {
        s.loadingByWorkspace[a.payload.workspaceId] = false;
        s.byWorkspace[a.payload.workspaceId] = filterActiveForms(a.payload.recentForms);
      })
      .addCase(fetchWorkspaceDashboard.rejected, (s, a) => {
        s.loadingByWorkspace[a.meta.arg] = false;
      })
      .addCase(fetchForms.pending, (s, a) => {
        const workspaceId = resolveFormsWorkspaceId(a.meta.arg);
        s.loadingByWorkspace[workspaceId] = true;
        s.error = null;
      })
      .addCase(fetchForms.fulfilled, (s, a) => {
        const workspaceId = resolveFormsWorkspaceId(a.meta.arg);
        s.loadingByWorkspace[workspaceId] = false;
        s.byWorkspace[workspaceId] = filterActiveForms(a.payload);
      })
      .addCase(fetchForms.rejected, (s, a) => {
        const workspaceId = resolveFormsWorkspaceId(a.meta.arg);
        s.loadingByWorkspace[workspaceId] = false;
        s.error = a.error.message ?? "Unable to load forms. Please try again.";
      })
      .addCase(createForm.fulfilled, (s, a) => {
        upsertForm(s, a.payload);
        s.currentFormId = a.payload.id;
      })
      .addCase(saveFormDraft.pending, (s) => {
        s.saving = true;
      })
      .addCase(saveFormDraft.fulfilled, (s, a) => {
        s.saving = false;
        upsertForm(s, a.payload);
      })
      .addCase(saveFormDraft.rejected, (s, a) => {
        s.saving = false;
        s.error = a.error.message ?? "Save failed";
      })
      .addCase(archiveForm.pending, (s, a) => {
        s.archivingFormIds[a.meta.arg.formId] = true;
      })
      .addCase(archiveForm.fulfilled, (s, a) => {
        delete s.archivingFormIds[a.meta.arg.formId];
        removeForm(s, a.payload);
      })
      .addCase(archiveForm.rejected, (s, a) => {
        delete s.archivingFormIds[a.meta.arg.formId];
      })
      .addCase(fetchPublishStatus.pending, (s, a) => {
        s.publishStatusLoadingByForm[a.meta.arg.formId] = true;
      })
      .addCase(fetchPublishStatus.fulfilled, (s, a) => {
        delete s.publishStatusLoadingByForm[a.meta.arg.formId];
        s.publishStatusByForm[a.payload.formId] = a.payload.status;
      })
      .addCase(fetchPublishStatus.rejected, (s, a) => {
        delete s.publishStatusLoadingByForm[a.meta.arg.formId];
      })
      .addCase(publishForm.pending, (s) => {
        s.publishing = true;
        s.error = null;
      })
      .addCase(publishForm.fulfilled, (s, a) => {
        s.publishing = false;
        const payload: PublishResponse = {
          ...a.payload,
          publicUrl: a.payload.publicUrl || (a.payload.slug ? buildPublicUrl(a.payload.slug) : ""),
        };
        s.lastPublishResult = payload;
        s.publicationByForm[a.meta.arg.formId] = {
          slug: payload.slug,
          publicUrl: payload.publicUrl,
          publishedAt: payload.publishedAt,
          lastPublishedAt: payload.publishedAt,
          isLive: true,
        };
        s.publishStatusByForm[a.meta.arg.formId] = {
          status: "published",
          slug: payload.slug,
          publicUrl: payload.publicUrl,
          lastPublishedAt: payload.publishedAt,
          draftChangedSincePublish: false,
        };
        const wsId = a.meta.arg.workspaceId;
        const list = s.byWorkspace[wsId];
        if (list) {
          const idx = list.findIndex((f) => f.id === payload.formId || f.id === a.meta.arg.formId);
          if (idx >= 0) list[idx] = { ...list[idx]!, status: "PUBLISHED" };
        }
      })
      .addCase(publishForm.rejected, (s, a) => {
        s.publishing = false;
        s.error = a.error.message ?? "Publish failed";
      })
      .addCase(unpublishForm.pending, (s, a) => {
        s.unpublishing = true;
        s.unpublishingFormIds[a.meta.arg.formId] = true;
        s.error = null;
      })
      .addCase(unpublishForm.fulfilled, (s, a) => {
        s.unpublishing = false;
        delete s.unpublishingFormIds[a.meta.arg.formId];
        const existing = s.publicationByForm[a.meta.arg.formId];
        const lastAt = existing?.lastPublishedAt ?? existing?.publishedAt ?? a.payload.lastPublishedAt;
        const slug = existing?.slug ?? a.payload.slug;
        s.publicationByForm[a.meta.arg.formId] = {
          slug,
          publicUrl: existing?.publicUrl ?? a.payload.publicUrl,
          publishedAt: existing?.publishedAt,
          lastPublishedAt: lastAt,
          isLive: false,
        };
        s.publishStatusByForm[a.meta.arg.formId] = {
          status: "unpublished",
          slug,
          publicUrl: a.payload.publicUrl,
          lastPublishedAt: lastAt,
          draftChangedSincePublish: false,
        };
        s.lastPublishResult = null;
        const wsId = a.meta.arg.workspaceId;
        const list = s.byWorkspace[wsId];
        if (list) {
          const idx = list.findIndex((f) => f.id === a.meta.arg.formId);
          if (idx >= 0) list[idx] = { ...list[idx]!, status: "UNPUBLISHED" };
        }
      })
      .addCase(unpublishForm.rejected, (s, a) => {
        s.unpublishing = false;
        delete s.unpublishingFormIds[a.meta.arg.formId];
        s.error = a.error.message ?? "Unpublish failed";
      });
  },
});

export const { setCurrentFormId, clearFormsError, clearPublishStatus } = formsSlice.actions;
export default formsSlice.reducer;
