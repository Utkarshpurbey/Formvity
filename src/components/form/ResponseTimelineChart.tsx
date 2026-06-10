import type { AnalyticsTimelinePoint } from "../../api/types";

type ResponseTimelineChartProps = {
  points: AnalyticsTimelinePoint[];
};

/** Parse `YYYY-MM-DD` as local calendar date (avoids UTC shift on axis labels). */
function parseLocalDate(date: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(date.trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  const day = Number(match[3]);
  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) return null;
  return new Date(year, month, day);
}

function formatAxisLabel(date: string): string {
  const local = parseLocalDate(date);
  if (local) {
    return local.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  }
  const parsed = Date.parse(date);
  if (Number.isFinite(parsed)) {
    return new Date(parsed).toLocaleDateString(undefined, { month: "short", day: "numeric" });
  }
  return date.slice(5, 10);
}

function shouldShowAxisLabel(index: number, total: number): boolean {
  if (total <= 14) return true;
  if (total <= 31) return index % 5 === 0 || index === total - 1;
  return index % 7 === 0 || index === total - 1;
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

  return (
    <div
      className="flex gap-px overflow-visible rounded-xl border border-slate-100 bg-gradient-to-b from-slate-50/80 to-white px-2 pb-3 pt-6 sm:gap-0.5 sm:px-3"
      role="img"
      aria-label="Daily response counts chart"
    >
      {points.map((point, index) => {
        const heightPct =
          point.count === 0 ? 0 : Math.max(6, Math.round((point.count / maxCount) * 100));
        const label = formatAxisLabel(point.date);
        const countLabel = `${point.count} response${point.count === 1 ? "" : "s"}`;

        return (
          <div
            key={point.date}
            className="flex min-w-0 flex-1 flex-col"
            title={`${label}: ${countLabel}`}
          >
            <div className="group relative flex h-40 flex-col justify-end sm:h-44">
              <div className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-900 px-2.5 py-1 text-[10px] font-medium text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                <span className="text-slate-300">{label}</span>
                <span className="mx-1.5 text-slate-500">·</span>
                <span className="tabular-nums">{point.count}</span>
              </div>

              <div className="absolute inset-0 z-0" aria-hidden />

              {point.count > 0 ? (
                <div
                  className="relative z-[1] mx-auto w-[85%] max-w-6 rounded-t-sm bg-violet-500 transition-colors group-hover:bg-violet-600 sm:rounded-t-md"
                  style={{ height: `${heightPct}%` }}
                />
              ) : (
                <div className="relative z-[1] mx-auto h-px w-[85%] max-w-6 bg-slate-200/80" aria-hidden />
              )}
            </div>

            <div className="mt-2 flex h-8 items-start justify-center">
              {shouldShowAxisLabel(index, points.length) ? (
                <span className="text-[10px] leading-tight text-slate-400">{label}</span>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}
