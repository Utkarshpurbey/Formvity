import type { CurrentUser } from "../api/types";

const USER_CACHE_KEY = "formvity_user_cache";

export function getCachedUser(): CurrentUser | null {
  try {
    const raw = sessionStorage.getItem(USER_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CurrentUser;
    if (!parsed?.id || !parsed?.displayName) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function setCachedUser(user: CurrentUser | null): void {
  try {
    if (!user) {
      sessionStorage.removeItem(USER_CACHE_KEY);
      return;
    }
    sessionStorage.setItem(USER_CACHE_KEY, JSON.stringify(user));
  } catch {
    /* ignore */
  }
}
