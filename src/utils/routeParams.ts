import { stripAppBasePath } from "./appBasePath";
import { STATIC_EXPORT_SEGMENT } from "../lib/staticExportParams";

function isPlaceholder(id: string): boolean {
  return !id || id === STATIC_EXPORT_SEGMENT;
}

/** Real workspace id from the browser URL (GitHub Pages static export). */
export function getWorkspaceIdFromLocation(): string {
  if (typeof window === "undefined") return "";
  const path = stripAppBasePath(window.location.pathname);
  const match = path.match(/^\/workspaces\/([^/?#]+)(?:\/|$)/);
  if (!match?.[1]) return "";
  const id = decodeURIComponent(match[1]);
  return isPlaceholder(id) ? "" : id;
}

/** Real form id from the browser URL (GitHub Pages static export). */
export function getFormIdFromLocation(): string {
  if (typeof window === "undefined") return "";
  const path = stripAppBasePath(window.location.pathname);
  const match = path.match(/^\/workspaces\/[^/?#]+\/forms\/([^/?#]+)/);
  if (!match?.[1]) return "";
  const id = decodeURIComponent(match[1]);
  return isPlaceholder(id) ? "" : id;
}

export function resolveWorkspaceId(paramValue: string | undefined): string {
  const param = paramValue?.trim() ?? "";
  if (!isPlaceholder(param)) return param;
  return getWorkspaceIdFromLocation();
}

export function resolveFormId(paramValue: string | undefined): string {
  const param = paramValue?.trim() ?? "";
  if (!isPlaceholder(param)) return param;
  return getFormIdFromLocation();
}
