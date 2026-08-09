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
  return path === "/" || path === "/welcome" || path.startsWith("/welcome/");
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

  const isBuilder = routePath.startsWith("/builder");

  return (
    <div className={`flex bg-[#f8fafc] ${isBuilder ? "h-screen overflow-hidden" : "min-h-screen"}`}>
      {showSidebar ? <AppSidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} /> : null}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {!isPublicResponder ? (
          showSidebar ? (
            <div className="lg:hidden shrink-0">
              <AppShellHeader />
            </div>
          ) : (
            <div className="shrink-0">
              <AppShellHeader />
            </div>
          )
        ) : null}
        <div className={`page-enter flex min-h-0 flex-1 flex-col ${isBuilder ? "overflow-hidden" : ""}`}>
          {children}
        </div>
      </div>
    </div>
  );
}
