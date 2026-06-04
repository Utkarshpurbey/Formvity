import type { FormDef } from "../components/page-def/builder/pageDef";
import { apiData } from "./http";
import type { DraftPageDef, FormEntity, FormSummary, PublishResponse, PublishStatus } from "./types";

export function listForms(workspaceId: string) {
  return apiData<FormSummary[]>(`workspace/${workspaceId}/forms`);
}

export function createForm(workspaceId: string, title: string, draftPageDef: FormDef) {
  return apiData<FormEntity>(`workspace/${workspaceId}/forms`, {
    method: "POST",
    body: JSON.stringify({ title, draftPageDef }),
  });
}

export function getFormDraft(workspaceId: string, formId: string) {
  return apiData<DraftPageDef>(`workspace/${workspaceId}/forms/${formId}`);
}

export function patchForm(
  workspaceId: string,
  formId: string,
  patch: { title?: string; draftPageDef?: FormDef },
) {
  return apiData<FormEntity>(`workspace/${workspaceId}/forms/${formId}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
}

export function putForm(workspaceId: string, formId: string, title: string, draftPageDef: FormDef) {
  return apiData<FormEntity>(`workspace/${workspaceId}/forms/${formId}`, {
    method: "PUT",
    body: JSON.stringify({ title, draftPageDef }),
  });
}

export function deleteForm(workspaceId: string, formId: string, hard = false) {
  const q = hard ? "?hard=true" : "";
  return apiData<string>(`workspace/${workspaceId}/forms/${formId}${q}`, { method: "DELETE" });
}

export function getPublishStatus(workspaceId: string, formId: string) {
  return apiData<PublishStatus>(`workspace/${workspaceId}/forms/${formId}/publish-status`);
}

export function publishForm(
  workspaceId: string,
  formId: string,
  body?: { slug?: string; regenerateSlug?: boolean },
) {
  return apiData<PublishResponse>(`workspace/${workspaceId}/forms/${formId}/publish`, {
    method: "POST",
    body: body ? JSON.stringify(body) : undefined,
  });
}
