"use client";

import { Suspense, useMemo } from "react";
import { useParams } from "next/navigation";
import { MultiPageForm } from "../../../src/components/page-def/runtime/MultiPageForm";
import { useFormDef } from "../../../src/hooks/useFormDef";
import { normalizeFormDef } from "../../../src/lib/normalizeFormDef";

function PublicFormPageInner() {
  const params = useParams();
  const slug = typeof params.slug === "string" ? params.slug : "";

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
    return (
      <div className="flex min-h-dvh flex-1 items-center justify-center">
        <p className="text-sm font-medium text-slate-600">Loading form…</p>
      </div>
    );
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

  return <MultiPageForm key={slug} formDef={formDef} standalone />;
}

export default function PublicFormPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh flex-1 items-center justify-center">
          <p className="text-sm font-medium text-slate-600">Loading…</p>
        </div>
      }
    >
      <PublicFormPageInner />
    </Suspense>
  );
}
