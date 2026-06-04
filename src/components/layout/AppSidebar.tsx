"use client";

import { memo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { logoutUser } from "../../store/slices/authSlice";

const nav = [
  { href: "/workspace", label: "Dashboard", icon: "grid" },
  { href: "/builder", label: "Builder", icon: "layout" },
  { href: "/templates", label: "Templates", icon: "spark" },
];

function NavIcon({ name }: { name: string }) {
  const cls = "size-[18px] shrink-0";
  if (name === "grid")
    return (
      <svg className={cls} fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
      </svg>
    );
  if (name === "layout")
    return (
      <svg className={cls} fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2Z" />
      </svg>
    );
  return (
    <svg className={cls} fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.847a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.847.813a4.5 4.5 0 0 0-3.09 3.09Z" />
    </svg>
  );
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0]![0]!}${parts[parts.length - 1]![0]!}`.toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

export const AppSidebar = memo(function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);

  const handleLogout = () => {
    dispatch(logoutUser());
    toast.info("Signed out.");
    router.push("/home");
  };

  return (
    <aside className="hidden w-[240px] shrink-0 flex-col border-r border-slate-200/80 bg-white lg:flex">
      <div className="flex h-14 items-center gap-2.5 border-b border-slate-100 px-5">
        <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/25">
          <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2Z" />
          </svg>
        </div>
        <span className="text-sm font-bold tracking-tight text-slate-900">Formvity</span>
      </div>

      <nav className="flex-1 space-y-0.5 p-3" aria-label="App">
        {nav.map(({ href, label, icon }) => {
          const active = pathname === href || (href !== "/workspace" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                active
                  ? "bg-indigo-50 text-indigo-700 shadow-sm shadow-indigo-500/5"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <NavIcon name={icon} />
              {label}
            </Link>
          );
        })}
      </nav>

      {user ? (
        <div className="border-t border-slate-100 p-3">
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2.5">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-xs font-bold text-white">
              {initials(user.displayName)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-900">{user.displayName}</p>
              <p className="truncate text-xs text-slate-500">{user.email ?? "Signed in"}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="mt-2 w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-600 transition hover:bg-rose-50 hover:text-rose-600"
          >
            Sign out
          </button>
        </div>
      ) : null}
    </aside>
  );
});
