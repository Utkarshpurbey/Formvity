"use server";

import { safeRedirectPath, serverLogin } from "@/src/lib/auth/serverLogin";

export type LoginActionState = {
  ok: boolean;
  error?: string;
  token?: string;
  user?: { id: string; displayName: string; email: string };
  redirectTo?: string;
};

export async function loginAction(
  _prevState: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> {
  const userName = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const redirectTo = safeRedirectPath(String(formData.get("redirect") ?? ""));

  const result = await serverLogin(userName, password);
  if (!result.ok) {
    return { ok: false, error: result.error, redirectTo };
  }

  return {
    ok: true,
    token: result.token,
    user: result.user,
    redirectTo,
  };
}
