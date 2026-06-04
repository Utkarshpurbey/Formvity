import { apiData, apiFetch, unwrapData } from "./http";
import type { CurrentUser, LoginResponse } from "./types";

export function login(userName: string, password: string) {
  return apiFetch<LoginResponse>("auth/login", {
    method: "POST",
    body: JSON.stringify({ userName, password }),
  });
}

export function register(displayName: string, email: string, password: string) {
  return apiData<unknown>("auth/register", {
    method: "POST",
    body: JSON.stringify({ displayName, email, password }),
  });
}

export async function fetchMe() {
  const body = await apiFetch<unknown>("auth/me");
  return unwrapData<CurrentUser>(body);
}

export function logout() {
  return apiData<string>("auth/logout", { method: "POST" });
}
