"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { notifySuccess } from "@/src/components/ui/AppToast";
import { Spinner } from "@/src/components/ui/index";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import { loginUser } from "@/src/store/slices/authSlice";
import { trackEvent } from "@/src/lib/googleAnalytics";

type LoginFormProps = {
  redirectTo: string;
};

export function LoginForm({ redirectTo }: LoginFormProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    router.replace(redirectTo);
  }, [user, router, redirectTo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail || !password) return;

    setLoading(true);
    setError(null);

    try {
      await dispatch(loginUser({ userName: cleanEmail, password })).unwrap();
      trackEvent("login", { method: "email" });
      notifySuccess("Welcome back.");
      router.replace(redirectTo);
    } catch (err) {
      setError(typeof err === "string" ? err : "Unable to sign in. Please check your credentials and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="page-enter w-full max-w-md rounded-2xl border border-slate-200/80 bg-white p-8 shadow-xl shadow-slate-900/5">
      <h2 className="text-2xl font-bold tracking-tight text-slate-900">Sign in</h2>
      <p className="mt-1 text-sm text-slate-500">Enter your email and password to access your workspace.</p>
      <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-slate-700">Email</span>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-semibold text-indigo-600 hover:text-indigo-700">
          Create an account
        </Link>
      </p>
    </section>
  );
}
