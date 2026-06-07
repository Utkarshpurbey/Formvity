"use client";

import type { FormLifecycle } from "../../lib/formLifecycle";
import { lifecycleLabel } from "../../lib/formLifecycle";

const KIND_CLASS: Record<FormLifecycle["kind"], string> = {
  live: "bg-emerald-50 text-emerald-700 ring-emerald-600/15",
  never_published: "bg-slate-100 text-slate-600 ring-slate-500/10",
  unpublished: "bg-amber-50 text-amber-800 ring-amber-600/15",
  archived: "bg-slate-100 text-slate-500 ring-slate-400/10",
  not_found: "bg-rose-50 text-rose-700 ring-rose-600/15",
};

type FormLifecycleBadgeProps = {
  lifecycle: FormLifecycle;
  size?: "sm" | "md";
};

export function FormLifecycleBadge({ lifecycle, size = "sm" }: FormLifecycleBadgeProps) {
  const label = lifecycleLabel(lifecycle);
  const pad = size === "md" ? "px-3 py-1 text-xs" : "px-2.5 py-0.5 text-xs";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold ring-1 ring-inset ${KIND_CLASS[lifecycle.kind]} ${pad}`}
    >
      {lifecycle.kind === "live" ? (
        <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" aria-hidden />
      ) : null}
      {label}
    </span>
  );
}
