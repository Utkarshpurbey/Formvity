import type { BreakdownItem } from "../../../api/types";

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
      {visible.map((item) => {
        const barPct = (item.count / maxCount) * 100;
        const pctLabel = item.percent > 0 ? `${item.percent.toFixed(0)}%` : null;
        return (
          <li key={item.key}>
            <div className="flex items-start justify-between gap-3 text-sm">
              <span className="min-w-0 break-words text-slate-700">{item.label}</span>
              <span className="shrink-0 tabular-nums text-slate-500">
                {item.count}
                {pctLabel ? ` · ${pctLabel}` : ""}
              </span>
            </div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-[width]"
                style={{ width: `${barPct}%` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
