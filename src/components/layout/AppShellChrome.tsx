"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { AppShellHeader } from "../AppShellHeader";
import { AppSidebar } from "./AppSidebar";
import { PageTransition } from "./PageTransition";
import { useAppSelector } from "../../store/hooks";

export function AppShellChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "/";
  const user = useAppSelector((s) => s.auth.user);
  const isBuilder = pathname.startsWith("/builder");
  const isHome = pathname === "/home";
  const isPublicResponder = pathname.startsWith("/r/");
  const showSidebar = Boolean(user) && !isBuilder && !isHome && !isPublicResponder;

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
