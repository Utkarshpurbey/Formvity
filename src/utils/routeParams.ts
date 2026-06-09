import { getAppBasePath, stripAppBasePath, stripStaticHtmlSuffix } from "./appBasePath";
import { STATIC_EXPORT_SEGMENT } from "../lib/staticExportParams";

export const DEEP_LINK_STORAGE_KEY = "formvity.intendedPath";

export function routePathFromLocation(): string {
  if (typeof window === "undefined") return "";
  return stripStaticHtmlSuffix(stripAppBasePath(window.location.pathname));
}

function normalizeSegment(id: string): string {
  return decodeURIComponent(id).replace(/\.html$/i, "");
}

function isPlaceholder(id: string): boolean {
  const segment = normalizeSegment(id);
  return !segment || segment === STATIC_EXPORT_SEGMENT;
}

/** Real workspace id from the browser URL (GitHub Pages static export). */
export function getWorkspaceIdFromLocation(): string {
  const path = routePathFromLocation();
  const match = path.match(/^\/workspaces\/([^/?#]+)(?:\/|$)/);
  if (!match?.[1]) return "";
  const id = decodeURIComponent(match[1]);
  return isPlaceholder(id) ? "" : id;
}

/** Real form id from the browser URL (GitHub Pages static export). */
export function getFormIdFromLocation(): string {
  const path = routePathFromLocation();
  const match = path.match(/^\/workspaces\/[^/?#]+\/forms\/([^/?#]+)/);
  if (!match?.[1]) return "";
  const id = decodeURIComponent(match[1]);
  return isPlaceholder(id) ? "" : id;
}

export function resolveWorkspaceId(paramValue: string | undefined): string {
  const param = paramValue?.trim() ?? "";
  if (!isPlaceholder(param)) return normalizeSegment(param);
  const fromUrl = getWorkspaceIdFromLocation();
  if (fromUrl) return fromUrl;
  return peekIntendedWorkspaceId();
}

export function resolveFormId(paramValue: string | undefined): string {
  const param = paramValue?.trim() ?? "";
  if (!isPlaceholder(param)) return normalizeSegment(param);
  const fromUrl = getFormIdFromLocation();
  if (fromUrl) return fromUrl;
  return peekIntendedFormId();
}

/** True while the 404 loader sent us to a *.html shell and the real URL is not restored yet. */
export function isDeepLinkRestorePending(): boolean {
  if (typeof window === "undefined") return false;
  const path = stripAppBasePath(window.location.pathname);
  if (!/\.html$/i.test(path)) return false;
  try {
    return Boolean(sessionStorage.getItem(DEEP_LINK_STORAGE_KEY));
  } catch {
    return false;
  }
}

export function peekIntendedPath(): string {
  if (typeof window === "undefined") return "";
  try {
    return sessionStorage.getItem(DEEP_LINK_STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}

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

function idFromPath(path: string, pattern: RegExp): string {
  const match = stripStaticHtmlSuffix(path).match(pattern);
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

/** Restore deep-link URL before data effects (GitHub Pages 404 → *.html shell). */
export function restoreDeepLinkUrl(): string | null {
  if (typeof window === "undefined") return null;
  const intended = peekIntendedPath();
  if (!intended) return null;

  const intendedPath = stripStaticHtmlSuffix(intended.split(/[?#]/)[0] ?? intended);
  const current = routePathFromLocation();
  if (current !== intendedPath && current !== stripStaticHtmlSuffix(intended)) {
    const base = getAppBasePath();
    window.history.replaceState(window.history.state, "", `${window.location.origin}${base}${intended}`);
  }

  consumeIntendedPath();
  return intended;
}
