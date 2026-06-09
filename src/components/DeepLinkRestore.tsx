"use client";

import { useLayoutEffect, useRef } from "react";
import { restoreDeepLinkUrl } from "../utils/routeParams";

/**
 * One-time restore for direct links / bookmarks (GitHub Pages 404 → shell redirect).
 * Not used for in-app navigation — that uses normal router.push with real paths.
 */
export function DeepLinkRestore() {
  const done = useRef(false);

  useLayoutEffect(() => {
    if (done.current) return;
    done.current = true;
    restoreDeepLinkUrl();
  }, []);

  return null;
}
