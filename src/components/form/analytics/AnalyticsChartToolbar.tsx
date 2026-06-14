import type { ChartViewMode } from "./ChartViewToggle";
import { ChartViewToggle } from "./ChartViewToggle";

type AnalyticsChartToolbarProps = {
  chartView: ChartViewMode;
  onChange: (mode: ChartViewMode) => void;
};

export function AnalyticsChartToolbar({ chartView, onChange }: AnalyticsChartToolbarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200/80 bg-white px-4 py-3 shadow-sm ring-1 ring-slate-900/[0.03]">
      <div>
        <p className="text-sm font-semibold text-slate-900">Breakdown chart view</p>
        <p className="text-xs text-slate-500">Switch between bar and pie charts for all breakdowns below</p>
      </div>
      <ChartViewToggle value={chartView} onChange={onChange} size="md" />
    </div>
  );
}
