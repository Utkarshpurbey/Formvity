"use client";

import { useEffect, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { AuthShell } from "@/src/components/layout/AuthShell";
import { Spinner } from "@/src/components/ui/index";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import { clearAuthError, loginUser } from "@/src/store/slices/authSlice";

export default function LoginRoutePage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { loading, error, user } = useAppSelector((s) => s.auth);

  useEffect(() => {
    if (user) router.replace("/workspaces");
  }, [user, router]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    dispatch(clearAuthError());
    const formData = new FormData(event.currentTarget);
    const userName = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");
    dispatch(loginUser({ userName, password }))
      .unwrap()
      .then(() => {
        toast.success("Signed in successfully.");
        router.push("/workspaces");
      })
      .catch((e: Error) => toast.error(e.message ?? "Sign in failed"));
  };

  return (
    <AuthShell
      badge="Sign in"
      title="Access your Formvity workspace"
      subtitle="Build, publish, and manage forms from one dashboard."
    >
      <section className="page-enter w-full max-w-md rounded-2xl border border-slate-200/80 bg-white p-8 shadow-xl shadow-slate-900/5">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Log in</h2>
        <p className="mt-1 text-sm text-slate-500">Use your email and password.</p>
        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">Email</span>
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@company.com"
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 text-sm text-slate-800 transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-200"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">Password</span>
            <input
              name="password"
              type="password"
              required
              autoComplete="current-password"
              placeholder="••••••••"
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 text-sm text-slate-800 transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-200"
            />
          </label>
          {error ? (
            <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-700">{error}</p>
          ) : null}
          <button
            type="submit"
            disabled={loading}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white shadow-md shadow-indigo-600/20 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-400"
          >
            {loading ? (
              <>
                <Spinner size="sm" className="border-white/30 border-t-white" />
                Signing in…
              </>
            ) : (
              "Sign in"
            )}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-500">
          New here?{" "}
          <button type="button" onClick={() => router.push("/register")} className="font-semibold text-indigo-600 hover:text-indigo-700">
            Create an account
          </button>
        </p>
      </section>
    </AuthShell>
  );
}
