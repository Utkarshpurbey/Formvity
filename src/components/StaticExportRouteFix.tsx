"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { stripAppBasePath } from "../utils/appBasePath";

/**
 * GitHub Pages serves 404.html for unknown paths. When that file is the app shell,
 * sync the Next router to the browser URL so /workspaces/{uuid} hydrates correctly.
 */
export function StaticExportRouteFix() {
  const pathname = usePathname() ?? "/";
  const router = useRouter();

  useEffect(() => {
    const browserPath = stripAppBasePath(window.location.pathname);
    const routerPath = stripAppBasePath(pathname);
    if (browserPath === routerPath) return;
    router.replace(`${browserPath}${window.location.search}${window.location.hash}`);
  }, [pathname, router]);

  return null;
}
