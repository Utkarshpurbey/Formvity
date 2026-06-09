"use client";

import { useRouter } from "next/navigation";
import { useLayoutEffect, useRef } from "react";
import { restoreDeepLinkUrl } from "../utils/routeParams";

/**
 * GitHub Pages 404 → *.html shell redirect stores the real path; restore it here.
 * Runs in layout effect so ids/API calls see the real URL before auth and data effects.
 */
export function DeepLinkRestore() {
  const router = useRouter();
  const synced = useRef(false);

  useLayoutEffect(() => {
    if (synced.current) return;
    synced.current = true;

    const intended = restoreDeepLinkUrl();
    if (intended) router.replace(intended);
  }, [router]);

  return null;
}
