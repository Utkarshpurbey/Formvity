import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { FormDef } from "../../components/page-def/builder/pageDef";
import * as formsApi from "../../api/formsApi";
import type { FormSummary, PublishResponse, PublishStatus } from "../../api/types";
import { buildPublicUrl } from "../../utils/publicUrl";

type FormsState = {
  byWorkspace: Record<string, FormSummary[]>;
  loadingByWorkspace: Record<string, boolean>;
  saving: boolean;
  publishing: boolean;
  error: string | null;
  currentFormId: string | null;
  publishStatus: PublishStatus | null;
  lastPublishResult: PublishResponse | null;
};

const initialState: FormsState = {
  byWorkspace: {},
  loadingByWorkspace: {},
  saving: false,
  publishing: false,
  error: null,
  currentFormId: null,
  publishStatus: null,
  lastPublishResult: null,
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

export const selectFormsInitialLoading = (state: { forms: FormsState }, workspaceId: string | null) =>
  Boolean(workspaceId && state.forms.loadingByWorkspace[workspaceId] && !state.forms.byWorkspace[workspaceId]?.length);

export const selectFormsRefreshing = (state: { forms: FormsState }, workspaceId: string | null) =>
  Boolean(workspaceId && state.forms.loadingByWorkspace[workspaceId] && (state.forms.byWorkspace[workspaceId]?.length ?? 0) > 0);

export const fetchForms = createAsyncThunk(
  "forms/list",
  async (workspaceId: string) => formsApi.listForms(workspaceId),
);

export const createForm = createAsyncThunk(
  "forms/create",
  async ({ workspaceId, title, draftPageDef }: { workspaceId: string; title: string; draftPageDef: FormDef }) =>
    formsApi.createForm(workspaceId, title, draftPageDef),
);

export const loadFormDraft = createAsyncThunk(
  "forms/loadDraft",
  async ({ workspaceId, formId }: { workspaceId: string; formId: string }) => {
    const draft = await formsApi.getFormDraft(workspaceId, formId);
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
  }) => formsApi.patchForm(workspaceId, formId, { title, draftPageDef }),
);

export const archiveForm = createAsyncThunk(
  "forms/archive",
  async ({ workspaceId, formId }: { workspaceId: string; formId: string }) => {
    await formsApi.deleteForm(workspaceId, formId, false);
    return formId;
  },
);

export const fetchPublishStatus = createAsyncThunk(
  "forms/fetchPublishStatus",
  async ({ workspaceId, formId }: { workspaceId: string; formId: string }) =>
    formsApi.getPublishStatus(workspaceId, formId),
);

export const publishForm = createAsyncThunk(
  "forms/publish",
  async ({
    workspaceId,
    formId,
    slug,
  }: {
    workspaceId: string;
    formId: string;
    slug?: string;
  }) => formsApi.publishForm(workspaceId, formId, slug ? { slug } : undefined),
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
    clearPublishStatus(state) {
      state.publishStatus = null;
      state.lastPublishResult = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchForms.pending, (s, a) => {
        s.loadingByWorkspace[a.meta.arg] = true;
        s.error = null;
      })
      .addCase(fetchForms.fulfilled, (s, a) => {
        s.loadingByWorkspace[a.meta.arg] = false;
        s.byWorkspace[a.meta.arg] = a.payload;
      })
      .addCase(fetchForms.rejected, (s, a) => {
        s.loadingByWorkspace[a.meta.arg] = false;
        s.error = a.error.message ?? "Could not load forms";
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
      .addCase(archiveForm.fulfilled, (s, a) => {
        removeForm(s, a.payload);
      })
      .addCase(fetchPublishStatus.fulfilled, (s, a) => {
        s.publishStatus = a.payload;
      })
      .addCase(fetchPublishStatus.rejected, (s) => {
        s.publishStatus = null;
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
        s.publishStatus = {
          status: "published",
          slug: payload.slug,
          publicUrl: payload.publicUrl,
          lastPublishedAt: payload.publishedAt,
          draftChangedSincePublish: false,
        };
        const wsId = a.meta.arg.workspaceId;
        const list = s.byWorkspace[wsId];
        if (list) {
          const idx = list.findIndex((f) => f.id === payload.formId);
          if (idx >= 0) list[idx] = { ...list[idx]!, status: "PUBLISHED" };
        }
      })
      .addCase(publishForm.rejected, (s, a) => {
        s.publishing = false;
        s.error = a.error.message ?? "Publish failed";
      });
  },
});

export const { setCurrentFormId, clearFormsError, clearPublishStatus } = formsSlice.actions;
export default formsSlice.reducer;
