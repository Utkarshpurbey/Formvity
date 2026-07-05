import type { AnalyticsTimelinePoint } from "../../../api/types";
import type { AnalyticsCompletionInsights, AnalyticsSummary } from "../../../api/types";
import { formatDayOfWeek, formatPercent } from "./formatAnalytics";
import { formatLocalDateTime, formatUtcHourAsLocal } from "../../../lib/formatDateTime";

type AnalyticsMetricGridProps = {
  summary: AnalyticsSummary | null;
  completion?: AnalyticsCompletionInsights | null;
  timeline?: AnalyticsTimelinePoint[];
  days: number;
  loading?: boolean;
};

type Metric = {
  label: string;
  value: string | number;
  hint?: string;
  accent?: "violet" | "emerald" | "amber" | "sky";
};

function MetricCard({ label, value, hint, accent = "violet" }: Metric) {
  const accentRing =
    accent === "emerald"
      ? "ring-emerald-500/10"
      : accent === "amber"
        ? "ring-amber-500/10"
        : accent === "sky"
          ? "ring-sky-500/10"
          : "ring-violet-500/10";

  return (
    <div
      className={`rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm ring-1 ${accentRing}`}
    >
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{value}</p>
      {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
    </div>
  );
}

function SkeletonCard() {
  return <div className="h-28 animate-pulse rounded-2xl bg-slate-100" />;
}

function periodResponseCount(
  summary: AnalyticsSummary | null,
  timeline: AnalyticsTimelinePoint[],
  days: number,
): number | string {
  if (timeline.length > 0) {
    return timeline.reduce((sum, point) => sum + point.count, 0);
  }
  if (days === 7 && summary?.responsesLast7Days !== undefined) return summary.responsesLast7Days;
  if (days === 30 && summary?.responsesLast30Days !== undefined) return summary.responsesLast30Days;
  return "—";
}

export function AnalyticsMetricGrid({
  summary,
  completion,
  timeline = [],
  days,
  loading,
}: AnalyticsMetricGridProps) {
  if (loading && !summary) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  const metrics: Metric[] = [
    {
      label: `Responses (${days}d)`,
      value: periodResponseCount(summary, timeline, days),
      hint: summary?.totalResponses !== undefined ? `${summary.totalResponses} all time` : undefined,
      accent: "sky",
    },
    {
      label: "Unique respondents",
      value: summary?.uniqueRespondents ?? "—",
      hint:
        summary?.returningRespondents !== undefined
          ? `${summary.returningRespondents} returning`
          : undefined,
      accent: "emerald",
    },
    {
      label: "Avg completion",
      value: formatPercent(completion?.avgCompletionRate ?? summary?.avgCompletionRate),
      hint: completion
        ? `${completion.fullyCompletedCount} fully completed`
        : undefined,
      accent: "amber",
    },
    {
      label: "Peak activity",
      value: formatUtcHourAsLocal(summary?.peakHour ?? null),
      hint: summary?.peakDayOfWeek
        ? `Busiest: ${formatDayOfWeek(summary.peakDayOfWeek)}`
        : undefined,
    },
    {
      label: "Today",
      value: summary?.responsesToday ?? 0,
      hint: "Since midnight",
    },
    {
      label: "Last response",
      value: summary?.lastResponseAt ? formatLocalDateTime(summary.lastResponseAt, "short") : "—",
      hint: summary?.firstResponseAt
        ? `First: ${formatLocalDateTime(summary.firstResponseAt, "date")}`
        : "No responses yet",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {metrics.map((m) => (
        <MetricCard key={m.label} {...m} />
      ))}
    </div>
  );
}
