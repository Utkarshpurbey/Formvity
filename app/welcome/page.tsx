"use client";

import { Suspense, useEffect, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchInvitePreview } from "@/src/api/client";
import { ApiError } from "@/src/api/http";
import type { InvitePreview } from "@/src/api/types";
import { AuthShell } from "@/src/components/layout/AuthShell";
import { RoleBadge } from "@/src/components/workspace/index";
import { classifyInviteError, type InviteErrorKind } from "@/src/lib/inviteErrors";
import { notifyError, notifySuccess } from "@/src/components/ui/AppToast";
import { PageLoader, Spinner } from "@/src/components/ui/index";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import { activateInvitedUser } from "@/src/store/slices/authSlice";
import { setActiveWorkspace } from "@/src/store/slices/workspaceSlice";

function workspaceInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0]![0]!}${parts[1]![0]!}`.toUpperCase();
  return name.slice(0, 2).toUpperCase() || "WS";
}

function formatExpiry(iso: string): string {
  if (!iso) return "";
  try {
    return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function InviteErrorCard({
  kind,
  message,
  email,
  onLogin,
}: {
  kind: InviteErrorKind;
  message: string;
  email?: string;
  onLogin: () => void;
}) {
  const styles: Record<InviteErrorKind, { ring: string; icon: string; title: string }> = {
    invalid: { ring: "border-rose-200 bg-rose-50", icon: "text-rose-600", title: "Invalid invite link" },
    expired: { ring: "border-amber-200 bg-amber-50", icon: "text-amber-600", title: "Invite expired" },
    exists: { ring: "border-sky-200 bg-sky-50", icon: "text-sky-600", title: "Account already exists" },
    generic: { ring: "border-slate-200 bg-slate-50", icon: "text-slate-600", title: "Unable to continue" },
  };
  const s = styles[kind];

  return (
    <div className={`rounded-2xl border px-5 py-5 ${s.ring}`}>
      <h2 className="text-lg font-semibold text-slate-900">{s.title}</h2>
      <p className="mt-2 text-sm text-slate-700">{message}</p>
      {kind === "exists" ? (
        <button
          type="button"
          onClick={onLogin}
          className="mt-4 inline-flex h-10 items-center rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          Sign in instead
        </button>
      ) : null}
      {email && kind !== "exists" ? (
        <p className="mt-3 text-xs text-slate-500">
          Invited as <span className="font-medium text-slate-700">{email}</span>
        </p>
      ) : null}
    </div>
  );
}

function WelcomePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const emailFromUrl = searchParams.get("email") ?? "";
  const dispatch = useAppDispatch();
  const { loading: activating, user, ready } = useAppSelector((s) => s.auth);

  const [preview, setPreview] = useState<InvitePreview | null>(null);
  const [loading, setLoading] = useState(Boolean(token));
  const [previewError, setPreviewError] = useState<{ kind: InviteErrorKind; message: string } | null>(null);
  const [activateError, setActivateError] = useState<{ kind: InviteErrorKind; message: string } | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setPreviewError({ kind: "invalid", message: "This invitation link is incomplete. Please use the link from your email." });
      return;
    }
    let cancelled = false;
    setLoading(true);
    setPreviewError(null);
    fetchInvitePreview(token)
      .then((data) => {
        if (!cancelled) setPreview(data);
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          const classified = classifyInviteError(e);
          setPreviewError(classified);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  useEffect(() => {
    if (!ready || !user || !preview) return;
    dispatch(setActiveWorkspace(preview.workspaceId));
    router.replace(`/workspaces/${preview.workspaceId}`);
  }, [ready, user, preview, router, dispatch]);

  const handleActivate = async (event: FormEvent) => {
    event.preventDefault();
    setActivateError(null);
    const name = displayName.trim();
    if (!name || password.length < 8) {
      setActivateError({ kind: "generic", message: "Please enter your full name and a password of at least 8 characters." });
      return;
    }
    if (password !== confirmPassword) {
      setActivateError({ kind: "generic", message: "Passwords do not match. Please try again." });
      return;
    }
    try {
      const res = await dispatch(
        activateInvitedUser({
          token,
          displayName: name,
          password,
          email: preview?.email ?? emailFromUrl,
        }),
      ).unwrap();
      notifySuccess(`Welcome, ${res.user.displayName}. You have joined the workspace.`);
      dispatch(setActiveWorkspace(res.workspaceId));
      router.push(`/workspaces/${res.workspaceId}`);
    } catch (e) {
      const payload = e as { status?: number; message?: string };
      const classified = classifyInviteError(
        payload?.status ? new ApiError(payload.message ?? "Unable to complete your invitation. Please try again.", payload.status) : e,
      );
      setActivateError(classified);
      notifyError(classified.message);
    }
  };

  const loginHref = `/login?redirect=${encodeURIComponent(preview ? `/workspaces/${preview.workspaceId}` : "/workspaces")}`;

  if (!ready || loading) {
    return <PageLoader message="Verifying your invite…" className="min-h-screen" />;
  }

  const lockedEmail = preview?.email ?? emailFromUrl;

  return (
    <AuthShell
      badge="Workspace invite"
      title="Join your team on Formvity"
      subtitle="Accept your invitation to collaborate on forms, analytics, and publishing in one shared workspace."
    >
      <section className="page-enter w-full max-w-lg rounded-2xl border border-slate-200/80 bg-white p-8 shadow-xl shadow-slate-900/5">
        {previewError ? (
          <InviteErrorCard
            kind={previewError.kind}
            message={previewError.message}
            email={emailFromUrl || undefined}
            onLogin={() => router.push(loginHref)}
          />
        ) : preview ? (
          <>
            <div className="flex items-start gap-4">
              <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 text-lg font-bold text-white shadow-lg shadow-violet-500/25">
                {workspaceInitials(preview.workspaceName)}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wider text-violet-600">You&apos;re invited</p>
                <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">{preview.workspaceName}</h2>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <RoleBadge role={preview.role} />
                  {preview.expiresAt ? (
                    <span className="text-xs text-slate-500">Expires {formatExpiry(preview.expiresAt)}</span>
                  ) : null}
                </div>
              </div>
            </div>

            {user ? (
              <p className="mt-8 flex items-center justify-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-4 py-6 text-sm text-slate-600">
                <Spinner size="sm" />
                Signed in. Opening your workspace…
              </p>
            ) : (
              <form className="mt-8 space-y-4" onSubmit={handleActivate}>
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-slate-700">Work email</span>
                  <input
                    type="email"
                    value={lockedEmail}
                    readOnly
                    className="h-11 w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 px-3.5 text-sm text-slate-600"
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-slate-700">Full name</span>
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    autoComplete="name"
                    placeholder="Jane Doe"
                    className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 text-sm transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-200"
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-slate-700">Password</span>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                    placeholder="At least 8 characters"
                    className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 text-sm transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-200"
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-slate-700">Confirm password</span>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                    placeholder="Repeat password"
                    className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 text-sm transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-200"
                  />
                </label>

                {activateError ? (
                  <InviteErrorCard
                    kind={activateError.kind}
                    message={activateError.message}
                    onLogin={() => router.push(loginHref)}
                  />
                ) : null}

                <button
                  type="submit"
                  disabled={activating}
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white shadow-md shadow-indigo-600/20 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-400"
                >
                  {activating ? (
                    <>
                      <Spinner size="sm" className="border-white/30 border-t-white" />
                      Joining workspace…
                    </>
                  ) : (
                    "Accept invitation"
                  )}
                </button>
                <p className="text-center text-xs text-slate-500">
                  Already have an account?{" "}
                  <button type="button" onClick={() => router.push(loginHref)} className="font-semibold text-indigo-600 hover:text-indigo-700">
                    Sign in
                  </button>
                </p>
              </form>
            )}
          </>
        ) : null}
      </section>
    </AuthShell>
  );
}

export default function WelcomePage() {
  return (
    <Suspense fallback={<PageLoader message="Loading invite…" className="min-h-screen" />}>
      <WelcomePageContent />
    </Suspense>
  );
}
