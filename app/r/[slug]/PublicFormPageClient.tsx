"use client";

import { Suspense } from "react";
import type { FormDef } from "../../../src/components/page-def/builder/pageDef";
import { FormRuntime } from "../../../src/components/page-def/runtime/FormRuntime";
import { PageLoader } from "../../../src/components/ui/index";
import { useFormDef } from "../../../src/hooks/useFormDef";
import { normalizeFormDef } from "../../../src/lib/normalizeFormDef";

type Props = {
  slug: string;
  initialFormDef?: FormDef | null;
  initialError?: string | null;
};

function PublicFormPageInner({ slug, initialFormDef, initialError }: Props) {
  const prefetched = initialFormDef != null || initialError != null;
  const clientLoad = useFormDef(
    !prefetched && slug ? { type: "public", slug } : null,
  );

  const pageDef = prefetched ? initialFormDef : clientLoad.pageDef;
  const loading = !prefetched && clientLoad.isLoading;
  const error = prefetched ? initialError || (!pageDef ? "Form unavailable" : null) : clientLoad.error;
  const formDef = pageDef ? normalizeFormDef(pageDef) : null;

  if (!slug) {
    return (
      <div className="flex min-h-dvh flex-1 items-center justify-center p-6">
        <p className="text-sm text-slate-600">This link is not valid. Please check the URL and try again.</p>
      </div>
    );
  }

  if (loading) {
    return <PageLoader message="Loading form…" fullScreen />;
  }

  if (error || !formDef) {
    return (
      <div className="flex min-h-dvh flex-1 items-center justify-center p-6">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-xl font-bold text-slate-900">This form is unavailable</h1>
          <p className="mt-2 text-sm text-slate-600">
            {error ?? "This form may have been taken offline or the link may be incorrect."}
          </p>
        </div>
      </div>
    );
  }

  return <FormRuntime key={slug} formDef={formDef} slug={slug} standalone />;
}

export default function PublicFormPageClient(props: Props) {
  return (
    <Suspense fallback={<PageLoader message="Loading…" fullScreen />}>
      <PublicFormPageInner {...props} />
    </Suspense>
  );
}
