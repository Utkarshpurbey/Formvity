"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AppShellHeader } from "../AppShellHeader";
import { AppSidebar } from "./AppSidebar";
import { stripAppBasePath } from "../../utils/appBasePath";
import { useAppSelector } from "../../store/hooks";

/** Routes that stay full-width without the maker sidebar (marketing / public). */
function isMarketingRoute(path: string): boolean {
  return path === "/" || path === "/home" || path === "/invite" || path.startsWith("/invite/");
}

const SIDEBAR_COLLAPSED_KEY = "formvity-sidebar-collapsed";

export function AppShellChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "/";
  const routePath = stripAppBasePath(pathname);
  const user = useAppSelector((s) => s.auth.user);
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
        <div className="page-enter flex min-h-0 flex-1 flex-col">
          {children}
        </div>
      </div>
    </div>
  );
}
