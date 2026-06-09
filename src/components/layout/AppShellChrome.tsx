"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AppShellHeader } from "../AppShellHeader";
import { AppSidebar } from "./AppSidebar";
import { PageLoader } from "../ui/index";
import { stripAppBasePath } from "../../utils/appBasePath";
import { useAppSelector } from "../../store/hooks";

/** Routes that stay full-width without the maker sidebar (marketing / public). */
function isMarketingRoute(path: string): boolean {
  return path === "/" || path === "/home";
}

const SIDEBAR_COLLAPSED_KEY = "formvity-sidebar-collapsed";

export function AppShellChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "/";
  const routePath = stripAppBasePath(pathname);
  const { user, ready } = useAppSelector((s) => s.auth);
  const isPublicResponder = routePath.startsWith("/r/");
  const showSidebar = Boolean(user) && !isMarketingRoute(routePath) && !isPublicResponder;
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    try {
      setSidebarCollapsed(localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "true");
    } catch {
      /* ignore */
    }
  }, []);

  const toggleSidebar = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  if (!ready) {
    return (
      <div className="flex min-h-screen flex-col bg-[#f8fafc]">
        <PageLoader message="Connecting to your account…" className="flex-1" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      {showSidebar ? <AppSidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} /> : null}
      <div className="flex min-w-0 flex-1 flex-col">
        {!isPublicResponder ? (
          showSidebar ? (
            <div className="lg:hidden">
              <AppShellHeader />
            </div>
          ) : (
            <AppShellHeader />
          )
        ) : null}
        <div key={pathname} className="page-enter flex min-h-0 flex-1 flex-col">
          {children}
        </div>
      </div>
    </div>
  );
}
