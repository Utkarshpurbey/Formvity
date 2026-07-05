"use client";

import { useEffect, useRef } from "react";
import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { notifySuccess } from "@/src/components/ui/AppToast";
import { Spinner } from "@/src/components/ui/index";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import { hydrateUser } from "@/src/store/slices/authSlice";
import { setAuthToken } from "@/src/utils/authHeaders";
import { setCachedUser } from "@/src/utils/userCache";
import { trackEvent } from "@/src/lib/googleAnalytics";
import { loginAction, type LoginActionState } from "./actions";

const initialState: LoginActionState = { ok: false };

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white shadow-md shadow-indigo-600/20 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-400"
    >
      {pending ? (
        <>
          <Spinner size="sm" className="border-white/30 border-t-white" />
          Signing in…
        </>
      ) : (
        "Sign in"
      )}
    </button>
  );
}

type LoginFormProps = {
  redirectTo: string;
};

export function LoginForm({ redirectTo }: LoginFormProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const completedRef = useRef(false);
  const [state, formAction] = useFormState(loginAction, initialState);

  useEffect(() => {
    if (!user) return;
    router.replace(redirectTo);
  }, [user, router, redirectTo]);

  useEffect(() => {
    if (!state.ok || !state.token || !state.user || completedRef.current) return;
    completedRef.current = true;

    setAuthToken(state.token);
    setCachedUser(state.user);
    dispatch(hydrateUser(state.user));
    trackEvent("login", { method: "email" });
    notifySuccess("Welcome back.");
    router.replace(state.redirectTo ?? redirectTo);
  }, [state, dispatch, router, redirectTo]);

  const error = state.error;

  return (
    <section className="page-enter w-full max-w-md rounded-2xl border border-slate-200/80 bg-white p-8 shadow-xl shadow-slate-900/5">
      <h2 className="text-2xl font-bold tracking-tight text-slate-900">Sign in</h2>
      <p className="mt-1 text-sm text-slate-500">Enter your email and password to access your workspace.</p>
      <form className="mt-8 space-y-5" action={formAction}>
        <input type="hidden" name="redirect" value={redirectTo} />
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
        <SubmitButton />
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
