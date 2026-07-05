"use client";

import { Suspense, useMemo } from "react";
import type { FormDef } from "../../../src/components/page-def/builder/pageDef";
import { FormRuntime } from "../../../src/components/page-def/runtime/FormRuntime";
import { PageLoader } from "../../../src/components/ui/index";
import { useFormDef } from "../../../src/hooks/useFormDef";
import { normalizeFormDef } from "../../../src/lib/normalizeFormDef";

type PublicFormPageClientProps = {
  slug: string;
  initialFormDef?: FormDef | null;
  initialError?: string | null;
};

function PublicFormPageInner({ slug, initialFormDef, initialError }: PublicFormPageClientProps) {
  const hasServerData = initialFormDef != null || initialError != null;

  const loadSource = useMemo(
    () => (!hasServerData && slug ? ({ type: "public" as const, slug }) : null),
    [slug, hasServerData],
  );

  const clientLoad = useFormDef(loadSource);

  const pageDef = hasServerData ? initialFormDef : clientLoad.pageDef;
  const isLoading = !hasServerData && clientLoad.isLoading;
  const isError = hasServerData ? Boolean(initialError) || !pageDef : clientLoad.isError;
  const loadError = hasServerData ? initialError : clientLoad.error;
  const formDef = useMemo(() => (pageDef ? normalizeFormDef(pageDef) : null), [pageDef]);

  if (!slug) {
    return (
      <div className="flex min-h-dvh flex-1 items-center justify-center p-6">
        <p className="text-sm text-slate-600">This link is not valid. Please check the URL and try again.</p>
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
          <h1 className="text-xl font-bold text-slate-900">This form is unavailable</h1>
          <p className="mt-2 text-sm text-slate-600">
            {loadError ?? "This form may have been taken offline or the link may be incorrect. Please contact the form owner."}
          </p>
        </div>
      </div>
    );
  }

  return <FormRuntime key={slug} formDef={formDef} slug={slug} standalone />;
}

export default function PublicFormPageClient(props: PublicFormPageClientProps) {
  return (
    <Suspense fallback={<PageLoader message="Loading…" fullScreen />}>
      <PublicFormPageInner {...props} />
    </Suspense>
  );
}
