"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { FormRuntime } from "../../../src/components/page-def/runtime/FormRuntime";
import { PageLoader } from "../../../src/components/ui/index";
import { useFormDef } from "../../../src/hooks/useFormDef";
import { normalizeFormDef } from "../../../src/lib/normalizeFormDef";
import { getPublicFormSlugFromLocation } from "../../../src/utils/publicUrl";

function resolveSlug(paramSlug: string): string {
  const fromUrl = getPublicFormSlugFromLocation();
  if (fromUrl) return fromUrl;
  if (paramSlug && paramSlug !== "_") return paramSlug;
  return "";
}

function PublicFormPageInner() {
  const params = useParams();
  const paramSlug = typeof params.slug === "string" ? params.slug : "";
  const [slug, setSlug] = useState(() => resolveSlug(paramSlug));

  useEffect(() => {
    setSlug(resolveSlug(paramSlug));
  }, [paramSlug]);

  const loadSource = useMemo(
    () => (slug ? ({ type: "public" as const, slug }) : null),
    [slug],
  );

  const { pageDef, isLoading, isError, error: loadError } = useFormDef(loadSource);
  const formDef = useMemo(() => (pageDef ? normalizeFormDef(pageDef) : null), [pageDef]);

  if (!slug) {
    return (
      <div className="flex min-h-dvh flex-1 items-center justify-center p-6">
        <p className="text-sm text-slate-600">Invalid form link.</p>
      </div>
    );
  }

  if (isLoading) {
    return <PageLoader message="Loading form…" fullScreen />;
  }

  if (isError || !formDef) {
    return (
      <div className="flex min-h-dvh flex-1 items-center justify-center p-6">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-xl font-bold text-slate-900">This form isn&apos;t available</h1>
          <p className="mt-2 text-sm text-slate-600">
            {loadError ?? "The form may be unpublished or the link may be incorrect."}
          </p>
        </div>
      </div>
    );
  }

  return <FormRuntime key={slug} formDef={formDef} slug={slug} standalone />;
}

export default function PublicFormPageClient() {
  return (
    <Suspense fallback={<PageLoader message="Loading…" fullScreen />}>
      <PublicFormPageInner />
    </Suspense>
  );
}
