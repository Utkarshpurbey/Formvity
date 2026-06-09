"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Provider } from "react-redux";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthBootstrap } from "./AuthBootstrap";
import { NavigationProgress } from "./layout/NavigationProgress";
import { AppShellChrome } from "./layout/AppShellChrome";
import { stripAppBasePath } from "../utils/appBasePath";
import { store } from "../store/store";

function isAuthRoute(path: string): boolean {
  return path === "/login" || path === "/register";
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
      <AuthBootstrap />
      <NavigationProgress />
      <AppShellWrapper>{children}</AppShellWrapper>
      <ToastContainer position="bottom-right" theme="colored" autoClose={3200} hideProgressBar />
    </Provider>
  );
}
