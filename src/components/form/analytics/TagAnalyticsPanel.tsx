"use client";

import React from "react";
import type { TagAnalyticsSummary } from "../../../api/types";
import { TagBadge } from "../../tags/TagBadge";
import { Skeleton } from "../../ui/index";

type TagAnalyticsPanelProps = {
  tagsSummary: TagAnalyticsSummary | null;
  loading?: boolean;
  onSelectTagFilter?: (tagId: string) => void;
};

function formatPercent(val: number): string {
  if (!Number.isFinite(val) || val <= 0) return "0%";
  return val % 1 === 0 ? `${val}%` : `${val.toFixed(1)}%`;
}

export function TagAnalyticsPanel({
  tagsSummary,
  loading = false,
  onSelectTagFilter,
}: TagAnalyticsPanelProps) {
  if (loading && !tagsSummary) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  if (!tagsSummary || (tagsSummary.totalSubmissions === 0 && tagsSummary.tags.length === 0)) {
    return (
      <section className="rounded-2xl border border-slate-200/80 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-600 ring-8 ring-violet-50/50">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
          </svg>
        </div>
        <h3 className="mt-3 text-sm font-semibold text-slate-900">No tag analytics available</h3>
        <p className="mt-1 text-xs text-slate-500 max-w-md mx-auto">
          Start tagging responses in the Individual Responses tab or assign workspace tags to unlock tag distribution insights, source breakdowns, and coverage metrics.
        </p>
      </section>
    );
  }

  const {
    totalSubmissions,
    totalTaggedSubmissions,
    totalUntaggedSubmissions,
    totalTagAssignments,
    tags,
  } = tagsSummary;

  const coveragePercent =
    totalSubmissions > 0
      ? Math.round((totalTaggedSubmissions / totalSubmissions) * 100)
      : 0;

  const avgTagDensity =
    totalTaggedSubmissions > 0
      ? (totalTagAssignments / totalTaggedSubmissions).toFixed(1)
      : "0";

  const sortedTags = [...tags].sort(
    (a, b) => b.taggedSubmissionsCount - a.taggedSubmissionsCount,
  );

  return (
    <div className="space-y-6">
      {/* 1. Headline Metric KPI Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Total Submissions */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm ring-1 ring-slate-900/[0.03]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Submissions
            </span>
            <span className="rounded-lg bg-slate-100 p-2 text-slate-600">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900">
              {totalSubmissions}
            </span>
            <span className="text-xs text-slate-500">evaluated</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-400">Total form responses in window</p>
        </div>

        {/* Card 2: Tagged Coverage */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm ring-1 ring-slate-900/[0.03]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Tagged Coverage
            </span>
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
              {coveragePercent}% covered
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900">
              {totalTaggedSubmissions}
            </span>
            <span className="text-xs text-slate-500">/ {totalSubmissions}</span>
          </div>
          <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${coveragePercent}%` }}
            />
          </div>
        </div>

        {/* Card 3: Untagged Submissions */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm ring-1 ring-slate-900/[0.03]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Untagged Responses
            </span>
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
              totalUntaggedSubmissions > 0 ? "bg-amber-50 text-amber-700" : "bg-slate-100 text-slate-600"
            }`}>
              {totalUntaggedSubmissions > 0 ? "Needs Tagging" : "All Tagged"}
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900">
              {totalUntaggedSubmissions}
            </span>
            <span className="text-xs text-slate-500">responses</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-400">Responses awaiting categorization</p>
        </div>

        {/* Card 4: Tag Density Ratio */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm ring-1 ring-slate-900/[0.03]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Tag Attachments
            </span>
            <span className="rounded-lg bg-violet-50 p-2 text-violet-600">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900">
              {totalTagAssignments}
            </span>
            <span className="text-xs font-semibold text-violet-600">
              ({avgTagDensity} / response)
            </span>
          </div>
          <p className="mt-2 text-[11px] text-slate-400">Total tag instances across form</p>
        </div>
      </div>

      {/* 2. Visual Tag Volume Distribution & Sources Breakdown Table */}
      <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm ring-1 ring-slate-900/[0.03]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Tag Distribution & Volume</h3>
            <p className="mt-0.5 text-xs text-slate-500">
              Breakdown of response volume and origin channels (Manual, AI, Import) per tag.
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-500 bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-lg">
            {sortedTags.length} active tag{sortedTags.length === 1 ? "" : "s"}
          </span>
        </div>

        {sortedTags.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No tags registered in this analytics window.
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200/80 font-bold text-slate-500 uppercase tracking-wider text-[10px] bg-slate-50/50">
                  <th scope="col" className="px-4 py-3 min-w-[160px]">
                    Tag Name
                  </th>
                  <th scope="col" className="px-4 py-3 min-w-[220px]">
                    Response Share
                  </th>
                  <th scope="col" className="px-4 py-3 min-w-[140px]">
                    Tagged Volume
                  </th>
                  <th scope="col" className="px-4 py-3 min-w-[200px]">
                    Origin Attribution
                  </th>
                  {onSelectTagFilter ? (
                    <th scope="col" className="px-4 py-3 text-right">
                      Action
                    </th>
                  ) : null}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedTags.map((tag) => {
                  const pct = tag.percentage;
                  return (
                    <tr key={tag.tagId} className="hover:bg-slate-50/60 transition">
                      {/* Tag Name Badge */}
                      <td className="px-4 py-3.5">
                        <TagBadge
                          tag={{
                            id: tag.tagId,
                            name: tag.name,
                            hexCode: tag.hexCode,
                          }}
                          showSource={false}
                          size="md"
                        />
                      </td>

                      {/* Share Progress Bar */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{
                                backgroundColor: tag.hexCode,
                                width: `${Math.min(100, pct)}%`,
                              }}
                            />
                          </div>
                          <span className="font-bold tabular-nums text-slate-800 shrink-0 min-w-[45px] text-right">
                            {formatPercent(pct)}
                          </span>
                        </div>
                      </td>

                      {/* Tagged Volume */}
                      <td className="px-4 py-3.5">
                        <span className="font-bold text-slate-900 tabular-nums">
                          {tag.taggedSubmissionsCount}
                        </span>
                        <span className="text-slate-400 ml-1">
                          response{tag.taggedSubmissionsCount === 1 ? "" : "s"}
                        </span>
                      </td>

                      {/* Origin Attribution Breakdown Pills */}
                      <td className="px-4 py-3.5">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700" title="Manually assigned by team">
                            <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
                            {tag.manualCount} Manual
                          </span>

                          {tag.aiCount > 0 ? (
                            <span className="inline-flex items-center gap-1 rounded bg-purple-100 px-2 py-0.5 text-[10px] font-semibold text-purple-700" title="Auto-assigned by AI model">
                              <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />
                              {tag.aiCount} AI
                            </span>
                          ) : null}

                          {tag.importCount > 0 ? (
                            <span className="inline-flex items-center gap-1 rounded bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700" title="Bulk imported">
                              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                              {tag.importCount} Import
                            </span>
                          ) : null}
                        </div>
                      </td>

                      {/* Filter Action */}
                      {onSelectTagFilter ? (
                        <td className="px-4 py-3.5 text-right">
                          <button
                            type="button"
                            onClick={() => onSelectTagFilter(tag.tagId)}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-violet-600 hover:text-violet-800"
                          >
                            <span>Filter Responses</span>
                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                            </svg>
                          </button>
                        </td>
                      ) : null}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
