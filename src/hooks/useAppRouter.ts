"use client";

import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { navigateApp, replaceApp } from "../utils/appNavigate";

/**
 * Drop-in router for GitHub Pages static export.
 * push/replace route dynamic UUID/slug paths through `_` shells (see appNavigate.ts).
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
