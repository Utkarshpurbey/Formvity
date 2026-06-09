import { getCompleteHost } from "../utils/apiPath";
import { clearAuthToken, getApiHeaders } from "../utils/authHeaders";
import type { ApiErrorBody, ApiResponse } from "./types";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

function errorMessage(body: ApiErrorBody | null, status: number): string {
  if (body?.errorMessage) return body.errorMessage;
  if (body?.message) return body.message;
  if (body?.error) return body.error;
  return `Request failed (${status})`;
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const url = path.startsWith("http") ? path : getCompleteHost(path);
  const res = await fetch(url, {
    ...options,
    headers: {
      ...getApiHeaders(),
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });

  const text = await res.text();
  let body: unknown = null;
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
  }

  if (!res.ok) {
    if (res.status === 401 && path.includes("auth/me")) clearAuthToken();
    throw new ApiError(errorMessage(body as ApiErrorBody, res.status), res.status);
  }

  return body as T;
}

/** Unwrap `{ status, data, message }` or return raw body. */
export function unwrapData<T>(body: unknown): T {
  if (body && typeof body === "object" && "data" in body) {
    return (body as ApiResponse<T>).data;
  }
  return body as T;
}

export async function apiData<T>(path: string, options: RequestInit = {}): Promise<T> {
  const body = await apiFetch<unknown>(path, options);
  return unwrapData<T>(body);
}
