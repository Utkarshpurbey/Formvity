"use client";

import { useLayoutEffect, useRef } from "react";
import { restoreDeepLinkUrl } from "../utils/routeParams";

/**
 * GitHub Pages 404 → *.html shell redirect stores the real path; restore it here.
 * Uses history.replaceState only — router.replace would fetch missing RSC *.txt files.
 */
export function DeepLinkRestore() {
  const synced = useRef(false);

  useLayoutEffect(() => {
    if (synced.current) return;
    synced.current = true;
    restoreDeepLinkUrl();
  }, []);

  return null;
}
