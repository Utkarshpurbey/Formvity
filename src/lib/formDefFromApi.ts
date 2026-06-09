import type { FormDef } from "../components/page-def/builder/pageDef";
import { apiUrl } from "../utils/apiPath";
import { getApiHeaders } from "../utils/authHeaders";
import { normalizeFormDef } from "./normalizeFormDef";

export type FormLoadSource =
  | { type: "public"; slug: string }
  | { type: "workspace"; workspaceId: string; formId: string };

/** Read FormDef from API payloads shaped as `{ data: { formDef } }` (with fallbacks). */
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

  if (!response.ok) {
    const message =
      payload && typeof payload === "object" && "message" in payload && typeof (payload as { message: unknown }).message === "string"
        ? (payload as { message: string }).message
        : `Failed to load form (${response.status})`;
    throw new Error(message);
  }

  const formDef = formDefFromApiPayload(payload);
  if (!formDef) throw new Error("API response did not include a valid formDef.");
  return formDef;
}
