"use client";

import { Suspense, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { trackPageView } from "../../lib/googleAnalytics";
import { stripAppBasePath } from "../../utils/appBasePath";

function GoogleAnalyticsPageViewInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!pathname) return;
    const path = stripAppBasePath(pathname);
    const query = searchParams.toString();
    trackPageView(query ? `${path}?${query}` : path);
  }, [pathname, searchParams]);

  return null;
}

export function GoogleAnalyticsPageView() {
  return (
    <Suspense fallback={null}>
      <GoogleAnalyticsPageViewInner />
    </Suspense>
  );
}
