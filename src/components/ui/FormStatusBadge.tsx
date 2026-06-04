import type { FormStatus } from "../../api/types";

const STATUS_CLASS: Record<FormStatus, string> = {
  PUBLISHED: "bg-emerald-50 text-emerald-700 ring-emerald-600/10",
  DRAFT: "bg-amber-50 text-amber-800 ring-amber-600/10",
  EXPIRED: "bg-slate-100 text-slate-600 ring-slate-500/10",
  ARCHIVED: "bg-slate-100 text-slate-600 ring-slate-500/10",
};

export function formStatusClass(status: FormStatus): string {
  return STATUS_CLASS[status] ?? STATUS_CLASS.ARCHIVED;
}

type FormStatusBadgeProps = {
  status: FormStatus;
  showLiveDot?: boolean;
};

export function FormStatusBadge({ status, showLiveDot }: FormStatusBadgeProps) {
  const isPublished = status === "PUBLISHED";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${formStatusClass(status)}`}
    >
      {showLiveDot && isPublished ? <span className="size-1.5 rounded-full bg-emerald-500" aria-hidden /> : null}
      {status}
    </span>
  );
}
