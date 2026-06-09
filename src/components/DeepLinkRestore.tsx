"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { stripAppBasePath } from "../utils/appBasePath";
import { consumeIntendedPath } from "../utils/routeParams";

/**
 * GitHub Pages 404 → *.html shell redirect stores the real path; restore it here.
 * Uses client navigation only (never index.html, so no redirect to /home).
 */
export function DeepLinkRestore() {
  const router = useRouter();
  const restored = useRef(false);

  useEffect(() => {
    if (restored.current) return;
    const intended = consumeIntendedPath();
    if (!intended) return;

    const intendedPath = intended.split(/[?#]/)[0] ?? intended;
    const current = stripAppBasePath(window.location.pathname);
    if (current === intendedPath || current === intended) {
      restored.current = true;
      return;
    }

    restored.current = true;
    router.replace(intended);
  }, [router]);

  return null;
}
