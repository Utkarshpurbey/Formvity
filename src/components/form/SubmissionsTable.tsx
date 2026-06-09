"use client";

import { useMemo, useState } from "react";
import type { SubmissionRow } from "../../api/types";
import { SkeletonRows } from "../ui/index";

type SubmissionsTableProps = {
  rows: SubmissionRow[];
  loading?: boolean;
  page: number;
  totalPages: number;
  totalElements: number;
  pageSize: number;
  onPageChange: (page: number) => void;
};

function respondentLabel(respondent: Record<string, unknown>): string {
  const name = respondent.fullName ?? respondent.name ?? respondent.displayName;
  const email = respondent.email;
  const nameStr = name != null ? String(name) : null;
  const emailStr = email != null ? String(email) : null;
  if (nameStr && emailStr) return `${nameStr} · ${emailStr}`;
  return nameStr ?? emailStr ?? "Anonymous";
}

function formatAnswerValue(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (Array.isArray(value)) return value.join(", ");
  return String(value);
}

function SubmissionDetail({ row }: { row: SubmissionRow }) {
  const answerEntries = Object.entries(row.answers);
  const respondentEntries = Object.entries(row.respondent);

  return (
    <div className="grid gap-4 border-t border-slate-100 bg-slate-50/70 px-6 py-4 sm:grid-cols-2">
      {respondentEntries.length > 0 ? (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Respondent</p>
          <dl className="mt-2 space-y-1.5">
            {respondentEntries.map(([key, val]) => (
              <div key={key} className="flex gap-2 text-sm">
                <dt className="w-24 shrink-0 text-slate-500">{key}</dt>
                <dd className="min-w-0 break-words text-slate-800">{formatAnswerValue(val)}</dd>
              </div>
            ))}
          </dl>
        </div>
      ) : null}
      <div className={respondentEntries.length > 0 ? "" : "sm:col-span-2"}>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Answers</p>
        <dl className="mt-2 space-y-1.5">
          {answerEntries.length === 0 ? (
            <p className="text-sm text-slate-500">No answers recorded.</p>
          ) : (
            answerEntries.map(([key, val]) => (
              <div key={key} className="flex gap-2 text-sm">
                <dt className="w-28 shrink-0 truncate font-mono text-xs text-slate-500">{key}</dt>
                <dd className="min-w-0 break-words text-slate-800">{formatAnswerValue(val)}</dd>
              </div>
            ))
          )}
        </dl>
      </div>
    </div>
  );
}

export function SubmissionsTable({
  rows,
  loading = false,
  page,
  totalPages,
  totalElements,
  pageSize,
  onPageChange,
}: SubmissionsTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const pageLabel = useMemo(() => {
    if (totalElements === 0) return "0 responses";
    const start = page * pageSize + 1;
    const end = Math.min(totalElements, (page + 1) * pageSize);
    return `${start}–${end} of ${totalElements}`;
  }, [page, pageSize, totalElements]);

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm ring-1 ring-slate-900/[0.03]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-6 py-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Individual responses</h2>
          <p className="mt-0.5 text-xs text-slate-500">{pageLabel}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={page <= 0 || loading}
            onClick={() => onPageChange(page - 1)}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-xs tabular-nums text-slate-500">
            Page {page + 1} of {Math.max(1, totalPages)}
          </span>
          <button
            type="button"
            disabled={page + 1 >= totalPages || loading}
            onClick={() => onPageChange(page + 1)}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      {loading ? (
        <SkeletonRows count={5} className="p-6" rowClassName="h-14" />
      ) : rows.length === 0 ? (
        <div className="px-6 py-12 text-center text-sm text-slate-500">No responses yet.</div>
      ) : (
        <ul className="divide-y divide-slate-100">
          {rows.map((row) => {
            const expanded = expandedId === row.id;
            return (
              <li key={row.id}>
                <button
                  type="button"
                  onClick={() => setExpandedId(expanded ? null : row.id)}
                  className="flex w-full items-center justify-between gap-4 px-6 py-4 text-left hover:bg-slate-50/80"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900">
                      {respondentLabel(row.respondent)}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {new Date(row.createdAt).toLocaleString()} · {Object.keys(row.answers).length} answers
                    </p>
                  </div>
                  <span className="shrink-0 text-xs font-semibold text-violet-600">
                    {expanded ? "Hide" : "View"}
                  </span>
                </button>
                {expanded ? <SubmissionDetail row={row} /> : null}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
