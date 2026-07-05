import type { LoginResponse } from "../../api/types";
import { ApiPath, getCompleteHost } from "../../utils/apiPath";

type ApiErrorBody = {
  errorMessage?: string;
  message?: string;
  error?: string;
};

function errorMessage(body: ApiErrorBody | null, status: number): string {
  if (body?.errorMessage) return body.errorMessage;
  if (body?.message) return body.message;
  if (body?.error) return body.error;
  return `Unable to sign in. Please check your credentials and try again.`;
}

export type ServerLoginResult =
  | { ok: true; token: string; user: { id: string; displayName: string; email: string } }
  | { ok: false; error: string };

/** Authenticate against the backend API from the Next.js server (never from the browser). */
export async function serverLogin(userName: string, password: string): Promise<ServerLoginResult> {
  const email = userName.trim();
  if (!email || !password) {
    return { ok: false, error: "Email and password are required." };
  }

  try {
    const url = getCompleteHost(ApiPath.auth.login);
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userName: email, password }),
      cache: "no-store",
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
      return { ok: false, error: errorMessage(body as ApiErrorBody | null, res.status) };
    }

    const data = body as LoginResponse;
    if (!data?.token || !data?.id) {
      return { ok: false, error: "Unable to sign in. Please try again." };
    }

    return {
      ok: true,
      token: data.token,
      user: { id: data.id, displayName: data.displayName, email },
    };
  } catch {
    return { ok: false, error: "Unable to sign in. Please check your connection and try again." };
  }
}

export function safeRedirectPath(path: string | null | undefined): string {
  if (!path || !path.startsWith("/") || path.startsWith("//")) return "/workspaces";
  return path;
}
