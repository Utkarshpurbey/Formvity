import type { ReactNode } from "react";

type AuthShellProps = {
  children: ReactNode;
  title: string;
  subtitle: string;
  badge: string;
};

export function AuthShell({ children, title, subtitle, badge }: AuthShellProps) {
  return (
    <div className="flex min-h-screen">
      <aside className="relative hidden w-[44%] overflow-hidden bg-slate-950 lg:flex lg:flex-col lg:justify-between">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_20%_0%,rgba(99,102,241,0.45),transparent)]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.12] bg-[linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:40px_40px]"
          aria-hidden
        />
        <div className="relative p-10">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/30">
              <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2Z" />
              </svg>
            </div>
            <span className="text-lg font-bold text-white">Formvity</span>
          </div>
          <p className="mt-16 text-xs font-semibold uppercase tracking-[0.25em] text-indigo-300">{badge}</p>
          <h1 className="mt-4 max-w-md text-4xl font-bold leading-tight tracking-tight text-white">{title}</h1>
          <p className="mt-4 max-w-sm text-base leading-relaxed text-slate-400">{subtitle}</p>
        </div>
        <div className="relative border-t border-white/10 p-10">
          <blockquote className="text-sm leading-relaxed text-slate-300">
            &ldquo;The fastest way for our team to ship branded forms without waiting on engineering.&rdquo;
          </blockquote>
          <p className="mt-3 text-xs font-medium text-slate-500">Product teams at growing companies</p>
        </div>
      </aside>
      <main className="flex flex-1 items-center justify-center bg-slate-50 px-4 py-10">{children}</main>
    </div>
  );
}
