import type { AnalyticsCompletionInsights, AnalyticsSummary } from "../../../api/types";
import { formatDayOfWeek, formatHour, formatPercent } from "./formatAnalytics";

type AnalyticsMetricGridProps = {
  summary: AnalyticsSummary | null;
  completion?: AnalyticsCompletionInsights | null;
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

export function AnalyticsMetricGrid({ summary, completion, loading }: AnalyticsMetricGridProps) {
  if (loading && !summary) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 8 }, (_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  const metrics: Metric[] = [
    {
      label: "Total responses",
      value: summary?.totalResponses ?? 0,
      hint: "All time",
    },
    {
      label: "Last 7 days",
      value: summary?.responsesLast7Days ?? "—",
      hint: summary?.responsesLast30Days
        ? `Last 30d: ${summary.responsesLast30Days}`
        : "Rolling window",
      accent: "sky",
    },
    {
      label: "Today",
      value: summary?.responsesToday ?? 0,
      hint: "Since midnight",
    },
    {
      label: "Unique respondents",
      value: summary?.uniqueRespondents ?? "—",
      hint:
        summary?.returningRespondents !== undefined
          ? `${summary.returningRespondents} returning`
          : "Based on email / name fingerprint",
      accent: "emerald",
    },
    {
      label: "Avg completion",
      value: formatPercent(completion?.avgCompletionRate ?? summary?.avgCompletionRate),
      hint: completion
        ? `${completion.fullyCompletedCount} fully completed (${formatPercent(completion.fullyCompletedRate)})`
        : "Fields answered on average",
      accent: "amber",
    },
    {
      label: "Peak activity",
      value: formatHour(summary?.peakHour ?? null),
      hint: summary?.peakDayOfWeek
        ? `Busiest day: ${formatDayOfWeek(summary.peakDayOfWeek)}`
        : "Hour with most submissions",
    },
    {
      label: "With metadata",
      value: summary?.submissionsWithMetadata ?? "—",
      hint: "Submissions including device / UTM data",
      accent: "sky",
    },
    {
      label: "Publish version",
      value: summary?.currentPublicationVersion ?? "—",
      hint: summary?.lastResponseAt
        ? `Last response ${new Date(summary.lastResponseAt).toLocaleString()}`
        : "Current live snapshot",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map((m) => (
        <MetricCard key={m.label} {...m} />
      ))}
    </div>
  );
}
