import { stripAppBasePath } from "./appBasePath";
import { STATIC_EXPORT_SEGMENT } from "../lib/staticExportParams";

export const DEEP_LINK_STORAGE_KEY = "formvity.intendedPath";

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
  const fromUrl = getWorkspaceIdFromLocation();
  if (fromUrl) return fromUrl;
  return peekIntendedWorkspaceId();
}

export function resolveFormId(paramValue: string | undefined): string {
  const param = paramValue?.trim() ?? "";
  if (!isPlaceholder(param)) return param;
  const fromUrl = getFormIdFromLocation();
  if (fromUrl) return fromUrl;
  return peekIntendedFormId();
}

/** Read and clear intended path saved by static-export 404.html loader. */
export function consumeIntendedPath(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const intended = sessionStorage.getItem(DEEP_LINK_STORAGE_KEY);
    if (intended) sessionStorage.removeItem(DEEP_LINK_STORAGE_KEY);
    return intended;
  } catch {
    return null;
  }
}

function peekIntendedPath(): string {
  if (typeof window === "undefined") return "";
  try {
    return sessionStorage.getItem(DEEP_LINK_STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}

function idFromPath(path: string, pattern: RegExp): string {
  const match = path.match(pattern);
  if (!match?.[1]) return "";
  const id = decodeURIComponent(match[1]);
  return isPlaceholder(id) ? "" : id;
}

function peekIntendedWorkspaceId(): string {
  const path = peekIntendedPath().split(/[?#]/)[0] ?? "";
  return idFromPath(path, /^\/workspaces\/([^/]+)/);
}

function peekIntendedFormId(): string {
  const path = peekIntendedPath().split(/[?#]/)[0] ?? "";
  return idFromPath(path, /^\/workspaces\/[^/]+\/forms\/([^/]+)/);
}
