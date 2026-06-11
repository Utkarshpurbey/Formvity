export type AnalyticsTab = "overview" | "insights" | "questions" | "responses";

const TABS: { id: AnalyticsTab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "insights", label: "Audience & traffic" },
  { id: "questions", label: "Questions" },
  { id: "responses", label: "Responses" },
];

type AnalyticsTabNavProps = {
  active: AnalyticsTab;
  onChange: (tab: AnalyticsTab) => void;
};

export function AnalyticsTabNav({ active, onChange }: AnalyticsTabNavProps) {
  return (
    <nav
      className="flex gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-slate-50/80 p-1"
      aria-label="Analytics sections"
    >
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={`shrink-0 rounded-lg px-4 py-2 text-sm font-semibold transition ${
            active === tab.id
              ? "bg-white text-violet-700 shadow-sm ring-1 ring-slate-200/80"
              : "text-slate-600 hover:bg-white/60 hover:text-slate-900"
          }`}
          aria-current={active === tab.id ? "page" : undefined}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
