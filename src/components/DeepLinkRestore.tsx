"use client";

import { useRouter } from "next/navigation";
import { useLayoutEffect, useRef } from "react";
import { restoreDeepLinkUrl } from "../utils/routeParams";

/**
 * GitHub Pages 404 → *.html shell redirect stores the real path; restore it here.
 * useLayoutEffect runs before auth/data effects so API calls get the real ids.
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
