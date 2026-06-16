"use client";

import { Suspense, useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { notifyError, notifySuccess } from "@/src/components/ui/AppToast";
import { AuthShell } from "@/src/components/layout/AuthShell";
import { PageLoader, Spinner } from "@/src/components/ui/index";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import { clearAuthError, registerUser } from "@/src/store/slices/authSlice";

function RegisterPageContent() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { loading, error, user } = useAppSelector((s) => s.auth);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (user) router.replace("/workspaces");
  }, [user, router]);

  const handleRegister = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLocalError(null);
    dispatch(clearAuthError());
    const formData = new FormData(event.currentTarget);
    const displayName = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    if (!displayName || !/\S+@\S+\.\S+/.test(email) || password.length < 8) {
      setLocalError("Enter name, valid email, and password (min 8 characters).");
      return;
    }

    dispatch(registerUser({ displayName, email, password }))
      .unwrap()
      .then(() => {
        notifySuccess("Account created. Welcome!");
        router.push("/workspaces");
      })
      .catch((e: Error) => notifyError(e.message ?? "Registration failed"));
  };

  const message = localError ?? error;

  return (
    <AuthShell
      badge="Get started"
      title="Create your Formvity account"
      subtitle="Start with a workspace, build your first form, and publish when you are ready."
    >
      <section className="page-enter w-full max-w-lg rounded-2xl border border-slate-200/80 bg-white p-8 shadow-xl shadow-slate-900/5">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Sign up</h2>
        <p className="mt-1 text-sm text-slate-500">Free to start — no credit card required.</p>
        <form className="mt-8 space-y-4" onSubmit={handleRegister}>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">Full name</span>
            <input
              name="name"
              type="text"
              required
              autoComplete="name"
              placeholder="Jane Doe"
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 text-sm transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-200"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">Work email</span>
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@company.com"
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 text-sm transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-200"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">Password</span>
            <input
              name="password"
              type="password"
              required
              autoComplete="new-password"
              placeholder="At least 8 characters"
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 text-sm transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-200"
            />
          </label>
          {message ? (
            <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-700">{message}</p>
          ) : null}
          <button
            type="submit"
            disabled={loading}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white shadow-md shadow-indigo-600/20 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-400"
          >
            {loading ? (
              <>
                <Spinner size="sm" className="border-white/30 border-t-white" />
                Creating account…
              </>
            ) : (
              "Create account"
            )}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-500">
          Already registered?{" "}
          <button type="button" onClick={() => router.push("/login")} className="font-semibold text-indigo-600 hover:text-indigo-700">
            Log in
          </button>
        </p>
        <p className="mt-3 text-center text-xs text-slate-500">
          Invited to a workspace? Use the link in your email — it opens <span className="font-medium">/invite</span>.
        </p>
      </section>
    </AuthShell>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<PageLoader message="Loading…" className="min-h-screen" />}>
      <RegisterPageContent />
    </Suspense>
  );
}
