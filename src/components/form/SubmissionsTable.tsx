"use client";

import { useMemo, useState } from "react";
import type { SubmissionRow } from "../../api/types";
import { downloadSubmissionsExport } from "../../api/client";
import { formatLocalDateTime } from "../../lib/formatDateTime";
import { notifyError, notifySuccess } from "../ui/AppToast";
import { SkeletonRows, Spinner } from "../ui/index";

type SubmissionsTableProps = {
  rows: SubmissionRow[];
  loading?: boolean;
  page: number;
  totalPages: number;
  totalElements: number;
  pageSize: number;
  fieldLabels?: Record<string, string>;
  workspaceId?: string;
  formId?: string;
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

function resolveAnswerDisplay(value: unknown): { title: string | null; value: unknown } {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const record = value as Record<string, unknown>;
    const title =
      typeof record.title === "string" && record.title.trim()
        ? record.title
        : typeof record.label === "string" && record.label.trim()
          ? record.label
          : null;
    if ("value" in record) return { title, value: record.value };
    if ("answer" in record) return { title, value: record.answer };
  }
  return { title: null, value };
}

function humanizeKey(key: string): string {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .replace(/^./, (c) => c.toUpperCase())
    .trim();
}

function isEmptyValue(value: unknown): boolean {
  return value === null || value === undefined || value === "" || String(value) === "null";
}

function formatKeyValuePairs(obj: Record<string, unknown>, order?: string[]): string {
  const entries = order
    ? order
        .map((k) => [k, obj[k]] as const)
        .filter(([, v]) => !isEmptyValue(v))
    : Object.entries(obj).filter(([, v]) => !isEmptyValue(v));
  if (!entries.length) return "—";
  return entries
    .map(([k, v]) => {
      if (typeof v === "object" && v !== null && !Array.isArray(v)) {
        return `${humanizeKey(k)}: ${formatDisplayValue(v)}`;
      }
      return `${humanizeKey(k)}: ${v}`;
    })
    .join(" · ");
}

function formatDurationMs(ms: unknown): string | null {
  if (typeof ms !== "number" || !Number.isFinite(ms) || ms <= 0) return null;
  const totalSec = Math.round(ms / 1000);
  if (totalSec < 60) return `${totalSec}s`;
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return sec > 0 ? `${min}m ${sec}s` : `${min}m`;
}

function formatStructuredObject(obj: Record<string, unknown>): string {
  if ("width" in obj && "height" in obj) {
    return `${obj.width} × ${obj.height}`;
  }

  if ("timeToCompleteMs" in obj || ("formOpenedAt" in obj && "submittedAt" in obj)) {
    const duration = formatDurationMs(obj.timeToCompleteMs);
    return duration ?? formatKeyValuePairs(obj, ["timeToCompleteMs", "submittedAt", "formOpenedAt"]);
  }

  if ("pageCount" in obj || "visitedPageIds" in obj) {
    const parts: string[] = [];
    if (!isEmptyValue(obj.pageCount)) {
      const count = Number(obj.pageCount);
      parts.push(`${count} page${count === 1 ? "" : "s"}`);
    }
    if (Array.isArray(obj.visitedPageIds) && obj.visitedPageIds.length > 0) {
      parts.push(obj.visitedPageIds.map(String).join(", "));
    }
    return parts.length > 0 ? parts.join(" · ") : formatKeyValuePairs(obj);
  }

  if ("sdk" in obj || "appVersion" in obj) {
    const sdk = obj.sdk;
    const version = obj.appVersion;
    if (!isEmptyValue(sdk) && !isEmptyValue(version)) return `${sdk} v${version}`;
    if (!isEmptyValue(sdk)) return String(sdk);
    if (!isEmptyValue(version)) return `v${version}`;
  }

  if ("source" in obj || "medium" in obj || "campaign" in obj || "term" in obj || "content" in obj) {
    const utmParts = ["source", "medium", "campaign", "term", "content"]
      .map((k) => {
        const v = obj[k];
        if (isEmptyValue(v)) return null;
        return `${k}=${v}`;
      })
      .filter((part): part is string => part !== null);
    return utmParts.length > 0 ? utmParts.join(" · ") : "Direct / none";
  }

  return formatKeyValuePairs(obj);
}

function formatDisplayValue(value: unknown): string {
  if (isEmptyValue(value)) return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "number") return String(value);
  if (typeof value === "string") return value === "-" ? "—" : value;
  if (Array.isArray(value)) {
    const parts = value.map((item) => formatDisplayValue(item)).filter((part) => part !== "—");
    return parts.length > 0 ? parts.join(", ") : "—";
  }
  if (typeof value === "object") {
    const { value: resolved } = resolveAnswerDisplay(value);
    if (resolved !== value) return formatDisplayValue(resolved);
    return formatStructuredObject(value as Record<string, unknown>);
  }
  return String(value);
}

function formatAnswerValue(value: unknown): string {
  return formatDisplayValue(value);
}

function metadataSummary(metadata: Record<string, unknown>): string | null {
  const parts: string[] = [];
  const device = metadata.deviceType ?? metadata.device;
  const browser = metadata.browser;
  const referrer = metadata.referrer ?? metadata.referer;
  if (!isEmptyValue(device)) parts.push(String(device));
  if (!isEmptyValue(browser)) parts.push(String(browser));
  if (typeof referrer === "string" && referrer.trim() && referrer !== "-") {
    try {
      parts.push(new URL(referrer).hostname);
    } catch {
      parts.push(referrer.slice(0, 40));
    }
  }
  const utmRaw = metadata.utm ?? metadata.utmParams;
  if (utmRaw && typeof utmRaw === "object") {
    const formatted = formatStructuredObject(utmRaw as Record<string, unknown>);
    if (formatted !== "—" && formatted !== "Direct / none") parts.push(formatted);
  } else {
    const utm = metadata.utm_source ?? metadata.utmSource;
    if (!isEmptyValue(utm)) parts.push(`utm:${utm}`);
  }
  return parts.length > 0 ? parts.join(" · ") : null;
}

function SubmissionDetail({
  row,
  fieldLabels,
}: {
  row: SubmissionRow;
  fieldLabels: Record<string, string>;
}) {
  const answerEntries = Object.entries(row.answers);
  const respondentEntries = Object.entries(row.respondent);
  const metadataEntries = Object.entries(row.metadata ?? {});

  return (
    <div className="grid gap-4 border-t border-slate-100 bg-slate-50/70 px-6 py-4 lg:grid-cols-3">
      {respondentEntries.length > 0 ? (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Respondent</p>
          <dl className="mt-2 space-y-1.5">
            {respondentEntries.map(([key, val]) => (
              <div key={key} className="flex gap-2 text-sm">
                <dt className="w-24 shrink-0 text-slate-500">{fieldLabels[key] ?? humanizeKey(key)}</dt>
                <dd className="min-w-0 break-words text-slate-800">{formatAnswerValue(val)}</dd>
              </div>
            ))}
          </dl>
        </div>
      ) : null}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Answers</p>
        <dl className="mt-2 space-y-1.5">
          {answerEntries.length === 0 ? (
            <p className="text-sm text-slate-500">No answers recorded.</p>
          ) : (
            answerEntries.map(([key, val]) => {
              const { title } = resolveAnswerDisplay(val);
              const label = fieldLabels[key] ?? title ?? humanizeKey(key);
              return (
                <div key={key} className="flex gap-2 text-sm">
                  <dt className="w-36 shrink-0 truncate text-slate-500" title={label}>
                    {label}
                  </dt>
                  <dd className="min-w-0 break-words text-slate-800">{formatAnswerValue(val)}</dd>
                </div>
              );
            })
          )}
        </dl>
      </div>
      {metadataEntries.length > 0 ? (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Metadata</p>
          <dl className="mt-2 space-y-1.5">
            {metadataEntries.map(([key, val]) => {
              const display = formatDisplayValue(val);
              const mono = key === "sessionId";
              return (
                <div key={key} className="flex gap-2 text-sm">
                  <dt className="w-28 shrink-0 truncate text-slate-500" title={key}>
                    {humanizeKey(key)}
                  </dt>
                  <dd
                    className={`min-w-0 break-words text-slate-800 ${mono ? "font-mono text-xs" : ""}`}
                  >
                    {display}
                  </dd>
                </div>
              );
            })}
          </dl>
        </div>
      ) : null}
    </div>
  );
}

function XmlIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
  );
}

function DocumentIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  );
}

export function SubmissionsTable({
  rows,
  loading = false,
  page,
  totalPages,
  totalElements,
  pageSize,
  fieldLabels = {},
  workspaceId,
  formId,
  onPageChange,
}: SubmissionsTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [exportingFormat, setExportingFormat] = useState<"xml" | "ooxml" | null>(null);

  const handleExport = async (format: "xml" | "ooxml") => {
    if (!workspaceId || !formId || exportingFormat) return;
    setExportingFormat(format);
    try {
      await downloadSubmissionsExport(workspaceId, formId, format);
      notifySuccess(`${format.toUpperCase()} export downloaded.`);
    } catch (err) {
      notifyError(err instanceof Error ? err.message : `Failed to export as ${format.toUpperCase()}`);
    } finally {
      setExportingFormat(null);
    }
  };

  const pageLabel = useMemo(() => {
    if (totalElements === 0) return "0 responses";
    const start = page * pageSize + 1;
    const end = Math.min(totalElements, (page + 1) * pageSize);
    return `${start}–${end} of ${totalElements}`;
  }, [page, pageSize, totalElements]);

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm ring-1 ring-slate-900/[0.03]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-6 py-4">
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-xs text-slate-500">{pageLabel}</p>
          {workspaceId && formId ? (
            <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
              <button
                type="button"
                disabled={exportingFormat !== null || totalElements === 0}
                onClick={() => handleExport("xml")}
                title="Export submissions as XML"
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50 transition"
              >
                {exportingFormat === "xml" ? <Spinner size="sm" /> : <XmlIcon />}
                <span>XML</span>
              </button>
              <button
                type="button"
                disabled={exportingFormat !== null || totalElements === 0}
                onClick={() => handleExport("ooxml")}
                title="Export submissions as OOXML (.docx)"
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50 transition"
              >
                {exportingFormat === "ooxml" ? <Spinner size="sm" /> : <DocumentIcon />}
                <span>OOXML (.docx)</span>
              </button>
            </div>
          ) : null}
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
            const meta = metadataSummary(row.metadata ?? {});
            return (
              <li key={row.id}>
                <button
                  type="button"
                  onClick={() => setExpandedId(expanded ? null : row.id)}
                  className="flex w-full items-center justify-between gap-4 px-6 py-4 text-left hover:bg-slate-50/80"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-sm font-medium text-slate-900">
                        {respondentLabel(row.respondent)}
                      </p>
                      {row.publicationVersion ? (
                        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600">
                          v{row.publicationVersion}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {formatLocalDateTime(row.createdAt)} · {Object.keys(row.answers).length}{" "}
                      answers
                      {meta ? ` · ${meta}` : ""}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs font-semibold text-violet-600">
                    {expanded ? "Hide" : "View"}
                  </span>
                </button>
                {expanded ? <SubmissionDetail row={row} fieldLabels={fieldLabels} /> : null}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
