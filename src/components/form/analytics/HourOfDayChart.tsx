import type { BreakdownItem } from "../../../api/types";
import { formatHour } from "./formatAnalytics";

type HourOfDayChartProps = {
  byHour: BreakdownItem[];
  peakHour?: number | null;
};

export function HourOfDayChart({ byHour, peakHour }: HourOfDayChartProps) {
  const buckets: BreakdownItem[] = Array.from({ length: 24 }, (_, hour) => {
    const match = byHour.find(
      (b) => b.key === String(hour) || b.label === String(hour) || Number(b.key) === hour,
    );
    return match ?? { key: String(hour), label: String(hour), count: 0, percent: 0 };
  });

  const maxCount = Math.max(1, ...buckets.map((b) => b.count));
  const hasData = buckets.some((b) => b.count > 0);

  if (!hasData) {
    return (
      <div className="flex h-36 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50 text-sm text-slate-500">
        No hourly data yet.
      </div>
    );
  }

  return (
    <div>
      {peakHour !== null && peakHour !== undefined ? (
        <p className="mb-4 text-xs text-slate-500">
          Peak hour: <span className="font-semibold text-violet-700">{formatHour(peakHour)}</span>
        </p>
      ) : null}
      <div
        className="flex gap-0.5 overflow-x-auto pb-1"
        role="img"
        aria-label="Responses by hour of day"
      >
        {buckets.map((bucket) => {
          const hour = Number(bucket.key);
          const heightPct =
            bucket.count === 0 ? 0 : Math.max(8, Math.round((bucket.count / maxCount) * 100));
          const isPeak = peakHour !== null && peakHour !== undefined && hour === peakHour;
          return (
            <div
              key={bucket.key}
              className="flex min-w-[18px] flex-1 flex-col items-center"
              title={`${formatHour(hour)}: ${bucket.count} responses`}
            >
              <div className="flex h-28 w-full flex-col justify-end">
                {bucket.count > 0 ? (
                  <div
                    className={`mx-auto w-[80%] max-w-4 rounded-t-sm ${
                      isPeak ? "bg-violet-600" : "bg-violet-400"
                    }`}
                    style={{ height: `${heightPct}%` }}
                  />
                ) : (
                  <div className="mx-auto h-px w-[80%] bg-slate-200" />
                )}
              </div>
              {hour % 3 === 0 ? (
                <span className="mt-1.5 text-[9px] tabular-nums text-slate-400">{hour}</span>
              ) : (
                <span className="mt-1.5 h-3" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
