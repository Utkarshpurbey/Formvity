"use client";

import { memo, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { notifyInfo } from "@/src/components/ui/AppToast";
import { AppLink } from "../ui/AppLink";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { logoutUser } from "../../store/slices/authSlice";
import { fetchMembers } from "../../store/slices/workspaceSlice";
import { stripAppBasePath } from "../../utils/appBasePath";
import { parseWorkspaceIdFromPath } from "../../lib/workspaceUtils";
import { WorkspaceSwitcher } from "../workspace/WorkspaceSwitcher";
import { useWorkspaceRole, workspaceCan } from "../workspace/index";
import {
  SETTINGS_SECTIONS,
  parseSettingsSection,
  settingsPath,
  type SettingsSection,
} from "../workspace/settings";

const globalNav = [
  { href: "/templates", label: "Templates", icon: "spark" },
  { href: "/builder", label: "Builder", icon: "layout" },
];

function workspaceNav(workspaceId: string, canDelete: boolean) {
  const base = `/workspaces/${workspaceId}`;
  const settingsItems = SETTINGS_SECTIONS.filter((s) => !s.adminOnly || canDelete).map((s) => ({
    href: settingsPath(workspaceId, s.id),
    label: s.label,
    section: s.id,
    danger: s.danger,
  }));
  return {
    overview: { href: base, label: "Overview", icon: "home" as const },
    settings: settingsItems,
  };
}

function NavIcon({ name }: { name: string }) {
  const cls = "size-[18px] shrink-0";
  if (name === "home")
    return (
      <svg className={cls} fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
      </svg>
    );
  if (name === "settings")
    return (
      <svg className={cls} fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
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

function isNavActive(routePath: string, href: string, opts?: { exact?: boolean; matchPrefix?: string }): boolean {
  if (opts?.matchPrefix) {
    return routePath === opts.matchPrefix || routePath.startsWith(`${opts.matchPrefix}/`);
  }
  if (opts?.exact) return routePath === href;
  return routePath === href || routePath.startsWith(`${href}/`);
}

type AppSidebarProps = {
  collapsed: boolean;
  onToggle: () => void;
};

export const AppSidebar = memo(function AppSidebar({ collapsed, onToggle }: AppSidebarProps) {
  const childLinkClass = (active: boolean, danger?: boolean) =>
    `flex items-center rounded-lg py-2 pl-3 pr-3 text-xs font-medium transition-all duration-200 ${
      active
        ? danger
          ? "bg-rose-50 text-rose-800"
          : "bg-violet-50 text-violet-700"
        : danger
          ? "text-rose-600 hover:bg-rose-50/60 hover:text-rose-800"
          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
    }`;

  const pathname = usePathname() ?? "/";
  const routePath = stripAppBasePath(pathname);
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const workspaces = useAppSelector((s) => s.workspace.list);
  const activeId = useAppSelector((s) => s.workspace.activeId);

  const workspaceIdFromRoute = parseWorkspaceIdFromPath(routePath);
  const contextWorkspaceId = workspaceIdFromRoute ?? activeId;
  const contextWorkspace = workspaces.find((w) => w.workSpaceId === contextWorkspaceId);
  const onWorkspaceHub = routePath === "/workspaces";
  const showSwitcher = Boolean(contextWorkspaceId && contextWorkspace);
  const showWorkspaceNav = Boolean(contextWorkspaceId && contextWorkspace && !onWorkspaceHub);
  const workspaceName = contextWorkspace?.workSpaceName ?? "Workspace";
  const workspaceRole = useWorkspaceRole(contextWorkspaceId ?? "");
  const canDeleteWorkspace = workspaceCan(workspaceRole, "workspace.delete");
  const onSettingsPage = Boolean(contextWorkspaceId && routePath === `/workspaces/${contextWorkspaceId}/settings`);
  const activeSettingsSection: SettingsSection | null = onSettingsPage
    ? parseSettingsSection(searchParams.get("section"))
    : null;
  const nav = contextWorkspaceId ? workspaceNav(contextWorkspaceId, canDeleteWorkspace) : null;
  const [settingsExpanded, setSettingsExpanded] = useState(false);

  useEffect(() => {
    if (contextWorkspaceId) dispatch(fetchMembers(contextWorkspaceId));
  }, [contextWorkspaceId, dispatch]);

  useEffect(() => {
    setSettingsExpanded(onSettingsPage);
  }, [onSettingsPage]);

  const handleSettingsToggle = () => {
    const next = !settingsExpanded;
    setSettingsExpanded(next);
    if (next && !onSettingsPage && contextWorkspaceId) {
      router.push(settingsPath(contextWorkspaceId, "general"));
    }
  };

  const handleLogout = () => {
    dispatch(logoutUser());
    notifyInfo("Signed out.");
    router.push("/");
  };

  const linkClass = (active: boolean, collapsedLink: boolean) =>
    `flex items-center rounded-xl text-[13px] font-medium transition-all duration-200 ${
      collapsedLink ? "justify-center px-2 py-2" : "gap-2.5 px-3 py-2"
    } ${
      active
        ? "bg-violet-50 text-violet-700 shadow-sm shadow-violet-500/5"
        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
    }`;

  return (
    <aside
      className={`relative hidden shrink-0 flex-col border-r border-slate-200/80 bg-white transition-[width] duration-200 ease-in-out lg:flex ${
        collapsed ? "w-16" : "w-[260px]"
      }`}
    >
      <div
        className={`flex h-14 shrink-0 items-center border-b border-slate-100 ${
          collapsed ? "justify-center px-2" : "gap-2.5 px-4"
        }`}
      >
        <AppLink
          href={contextWorkspaceId ? `/workspaces/${contextWorkspaceId}` : "/workspaces"}
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

      <div className={`shrink-0 border-b border-slate-100 ${collapsed ? "p-2" : "px-3 py-3"}`}>
        {showSwitcher ? (
          <WorkspaceSwitcher
            activeWorkspaceId={contextWorkspaceId}
            activeWorkspaceName={workspaceName}
            collapsed={collapsed}
          />
        ) : (
          <AppLink
            href="/workspaces"
            title="Workspaces"
            className={`flex items-center rounded-xl border border-dashed border-slate-300 text-sm font-medium text-slate-600 transition hover:border-violet-300 hover:bg-violet-50/50 hover:text-violet-700 ${
              collapsed ? "justify-center p-2" : "gap-2.5 px-3 py-2.5"
            }`}
          >
            <svg className="size-[18px] shrink-0" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            {!collapsed ? <span>Select workspace</span> : null}
          </AppLink>
        )}
      </div>

      <nav className={`flex-1 overflow-y-auto ${collapsed ? "p-2" : "p-3"}`} aria-label="Main navigation">
        {showWorkspaceNav && contextWorkspaceId && nav ? (
          <div className="space-y-1">
            {!collapsed ? (
              <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400">Workspace</p>
            ) : null}
            <AppLink
              href={nav.overview.href}
              title={collapsed ? nav.overview.label : undefined}
              className={linkClass(routePath === nav.overview.href, collapsed)}
            >
              <NavIcon name={nav.overview.icon} />
              {!collapsed ? nav.overview.label : null}
            </AppLink>

            {!collapsed ? (
              <button
                type="button"
                onClick={handleSettingsToggle}
                aria-expanded={settingsExpanded}
                className={`${linkClass(onSettingsPage, false)} mt-2 w-full`}
              >
                <NavIcon name="settings" />
                <span className="flex-1 text-left">Settings</span>
                <svg
                  className={`size-3.5 shrink-0 text-slate-400 transition-transform ${settingsExpanded ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  aria-hidden
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                </svg>
              </button>
            ) : null}

            {collapsed ? (
              <AppLink
                href={settingsPath(contextWorkspaceId, "general")}
                title="Settings"
                className={linkClass(onSettingsPage, collapsed)}
              >
                <NavIcon name="settings" />
              </AppLink>
            ) : settingsExpanded ? (
              <div className="ml-3 mt-1 space-y-0.5 border-l border-slate-200/90 pl-2 pb-1">
                {nav.settings.map((item) => {
                  const active = onSettingsPage && activeSettingsSection === item.section;
                  return (
                    <AppLink key={item.section} href={item.href} className={childLinkClass(active, item.danger)}>
                      {item.label}
                    </AppLink>
                  );
                })}
              </div>
            ) : null}
          </div>
        ) : null}

        <div className={`space-y-0.5 ${showWorkspaceNav ? "mt-6" : ""}`}>
          {!collapsed ? (
            <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              {showWorkspaceNav ? "Tools" : "Navigation"}
            </p>
          ) : null}
          {!showSwitcher ? (
            <AppLink
              href="/workspaces"
              title={collapsed ? "Workspaces" : undefined}
              className={linkClass(routePath === "/workspaces" || routePath.startsWith("/workspaces/"), collapsed)}
            >
              <NavIcon name="home" />
              {!collapsed ? "Workspaces" : null}
            </AppLink>
          ) : null}
          {globalNav.map(({ href, label, icon }) => {
            const active = isNavActive(routePath, href);
            return (
              <AppLink
                key={href}
                href={href}
                title={collapsed ? label : undefined}
                className={linkClass(active, collapsed)}
              >
                <NavIcon name={icon} />
                {!collapsed ? label : null}
              </AppLink>
            );
          })}
        </div>
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
