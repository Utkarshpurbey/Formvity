import type { BreakdownItem } from "../../../api/types";
import { BreakdownBars } from "./BreakdownBars";
import { BreakdownPieChart } from "./BreakdownPieChart";
import type { ChartViewMode } from "./ChartViewToggle";

type BreakdownChartProps = {
  items: BreakdownItem[];
  viewMode: ChartViewMode;
  emptyMessage?: string;
  maxItems?: number;
  compact?: boolean;
};

export function BreakdownChart({
  items,
  viewMode,
  emptyMessage,
  maxItems,
  compact,
}: BreakdownChartProps) {
  if (items.length === 0) {
    return emptyMessage ? <p className="text-sm text-slate-500">{emptyMessage}</p> : null;
  }

  if (viewMode === "pie") {
    const hasData = items.some((item) => item.count > 0);
    if (!hasData) {
      return emptyMessage ? <p className="text-sm text-slate-500">{emptyMessage}</p> : null;
    }
    return <BreakdownPieChart items={items} maxItems={maxItems} compact={compact} />;
  }

  return <BreakdownBars items={items} emptyMessage={emptyMessage} maxItems={maxItems} />;
}
