import { cache } from "react";
import type { FormDef } from "../components/page-def/builder/pageDef";
import { apiUrl } from "../utils/apiPath";
import { getApiHeaders } from "../utils/authHeaders";
import { normalizeFormDef } from "./normalizeFormDef";

export type FormLoadSource =
  | { type: "public"; slug: string }
  | { type: "workspace"; workspaceId: string; formId: string };

export function formDefFromApiPayload(payload: unknown): FormDef | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;

  const data = root.data;
  if (data && typeof data === "object") {
    const nested = data as Record<string, unknown>;
    const fromNested = normalizeFormDef(nested.formDef ?? nested.draftPageDef ?? data);
    if (fromNested) return fromNested;
  }

  const fromRoot = normalizeFormDef(root.formDef ?? root.draftPageDef ?? root);
  return fromRoot;
}

function urlForSource(source: FormLoadSource): string {
  if (source.type === "public") return apiUrl.publicForm(source.slug);
  return apiUrl.workspaceForm(source.workspaceId, source.formId);
}

function parseFormDefResponse(response: Response, payload: unknown): FormDef {
  if (!response.ok) {
    const message =
      payload && typeof payload === "object" && "message" in payload && typeof (payload as { message: unknown }).message === "string"
        ? (payload as { message: string }).message
        : "This form is currently unavailable. Please try again later.";
    throw new Error(message);
  }

  const formDef = formDefFromApiPayload(payload);
  if (!formDef) throw new Error("This form could not be loaded. Please try again later.");
  return formDef;
}

export async function fetchFormDef(source: FormLoadSource, signal?: AbortSignal): Promise<FormDef> {
  const response = await fetch(urlForSource(source), {
    method: "GET",
    headers: getApiHeaders(),
    signal,
  });

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  return parseFormDefResponse(response, payload);
}

export async function fetchPublicFormDefServer(slug: string, revalidateSeconds = 60): Promise<FormDef> {
  const response = await fetch(apiUrl.publicForm(slug), {
    method: "GET",
    headers: { Accept: "application/json" },
    next: { revalidate: revalidateSeconds },
  });

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  return parseFormDefResponse(response, payload);
}

export type PublicFormLoadResult = { formDef: FormDef | null; error: string | null };

export const getCachedPublicFormDef = cache(async (slug: string): Promise<PublicFormLoadResult> => {
  try {
    const formDef = await fetchPublicFormDefServer(slug);
    return { formDef, error: null };
  } catch (err: unknown) {
    return {
      formDef: null,
      error: err instanceof Error ? err.message : "This form could not be loaded. Please try again later.",
    };
  }
});
