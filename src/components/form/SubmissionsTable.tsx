"use client";

import React, { useMemo, useState, useEffect, useCallback } from "react";
import type { SubmissionRow, Tag } from "../../api/types";
import { downloadSubmissionsExport, removeSubmissionTag, getWorkspaceTags } from "../../api/client";
import { formatLocalDateTime } from "../../lib/formatDateTime";
import { notifyError, notifySuccess } from "../ui/AppToast";
import { SkeletonRows, Spinner } from "../ui/index";
import { TagBadge } from "../tags/TagBadge";
import { SubmissionTagSelector } from "../tags/SubmissionTagSelector";
import { BulkTagSelector } from "../tags/BulkTagSelector";

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
  return nameStr ?? emailStr ?? "Anonymous Respondent";
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

function getKeyAnswersSnippet(
  answers: Record<string, unknown>,
  fieldLabels: Record<string, string>,
): string {
  const entries = Object.entries(answers).filter(([, val]) => !isEmptyValue(val));
  if (entries.length === 0) return "No answers";
  const preview = entries.slice(0, 2).map(([key, val]) => {
    const { title } = resolveAnswerDisplay(val);
    const label = fieldLabels[key] ?? title ?? humanizeKey(key);
    const formatted = formatAnswerValue(val);
    return `${label}: ${formatted}`;
  });
  const remaining = entries.length - preview.length;
  return preview.join(" · ") + (remaining > 0 ? ` (+${remaining} more)` : "");
}

function ExcelIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 10h18M3 14h18m-9-4v8m-7 4h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
  );
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
    <div className="border-t border-slate-200/80 bg-slate-50/80 px-6 py-5">
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Respondent Info Card */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Respondent Information
            </h4>
            {row.publicationVersion ? (
              <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">
                v{row.publicationVersion}
              </span>
            ) : null}
          </div>
          {respondentEntries.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No respondent details recorded.</p>
          ) : (
            <dl className="space-y-2 text-xs">
              {respondentEntries.map(([key, val]) => (
                <div key={key} className="flex flex-col sm:flex-row sm:justify-between gap-1">
                  <dt className="font-medium text-slate-500">{fieldLabels[key] ?? humanizeKey(key)}</dt>
                  <dd className="font-semibold text-slate-900 break-all sm:text-right">
                    {formatAnswerValue(val)}
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </div>

        {/* Answers Card */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Form Answers ({answerEntries.length})
            </h4>
            <span className="text-[11px] text-slate-400 font-mono">
              ID: {row.id.slice(0, 8)}…
            </span>
          </div>
          {answerEntries.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No answers recorded.</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {answerEntries.map(([key, val]) => {
                const { title } = resolveAnswerDisplay(val);
                const label = fieldLabels[key] ?? title ?? humanizeKey(key);
                const displayVal = formatAnswerValue(val);
                return (
                  <div key={key} className="rounded-lg border border-slate-100 bg-slate-50/50 p-2.5">
                    <dt className="text-[11px] font-semibold text-slate-500 truncate" title={label}>
                      {label}
                    </dt>
                    <dd className="mt-1 text-xs font-semibold text-slate-900 break-words">
                      {displayVal === "—" ? (
                        <span className="text-slate-400 font-normal">—</span>
                      ) : (
                        displayVal
                      )}
                    </dd>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Metadata Card */}
        {metadataEntries.length > 0 ? (
          <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs lg:col-span-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-2 mb-3">
              Technical & Session Metadata
            </h4>
            <dl className="grid gap-3 text-xs sm:grid-cols-2 lg:grid-cols-4">
              {metadataEntries.map(([key, val]) => {
                const display = formatDisplayValue(val);
                const mono = key === "sessionId" || key === "ip" || key === "id";
                return (
                  <div key={key} className="rounded-lg bg-slate-50/60 p-2 border border-slate-100">
                    <dt className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">
                      {humanizeKey(key)}
                    </dt>
                    <dd
                      className={`mt-0.5 text-xs font-semibold text-slate-800 break-all ${
                        mono ? "font-mono text-[11px]" : ""
                      }`}
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
  fieldLabels = {},
  workspaceId,
  formId,
  onPageChange,
}: SubmissionsTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [rowTagsMap, setRowTagsMap] = useState<Record<string, Tag[]>>({});
  const [workspaceTags, setWorkspaceTags] = useState<Tag[]>([]);
  
  // Selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Filter states
  const [textSearch, setTextSearch] = useState<string>("");
  const [selectedTagFilterIds, setSelectedTagFilterIds] = useState<Set<string>>(new Set());
  const [tagFilterMatchMode, setTagFilterMatchMode] = useState<"ANY" | "ALL">("ANY");

  // Sync props rows tags to local state map
  useEffect(() => {
    const initialMap: Record<string, Tag[]> = {};
    rows.forEach((r) => {
      initialMap[r.id] = r.tags ?? [];
    });
    setRowTagsMap(initialMap);
  }, [rows]);

  // Fetch workspace tags for filter bar
  const loadWorkspaceTags = useCallback(async () => {
    if (!workspaceId) return;
    try {
      const tags = await getWorkspaceTags(workspaceId);
      setWorkspaceTags(tags);
    } catch {
      // Non-blocking catch
    }
  }, [workspaceId]);

  useEffect(() => {
    loadWorkspaceTags();
  }, [loadWorkspaceTags]);

  const handleExport = async () => {
    if (!workspaceId || !formId || exporting) return;
    setExporting(true);
    try {
      await downloadSubmissionsExport(workspaceId, formId);
      notifySuccess("Excel export downloaded.");
    } catch (err) {
      notifyError(
        err instanceof Error ? err.message : "Failed to export submissions to Excel",
      );
    } finally {
      setExporting(false);
    }
  };

  const handleRemoveTag = async (submissionId: string, tagId: string) => {
    try {
      const updatedTags = await removeSubmissionTag(submissionId, tagId);
      setRowTagsMap((prev) => ({ ...prev, [submissionId]: updatedTags }));
      notifySuccess("Tag removed from submission.");
    } catch (err) {
      notifyError(err instanceof Error ? err.message : "Failed to remove tag");
    }
  };

  const handleTagsUpdated = (submissionId: string, newTags: Tag[]) => {
    setRowTagsMap((prev) => ({ ...prev, [submissionId]: newTags }));
  };

  const toggleTagFilter = (tagId: string) => {
    setSelectedTagFilterIds((prev) => {
      const next = new Set(prev);
      if (next.has(tagId)) {
        next.delete(tagId);
      } else {
        next.add(tagId);
      }
      return next;
    });
  };

  // Multi-tag filter logic
  const filteredRows = useMemo(() => {
    return rows.filter((r) => {
      // 1. Multi-tag filter
      if (selectedTagFilterIds.size > 0) {
        const assigned = rowTagsMap[r.id] ?? r.tags ?? [];
        const assignedTagIds = new Set(assigned.map((t) => t.id));
        if (tagFilterMatchMode === "ALL") {
          const matchesAll = Array.from(selectedTagFilterIds).every((id) => assignedTagIds.has(id));
          if (!matchesAll) return false;
        } else {
          const matchesAny = Array.from(selectedTagFilterIds).some((id) => assignedTagIds.has(id));
          if (!matchesAny) return false;
        }
      }

      // 2. Text search filter
      if (textSearch.trim()) {
        const query = textSearch.toLowerCase().trim();
        const respText = respondentLabel(r.respondent).toLowerCase();
        if (respText.includes(query)) return true;

        const answersText = JSON.stringify(r.answers).toLowerCase();
        if (answersText.includes(query)) return true;

        const tagsText = (rowTagsMap[r.id] ?? r.tags ?? [])
          .map((t) => t.name.toLowerCase())
          .join(" ");
        if (tagsText.includes(query)) return true;

        return false;
      }

      return true;
    });
  }, [rows, rowTagsMap, selectedTagFilterIds, tagFilterMatchMode, textSearch]);

  // Tag usage count map for pills
  const tagCountsMap = useMemo(() => {
    const counts: Record<string, number> = {};
    Object.values(rowTagsMap).forEach((tags) => {
      tags.forEach((t) => {
        counts[t.id] = (counts[t.id] ?? 0) + 1;
      });
    });
    return counts;
  }, [rowTagsMap]);

  // Selection toggle logic
  const allFilteredSelected =
    filteredRows.length > 0 && filteredRows.every((r) => selectedIds.has(r.id));

  const toggleSelectAll = () => {
    if (allFilteredSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredRows.map((r) => r.id)));
    }
  };

  const toggleSelectRow = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const pageLabel = useMemo(() => {
    if (totalElements === 0) return "0 responses";
    const start = page * pageSize + 1;
    const end = Math.min(totalElements, (page + 1) * pageSize);
    return `${start}–${end} of ${totalElements}`;
  }, [page, pageSize, totalElements]);

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm ring-1 ring-slate-900/[0.03]">
      {/* Top Header & Search Control Bar */}
      <div className="space-y-3 border-b border-slate-100 bg-slate-50/50 px-6 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Left: Text Search & Tag Pills */}
          <div className="flex flex-wrap items-center gap-3 flex-1 min-w-0">
            {/* Search Input */}
            <div className="relative min-w-[200px] sm:w-64">
              <svg
                className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                />
              </svg>
              <input
                type="text"
                value={textSearch}
                onChange={(e) => setTextSearch(e.target.value)}
                placeholder="Search respondent or answers..."
                className="w-full rounded-lg border border-slate-200 bg-white pl-8 pr-7 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 shadow-2xs transition"
              />
              {textSearch ? (
                <button
                  type="button"
                  onClick={() => setTextSearch("")}
                  className="absolute right-2 top-2 text-slate-400 hover:text-slate-600"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              ) : null}
            </div>

            {/* Pagination Label */}
            <span className="text-xs text-slate-500 font-medium hidden sm:inline-block">
              {pageLabel}
            </span>
          </div>

          {/* Right: Export & Pagination */}
          <div className="flex flex-wrap items-center gap-2">
            {workspaceId && formId ? (
              <button
                type="button"
                disabled={exporting || totalElements === 0}
                onClick={handleExport}
                title="Export submissions to Excel (.xlsx)"
                className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50/60 px-3 py-1.5 text-xs font-semibold text-emerald-700 shadow-2xs hover:bg-emerald-100 hover:text-emerald-800 disabled:cursor-not-allowed disabled:opacity-50 transition"
              >
                {exporting ? <Spinner size="sm" /> : <ExcelIcon className="h-3.5 w-3.5 text-emerald-600" />}
                <span>Export (.xlsx)</span>
              </button>
            ) : null}

            <div className="flex items-center gap-1.5 border-l border-slate-200 pl-2">
              <button
                type="button"
                disabled={page <= 0 || loading}
                onClick={() => onPageChange(page - 1)}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 transition"
              >
                Prev
              </button>
              <span className="text-xs font-medium tabular-nums text-slate-500">
                {page + 1}/{Math.max(1, totalPages)}
              </span>
              <button
                type="button"
                disabled={page + 1 >= totalPages || loading}
                onClick={() => onPageChange(page + 1)}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 transition"
              >
                Next
              </button>
            </div>
          </div>
        </div>

        {/* Interactive Tag Filter Chips Bar */}
        {workspaceTags.length > 0 ? (
          <div className="flex flex-wrap items-center gap-1.5 pt-1 pb-0.5 text-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 shrink-0 mr-1">
              Filter:
            </span>
            <button
              type="button"
              onClick={() => setSelectedTagFilterIds(new Set())}
              className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold transition shrink-0 ${
                selectedTagFilterIds.size === 0
                  ? "bg-slate-900 text-white shadow-2xs"
                  : "bg-slate-200/70 text-slate-600 hover:bg-slate-200"
              }`}
            >
              All ({rows.length})
            </button>
            {workspaceTags.map((tag) => {
              const active = selectedTagFilterIds.has(tag.id);
              const count = tagCountsMap[tag.id] ?? 0;
              return (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleTagFilter(tag.id)}
                  style={{
                    backgroundColor: active ? tag.hexCode : undefined,
                    borderColor: tag.hexCode,
                  }}
                  className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition shrink-0 ${
                    active
                      ? "text-white shadow-2xs font-semibold ring-2 ring-slate-900/10"
                      : "bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {active ? (
                    <svg className="h-3 w-3 text-white shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  ) : (
                    <span
                      className="h-1.5 w-1.5 rounded-full shrink-0"
                      style={{ backgroundColor: tag.hexCode }}
                    />
                  )}
                  <span>{tag.name}</span>
                  <span className={`text-[10px] ${active ? "text-white/90" : "text-slate-400"}`}>
                    ({count})
                  </span>
                </button>
              );
            })}

            {/* Multi-tag mode toggle controls when 2+ tags are selected */}
            {selectedTagFilterIds.size >= 2 ? (
              <div className="flex items-center gap-1 border-l border-slate-200/80 pl-2 ml-1">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Match:
                </span>
                <button
                  type="button"
                  onClick={() => setTagFilterMatchMode("ANY")}
                  className={`rounded-md px-2 py-0.5 text-[10px] font-bold transition ${
                    tagFilterMatchMode === "ANY"
                      ? "bg-violet-600 text-white shadow-2xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                  title="Show responses matching ANY selected tag"
                >
                  ANY (OR)
                </button>
                <button
                  type="button"
                  onClick={() => setTagFilterMatchMode("ALL")}
                  className={`rounded-md px-2 py-0.5 text-[10px] font-bold transition ${
                    tagFilterMatchMode === "ALL"
                      ? "bg-violet-600 text-white shadow-2xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                  title="Show responses matching ALL selected tags"
                >
                  ALL (AND)
                </button>
              </div>
            ) : null}

            {selectedTagFilterIds.size > 0 ? (
              <button
                type="button"
                onClick={() => setSelectedTagFilterIds(new Set())}
                className="text-[11px] font-medium text-slate-400 hover:text-slate-700 ml-1 underline"
              >
                Clear ({selectedTagFilterIds.size})
              </button>
            ) : null}
          </div>
        ) : null}
      </div>

      {/* Floating / Sticky Bulk Action Bar */}
      {selectedIds.size > 0 ? (
        <div className="flex items-center justify-between gap-4 border-b border-violet-100 bg-violet-50/90 px-6 py-2.5 transition animate-in fade-in duration-150">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-violet-600 text-[11px] font-bold text-white">
              {selectedIds.size}
            </span>
            <span className="text-xs font-semibold text-violet-900">
              {selectedIds.size === 1 ? "1 response selected" : `${selectedIds.size} responses selected`}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {workspaceId ? (
              <BulkTagSelector
                workspaceId={workspaceId}
                selectedSubmissionIds={Array.from(selectedIds)}
                onBulkCompleted={() => {
                  loadWorkspaceTags();
                  setSelectedIds(new Set());
                }}
              />
            ) : null}
            <button
              type="button"
              onClick={() => setSelectedIds(new Set())}
              className="text-xs font-medium text-slate-500 hover:text-slate-700 px-2 py-1"
            >
              Clear Selection
            </button>
          </div>
        </div>
      ) : null}

      {/* Main Data Table */}
      {loading ? (
        <SkeletonRows count={5} className="p-6" rowClassName="h-14" />
      ) : filteredRows.length === 0 ? (
        <div className="px-6 py-16 text-center">
          <svg className="mx-auto h-8 w-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
          <p className="mt-2 text-sm font-semibold text-slate-700">No responses found</p>
          <p className="text-xs text-slate-400 mt-0.5">
            {textSearch || selectedTagFilterIds.size > 0
              ? "Try adjusting your search query or tag filters."
              : "No responses recorded yet for this form."}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/60 font-bold text-slate-600 uppercase tracking-wider text-[10px]">
                <th scope="col" className="w-10 px-4 py-3 text-center">
                  <input
                    type="checkbox"
                    checked={allFilteredSelected}
                    onChange={toggleSelectAll}
                    className="h-3.5 w-3.5 rounded border-slate-300 text-violet-600 focus:ring-violet-500 cursor-pointer"
                    title="Select all on this page"
                  />
                </th>
                <th scope="col" className="px-4 py-3 min-w-[160px]">
                  Respondent
                </th>
                <th scope="col" className="px-4 py-3 min-w-[240px]">
                  Key Answers Preview
                </th>
                <th scope="col" className="px-4 py-3 min-w-[180px]">
                  Tags
                </th>
                <th scope="col" className="px-4 py-3 min-w-[140px]">
                  Submitted Date
                </th>
                <th scope="col" className="w-16 px-4 py-3 text-right">
                  Details
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredRows.map((row) => {
                const expanded = expandedId === row.id;
                const isSelected = selectedIds.has(row.id);
                const assignedTags = rowTagsMap[row.id] ?? row.tags ?? [];
                const meta = metadataSummary(row.metadata ?? {});
                const keySnippet = getKeyAnswersSnippet(row.answers, fieldLabels);

                return (
                  <React.Fragment key={row.id}>
                    <tr
                      onClick={() => setExpandedId(expanded ? null : row.id)}
                      className={`cursor-pointer transition hover:bg-slate-50/80 ${
                        isSelected ? "bg-violet-50/40" : expanded ? "bg-slate-50/60" : ""
                      }`}
                    >
                      {/* Selection Checkbox */}
                      <td className="px-4 py-3 text-center" onClick={(e) => toggleSelectRow(row.id, e)}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="h-3.5 w-3.5 rounded border-slate-300 text-violet-600 focus:ring-violet-500 cursor-pointer"
                        />
                      </td>

                      {/* Respondent Column */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-slate-900 truncate max-w-[180px]">
                            {respondentLabel(row.respondent)}
                          </span>
                          {row.publicationVersion ? (
                            <span className="rounded bg-slate-100 px-1 py-0.2 text-[9px] font-semibold text-slate-500 shrink-0">
                              v{row.publicationVersion}
                            </span>
                          ) : null}
                        </div>
                        {meta ? (
                          <p className="text-[10px] text-slate-400 truncate max-w-[180px] mt-0.5">
                            {meta}
                          </p>
                        ) : null}
                      </td>

                      {/* Key Answers Column */}
                      <td className="px-4 py-3">
                        <p className="text-xs text-slate-700 truncate max-w-[320px]" title={keySnippet}>
                          {keySnippet}
                        </p>
                        <span className="text-[10px] text-slate-400">
                          {Object.keys(row.answers).length} fields answered
                        </span>
                      </td>

                      {/* Tags Column */}
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <div className="flex flex-wrap items-center gap-1">
                          {assignedTags.map((tag) => (
                            <TagBadge
                              key={tag.id}
                              tag={tag}
                              size="sm"
                              onRemove={() => handleRemoveTag(row.id, tag.id)}
                            />
                          ))}
                          {workspaceId ? (
                            <SubmissionTagSelector
                              workspaceId={workspaceId}
                              submissionId={row.id}
                              assignedTags={assignedTags}
                              onTagsUpdated={(newTags) => handleTagsUpdated(row.id, newTags)}
                            />
                          ) : null}
                        </div>
                      </td>

                      {/* Date Column */}
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                        <p className="font-medium text-slate-800">{formatLocalDateTime(row.createdAt)}</p>
                      </td>

                      {/* Action Column */}
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedId(expanded ? null : row.id);
                          }}
                          className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold transition ${
                            expanded
                              ? "bg-violet-100 text-violet-800"
                              : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                          }`}
                        >
                          <span>{expanded ? "Close" : "View"}</span>
                          <svg
                            className={`h-3 w-3 transition-transform ${expanded ? "rotate-180" : ""}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2.5}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                          </svg>
                        </button>
                      </td>
                    </tr>

                    {/* Expanded Detail Row */}
                    {expanded ? (
                      <tr>
                        <td colSpan={6} className="p-0">
                          <SubmissionDetail row={row} fieldLabels={fieldLabels} />
                        </td>
                      </tr>
                    ) : null}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
