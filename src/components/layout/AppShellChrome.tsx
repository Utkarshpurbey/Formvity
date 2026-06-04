"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { AppShellHeader } from "../AppShellHeader";
import { AppSidebar } from "./AppSidebar";
import { PageTransition } from "./PageTransition";
import { PageLoader } from "../ui/PageLoader";
import { isPublicAuthPath } from "../../lib/auth/publicPaths";
import { useAppSelector } from "../../store/hooks";

export function AppShellChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "/";
  const { user, ready } = useAppSelector((s) => s.auth);
  const isBuilder = pathname.startsWith("/builder");
  const isHome = pathname === "/home";
  const isPublicResponder = pathname.startsWith("/r/");
  const showSidebar = Boolean(user) && !isBuilder && !isHome && !isPublicResponder;
  const authPending = !ready && !isPublicAuthPath(pathname);

  if (authPending) {
    return (
      <div className="flex min-h-screen flex-col bg-[#f8fafc]">
        <AppShellHeader />
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
