const TOKEN_KEY = "formvity_auth_token";

export function setAuthToken(token: string): void {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    /* ignore */
  }
}

export function getAuthToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function clearAuthToken(): void {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignore */
  }
}

export function getApiHeaders(): Record<string, string> {
  const headers: Record<string, string> = { Accept: "application/json" };
  const token = getAuthToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  } else {
    const basicAuth = process.env.NEXT_PUBLIC_BASIC_AUTH || "Basic dXR0dTpQYXBhQDE5NjU=";
    if (basicAuth) headers.Authorization = basicAuth;
  }
  return headers;
}
