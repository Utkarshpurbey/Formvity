const STORAGE_PREFIX = "formvity-form-filled-";

function storageKey(slug: string) {
  return `${STORAGE_PREFIX}${slug}`;
}

export function isFormFilled(slug: string): boolean {
  if (!slug || typeof window === "undefined") return false;
  try {
    return localStorage.getItem(storageKey(slug)) === "1";
  } catch {
    return false;
  }
}

export function markFormFilled(slug: string): void {
  if (!slug || typeof window === "undefined") return;
  try {
    localStorage.setItem(storageKey(slug), "1");
  } catch {
    // ignore quota / private mode
  }
}

export function clearFormFilled(slug: string): void {
  if (!slug || typeof window === "undefined") return;
  try {
    localStorage.removeItem(storageKey(slug));
  } catch {
    // ignore
  }
}
