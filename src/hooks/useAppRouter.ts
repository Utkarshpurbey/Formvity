"use client";

import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { navigateApp, replaceApp } from "../utils/appNavigate";

/**
 * Drop-in router for GitHub Pages static export.
 * push/replace use full page loads for dynamic UUID/slug routes so Next.js
 * does not fetch missing RSC *.txt payloads (e.g. workspaces/{uuid}/settings.txt).
 */
export function useAppRouter() {
  const router = useRouter();
  return useMemo(
    () => ({
      ...router,
      push: (path: string) => navigateApp(path, router),
      replace: (path: string) => replaceApp(path, router),
    }),
    [router],
  );
}
