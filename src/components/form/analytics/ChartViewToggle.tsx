export type ChartViewMode = "bar" | "pie";

type ChartViewToggleProps = {
  value: ChartViewMode;
  onChange: (mode: ChartViewMode) => void;
  size?: "sm" | "md";
};

export function ChartViewToggle({ value, onChange, size = "sm" }: ChartViewToggleProps) {
  const btnClass = (active: boolean) =>
    `rounded-md font-semibold transition ${
      size === "sm" ? "px-2 py-1 text-[10px]" : "px-2.5 py-1.5 text-xs"
    } ${
      active
        ? "bg-violet-600 text-white shadow-sm"
        : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
    }`;

  return (
    <div
      className="inline-flex items-center gap-0.5 rounded-lg bg-slate-100 p-0.5 ring-1 ring-slate-200/80"
      role="group"
      aria-label="Chart view"
    >
      <button type="button" className={btnClass(value === "bar")} onClick={() => onChange("bar")}>
        Bars
      </button>
      <button type="button" className={btnClass(value === "pie")} onClick={() => onChange("pie")}>
        Pie
      </button>
    </div>
  );
}
