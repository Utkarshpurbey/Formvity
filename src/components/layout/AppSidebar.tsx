"use client";

import { memo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { AppLink } from "../ui/AppLink";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { logoutUser } from "../../store/slices/authSlice";
import { stripAppBasePath } from "../../utils/appBasePath";

const nav = [
  { href: "/workspaces", label: "Workspaces", icon: "grid" },
  { href: "/templates", label: "Templates", icon: "spark" },
  { href: "/builder", label: "Builder", icon: "layout" },
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

function isNavActive(routePath: string, href: string): boolean {
  if (href === "/workspaces") {
    return routePath === "/workspaces" || routePath.startsWith("/workspaces/") || routePath === "/workspace";
  }
  if (href === "/builder") {
    return routePath === "/builder" || routePath.startsWith("/builder/");
  }
  return routePath === href || routePath.startsWith(`${href}/`);
}

type AppSidebarProps = {
  collapsed: boolean;
  onToggle: () => void;
};

export const AppSidebar = memo(function AppSidebar({ collapsed, onToggle }: AppSidebarProps) {
  const pathname = usePathname() ?? "/";
  const routePath = stripAppBasePath(pathname);
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);

  const handleLogout = () => {
    dispatch(logoutUser());
    toast.info("Signed out.");
    router.push("/home");
  };

  return (
    <aside
      className={`relative hidden shrink-0 flex-col border-r border-slate-200/80 bg-white transition-[width] duration-200 ease-in-out lg:flex ${
        collapsed ? "w-16" : "w-[240px]"
      }`}
    >
      <div
        className={`flex h-14 shrink-0 items-center border-b border-slate-100 ${
          collapsed ? "justify-center px-2" : "gap-2.5 px-5"
        }`}
      >
        <AppLink
          href="/workspaces"
          title="Formvity"
          className={`flex items-center rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-violet-500 ${
            collapsed ? "justify-center" : "gap-2.5"
          }`}
        >
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-md shadow-indigo-500/25">
            <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2Z" />
            </svg>
          </div>
          {!collapsed ? <span className="text-sm font-bold tracking-tight text-slate-900">Formvity</span> : null}
        </AppLink>
      </div>

      <nav className={`flex-1 space-y-0.5 ${collapsed ? "p-2" : "p-3"}`} aria-label="Main navigation">
        {nav.map(({ href, label, icon }) => {
          const active = isNavActive(routePath, href);
          return (
            <AppLink
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              aria-label={collapsed ? label : undefined}
              className={`flex items-center rounded-xl text-sm font-medium transition-all duration-200 ${
                collapsed ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-2.5"
              } ${
                active
                  ? "bg-violet-50 text-violet-700 shadow-sm shadow-violet-500/5"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <NavIcon name={icon} />
              {!collapsed ? label : null}
            </AppLink>
          );
        })}
      </nav>

      {user ? (
        <div className={`border-t border-slate-100 ${collapsed ? "p-2" : "p-3"}`}>
          <div
            className={`flex items-center rounded-xl bg-slate-50 ${
              collapsed ? "justify-center px-2 py-2" : "gap-3 px-3 py-2.5"
            }`}
            title={collapsed ? user.displayName : undefined}
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 text-xs font-bold text-white">
              {initials(user.displayName)}
            </span>
            {!collapsed ? (
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-900">{user.displayName}</p>
                <p className="truncate text-xs text-slate-500">{user.email ?? "Signed in"}</p>
              </div>
            ) : null}
          </div>
          <button
            type="button"
            onClick={handleLogout}
            title={collapsed ? "Sign out" : undefined}
            className={`mt-2 w-full rounded-lg text-sm font-medium text-slate-600 transition hover:bg-rose-50 hover:text-rose-600 ${
              collapsed ? "flex items-center justify-center px-2 py-2" : "px-3 py-2 text-left"
            }`}
          >
            {collapsed ? (
              <svg className="size-[18px]" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
              </svg>
            ) : (
              "Sign out"
            )}
          </button>
        </div>
      ) : null}

      <button
        type="button"
        onClick={onToggle}
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        aria-expanded={!collapsed}
        className="absolute -right-3 top-[4.25rem] z-10 flex size-6 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:bg-violet-50 hover:text-violet-700"
      >
        <svg
          className={`size-3.5 transition-transform duration-200 ${collapsed ? "" : "rotate-180"}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
          aria-hidden
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m15 18-6-6 6-6" />
        </svg>
      </button>
    </aside>
  );
});
