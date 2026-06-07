import type { FormDef } from "../components/page-def/builder/pageDef";
import {
  normalizePublicationResponse,
  normalizeUnpublishResponse,
} from "../lib/normalizePublication";
import { ApiError, apiData } from "./http";
import type { DraftPageDef, FormEntity, FormSummary, PublishResponse, PublishStatus } from "./types";

export function listForms(workspaceId: string) {
  return apiData<FormSummary[]>(`workspaces/${workspaceId}/forms`);
}

export function createForm(workspaceId: string, title: string, draftPageDef: FormDef) {
  return apiData<FormEntity>(`workspaces/${workspaceId}/forms`, {
    method: "POST",
    body: JSON.stringify({ title, draftPageDef }),
  });
}

export function getFormDraft(workspaceId: string, formId: string) {
  return apiData<DraftPageDef>(`workspaces/${workspaceId}/forms/${formId}`);
}

export function patchForm(
  workspaceId: string,
  formId: string,
  patch: { title?: string; draftPageDef?: FormDef },
) {
  return apiData<FormEntity>(`workspaces/${workspaceId}/forms/${formId}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
}

export function putForm(workspaceId: string, formId: string, title: string, draftPageDef: FormDef) {
  return apiData<FormEntity>(`workspaces/${workspaceId}/forms/${formId}`, {
    method: "PUT",
    body: JSON.stringify({ title, draftPageDef }),
  });
}

export function deleteForm(workspaceId: string, formId: string, hard = false) {
  const q = hard ? "?hard=true" : "";
  return apiData<string>(`workspaces/${workspaceId}/forms/${formId}${q}`, { method: "DELETE" });
}

/** Optional endpoint — returns null when backend has no publish-status route (404). */
export async function getPublishStatus(
  workspaceId: string,
  formId: string,
): Promise<PublishStatus | null> {
  try {
    return await apiData<PublishStatus>(`workspaces/${workspaceId}/forms/${formId}/publish-status`);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return null;
    throw e;
  }
}

/** Backend generates slug; no request body required. */
export async function publishForm(workspaceId: string, formId: string): Promise<PublishResponse> {
  const raw = await apiData<unknown>(`workspaces/${workspaceId}/forms/${formId}/publish`, {
    method: "POST",
  });
  return normalizePublicationResponse(raw, formId);
}

export async function unpublishForm(workspaceId: string, formId: string): Promise<PublishStatus> {
  const raw = await apiData<unknown>(`workspaces/${workspaceId}/forms/${formId}/unpublish`, {
    method: "POST",
  });
  return normalizeUnpublishResponse(raw);
}
