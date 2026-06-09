import type { QuestionAnalytics } from "../../api/types";

type QuestionBreakdownPanelProps = {
  questions: QuestionAnalytics[];
};

function DistributionRow({
  value,
  count,
  percent,
  maxCount,
}: {
  value: string;
  count: number;
  percent: number;
  maxCount: number;
}) {
  const barPct = maxCount > 0 ? (count / maxCount) * 100 : 0;
  const pctLabel = percent > 0 ? `${percent.toFixed(0)}%` : count > 0 ? "—" : "0%";

  return (
    <div className="space-y-1.5">
      <div className="flex items-start justify-between gap-3 text-sm">
        <span className="min-w-0 break-words text-slate-700">{value || "(empty)"}</span>
        <span className="shrink-0 tabular-nums text-slate-500">
          {count} · {pctLabel}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-violet-500 transition-[width]"
          style={{ width: `${barPct}%` }}
        />
      </div>
    </div>
  );
}

export function QuestionBreakdownPanel({ questions }: QuestionBreakdownPanelProps) {
  if (questions.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 px-6 py-12 text-center text-sm text-slate-500">
        Question breakdown will appear once you have responses.
      </div>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {questions.map((question) => {
        const maxCount = Math.max(1, ...question.distribution.map((d) => d.count));
        return (
          <article
            key={question.fieldId}
            className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm ring-1 ring-slate-900/[0.03]"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="font-semibold text-slate-900">{question.label}</h3>
                <p className="mt-0.5 text-xs text-slate-500">
                  {question.type} · {question.responseCount} response
                  {question.responseCount === 1 ? "" : "s"}
                </p>
              </div>
            </div>
            <div className="mt-4 space-y-3">
              {question.distribution.length === 0 ? (
                <p className="text-sm text-slate-500">No distribution data yet.</p>
              ) : (
                question.distribution.map((item) => (
                  <DistributionRow
                    key={`${question.fieldId}-${item.value}`}
                    value={item.label ?? item.value}
                    count={item.count}
                    percent={item.percent}
                    maxCount={maxCount}
                  />
                ))
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}
