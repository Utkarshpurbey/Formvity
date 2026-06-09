import type { AnalyticsTimelinePoint } from "../../api/types";

type ResponseTimelineChartProps = {
  points: AnalyticsTimelinePoint[];
};

function formatAxisLabel(date: string): string {
  const parsed = Date.parse(date);
  if (!Number.isFinite(parsed)) return date.slice(5, 10);
  return new Date(parsed).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function ResponseTimelineChart({ points }: ResponseTimelineChartProps) {
  if (points.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50 text-sm text-slate-500">
        No responses in this period yet.
      </div>
    );
  }

  const maxCount = Math.max(1, ...points.map((p) => p.count));
  const labelEvery = points.length <= 14 ? 1 : points.length <= 31 ? 5 : 7;

  return (
    <div className="space-y-3">
      <div
        className="flex h-44 items-end gap-1 rounded-xl border border-slate-100 bg-gradient-to-b from-slate-50/80 to-white px-3 pb-2 pt-4"
        role="img"
        aria-label="Daily response counts chart"
      >
        {points.map((point) => {
          const heightPct = Math.max(2, (point.count / maxCount) * 100);
          return (
            <div key={point.date} className="group relative flex min-w-0 flex-1 flex-col items-center justify-end">
              <div className="pointer-events-none absolute -top-8 z-10 hidden rounded-md bg-slate-900 px-2 py-1 text-[10px] font-medium text-white shadow group-hover:block">
                {formatAxisLabel(point.date)} · {point.count}
              </div>
              <div
                className="w-full max-w-4 rounded-t-md bg-violet-500 transition-all group-hover:bg-violet-600"
                style={{ height: `${heightPct}%` }}
                title={`${formatAxisLabel(point.date)}: ${point.count} responses`}
              />
            </div>
          );
        })}
      </div>
      <div className="flex gap-1 px-3">
        {points.map((point, index) => (
          <div key={`${point.date}-label`} className="min-w-0 flex-1 text-center">
            {index % labelEvery === 0 || index === points.length - 1 ? (
              <span className="text-[10px] text-slate-400">{formatAxisLabel(point.date)}</span>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
