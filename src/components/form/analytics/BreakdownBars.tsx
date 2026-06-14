import type { BreakdownItem } from "../../../api/types";
import { BREAKDOWN_CHART_COLORS } from "./chartColors";

type BreakdownBarsProps = {
  items: BreakdownItem[];
  emptyMessage?: string;
  maxItems?: number;
};

export function BreakdownBars({
  items,
  emptyMessage = "No data yet.",
  maxItems = 8,
}: BreakdownBarsProps) {
  const visible = items.slice(0, maxItems);
  const maxCount = Math.max(1, ...visible.map((i) => i.count));

  if (visible.length === 0) {
    return <p className="text-sm text-slate-500">{emptyMessage}</p>;
  }

  return (
    <ul className="space-y-3">
      {visible.map((item, index) => {
        const barPct = (item.count / maxCount) * 100;
        const pct =
          item.percent > 0 ? item.percent : maxCount > 0 ? (item.count / maxCount) * 100 : 0;
        const color = BREAKDOWN_CHART_COLORS[index % BREAKDOWN_CHART_COLORS.length]!;

        return (
          <li key={item.key}>
            <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
              <span className="flex min-w-0 items-center gap-2 text-slate-700">
                <span
                  className="size-2 shrink-0 rounded-full"
                  style={{ backgroundColor: color }}
                  aria-hidden
                />
                <span className="min-w-0 truncate font-medium" title={item.label}>
                  {item.label}
                </span>
              </span>
              <span className="shrink-0 tabular-nums text-xs text-slate-500">
                <span className="font-semibold text-slate-700">{item.count}</span>
                <span className="mx-1 text-slate-300">·</span>
                {pct.toFixed(0)}%
              </span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-slate-100/90 ring-1 ring-slate-200/60">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.max(barPct, item.count > 0 ? 4 : 0)}%`,
                  background: `linear-gradient(90deg, ${color}dd, ${color})`,
                }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
