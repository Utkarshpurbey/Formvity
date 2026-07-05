"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Provider } from "react-redux";
import { AppToastContainer } from "./ui/AppToast";
import { AuthBootstrap } from "./AuthBootstrap";
import { NavigationProgress } from "./layout/NavigationProgress";
import { AppShellChrome } from "./layout/AppShellChrome";
import { GoogleAnalyticsPageView } from "./analytics/GoogleAnalyticsPageView";
import { stripAppBasePath } from "../utils/appBasePath";
import { store } from "../store/store";

function isAuthRoute(path: string): boolean {
  return path === "/login" || path === "/register" || path === "/invite" || path.startsWith("/invite/");
}

function AppShellWrapper({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "/";
  const routePath = stripAppBasePath(pathname);
  if (isAuthRoute(routePath)) return <>{children}</>;
  return <AppShellChrome>{children}</AppShellChrome>;
}

export function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <Provider store={store}>
      <GoogleAnalyticsPageView />
      <AuthBootstrap />
      <NavigationProgress />
      <AppShellWrapper>{children}</AppShellWrapper>
      <AppToastContainer />
    </Provider>
  );
}
