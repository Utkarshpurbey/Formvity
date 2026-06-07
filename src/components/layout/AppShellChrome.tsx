"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { AppShellHeader } from "../AppShellHeader";
import { AppSidebar } from "./AppSidebar";
import { PageTransition } from "./PageTransition";
import { PageLoader } from "../ui/PageLoader";
import { stripAppBasePath } from "../../utils/appBasePath";
import { useAppSelector } from "../../store/hooks";

/** Routes that stay full-width without the maker sidebar (marketing / public). */
function isMarketingRoute(path: string): boolean {
  return path === "/" || path === "/home";
}

export function AppShellChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "/";
  const routePath = stripAppBasePath(pathname);
  const { user, ready } = useAppSelector((s) => s.auth);
  const isPublicResponder = routePath.startsWith("/r/");
  const showSidebar = Boolean(user) && !isMarketingRoute(routePath) && !isPublicResponder;

  if (!ready) {
    return (
      <div className="flex min-h-screen flex-col bg-[#f8fafc]">
        <PageLoader message="Connecting to your account…" className="flex-1" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      {showSidebar ? <AppSidebar /> : null}
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
        <PageTransition>{children}</PageTransition>
      </div>
    </div>
  );
}
