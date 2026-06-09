"use client";

import { usePathname } from "next/navigation";
import { useLayoutEffect } from "react";
import { restoreDeepLinkUrl } from "../utils/routeParams";

/**
 * Restores the real URL after GitHub Pages 404 redirect or in-app shell navigation.
 * Uses history.replaceState only — never router.replace (avoids missing RSC *.txt fetches).
 */
export function DeepLinkRestore() {
  const pathname = usePathname();

  useLayoutEffect(() => {
    restoreDeepLinkUrl();
  }, [pathname]);

  return null;
}
