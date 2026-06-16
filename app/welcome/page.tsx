"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PageLoader } from "@/src/components/ui/index";

function WelcomeRedirectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const qs = searchParams.toString();
    router.replace(qs ? `/invite?${qs}` : "/invite");
  }, [router, searchParams]);

  return <PageLoader message="Redirecting…" className="min-h-screen" />;
}

/** Legacy alias — backend may still emit /welcome links; redirect preserves query string. */
export default function WelcomeRedirectPage() {
  return (
    <Suspense fallback={<PageLoader message="Redirecting…" className="min-h-screen" />}>
      <WelcomeRedirectContent />
    </Suspense>
  );
}
