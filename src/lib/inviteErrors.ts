import { ApiError } from "../api/http";

export type InviteErrorKind = "invalid" | "expired" | "exists" | "generic";

export function classifyInviteError(error: unknown): { kind: InviteErrorKind; message: string } {
  if (error instanceof ApiError) {
    if (error.status === 404) {
      return { kind: "invalid", message: "This invite link is invalid or has already been used." };
    }
    if (error.status === 410) {
      return { kind: "expired", message: "This invite has expired. Ask your workspace admin to send a new one." };
    }
    if (error.status === 409) {
      return {
        kind: "exists",
        message: "An account with this email already exists. Sign in to access the workspace.",
      };
    }
    return { kind: "generic", message: error.message };
  }
  return { kind: "generic", message: error instanceof Error ? error.message : "An unexpected error occurred. Please try again." };
}
