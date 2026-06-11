import type { QuestionAnalytics } from "../../api/types";
import { formatPercent } from "./analytics/formatAnalytics";

type QuestionBreakdownPanelProps = {
  questions: QuestionAnalytics[];
};

function humanizeFieldLabel(label: string, fieldId: string): string {
  if (label !== fieldId) return label;
  return fieldId
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (c) => c.toUpperCase())
    .trim();
}

function isAnsweredOnlyDistribution(distribution: QuestionAnalytics["distribution"]): boolean {
  return (
    distribution.length === 1 && distribution[0]?.value.toLowerCase() === "answered"
  );
}

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
        const showDistribution =
          question.distribution.length > 0 &&
          !(
            isAnsweredOnlyDistribution(question.distribution) &&
            (question.topTextAnswers?.length ?? 0) > 0
          );
        const maxCount = showDistribution
          ? Math.max(1, ...question.distribution.map((d) => d.count))
          : 1;
        const hasNumericStats =
          question.average !== undefined ||
          question.median !== undefined ||
          question.min !== undefined ||
          question.max !== undefined;

        return (
          <article
            key={question.fieldId}
            className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm ring-1 ring-slate-900/[0.03]"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold text-slate-900">
                    {humanizeFieldLabel(question.label, question.fieldId)}
                  </h3>
                  {question.required ? (
                    <span className="rounded bg-rose-50 px-1.5 py-0.5 text-[10px] font-bold uppercase text-rose-600">
                      Required
                    </span>
                  ) : null}
                </div>
                <p className="mt-0.5 text-xs text-slate-500">
                  {question.type} · {question.responseCount} response
                  {question.responseCount === 1 ? "" : "s"}
                  {question.completionRate !== undefined
                    ? ` · ${formatPercent(question.completionRate)} answered`
                    : ""}
                </p>
              </div>
            </div>

            {hasNumericStats ? (
              <dl className="mt-3 flex flex-wrap gap-3 text-xs">
                {question.average !== undefined ? (
                  <div className="rounded-lg bg-slate-50 px-2.5 py-1.5">
                    <dt className="text-slate-500">Avg</dt>
                    <dd className="font-semibold tabular-nums text-slate-800">
                      {question.average.toFixed(1)}
                    </dd>
                  </div>
                ) : null}
                {question.median !== undefined ? (
                  <div className="rounded-lg bg-slate-50 px-2.5 py-1.5">
                    <dt className="text-slate-500">Median</dt>
                    <dd className="font-semibold tabular-nums text-slate-800">
                      {question.median.toFixed(1)}
                    </dd>
                  </div>
                ) : null}
                {question.min !== undefined && question.max !== undefined ? (
                  <div className="rounded-lg bg-slate-50 px-2.5 py-1.5">
                    <dt className="text-slate-500">Range</dt>
                    <dd className="font-semibold tabular-nums text-slate-800">
                      {question.min} – {question.max}
                    </dd>
                  </div>
                ) : null}
              </dl>
            ) : null}

            <div className="mt-4 space-y-3">
              {!showDistribution && !question.topTextAnswers?.length ? (
                <p className="text-sm text-slate-500">No distribution data yet.</p>
              ) : showDistribution ? (
                question.distribution.map((item) => (
                  <DistributionRow
                    key={`${question.fieldId}-${item.value}`}
                    value={item.label ?? item.value}
                    count={item.count}
                    percent={item.percent}
                    maxCount={maxCount}
                  />
                ))
              ) : null}
            </div>

            {question.topTextAnswers && question.topTextAnswers.length > 0 ? (
              <div className="mt-4 border-t border-slate-100 pt-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Top answers
                </p>
                <ul className="mt-2 space-y-1.5">
                  {question.topTextAnswers.map((t) => (
                    <li
                      key={t.value}
                      className="flex justify-between gap-2 text-sm text-slate-700"
                    >
                      <span className="min-w-0 truncate" title={t.value}>
                        {t.value}
                      </span>
                      <span className="shrink-0 tabular-nums text-slate-500">{t.count}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}
