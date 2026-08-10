const ACTIVE_WORKSPACE_KEY = "formvity-active-workspace";

export function readActiveWorkspaceId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(ACTIVE_WORKSPACE_KEY);
  } catch {
    return null;
  }
}

export function persistActiveWorkspaceId(id: string | null): void {
  if (typeof window === "undefined") return;
  try {
    if (id) localStorage.setItem(ACTIVE_WORKSPACE_KEY, id);
    else localStorage.removeItem(ACTIVE_WORKSPACE_KEY);
  } catch {
    /* ignore */
  }
}
