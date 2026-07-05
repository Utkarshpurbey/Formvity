import type { BreakdownItem, QuestionAnalytics, TopTextAnswer } from "../../api/types";
import { BreakdownChart } from "./analytics/BreakdownChart";
import type { ChartViewMode } from "./analytics/ChartViewToggle";
import { formatPercent } from "./analytics/formatAnalytics";

type QuestionBreakdownPanelProps = {
  questions: QuestionAnalytics[];
  chartView: ChartViewMode;
  fieldLabels?: Record<string, string>;
};

const NUMERIC_TYPES = new Set(["number", "rating", "scale"]);

function labelFor(question: QuestionAnalytics, fieldLabels: Record<string, string>): string {
  if (fieldLabels[question.fieldId]) return fieldLabels[question.fieldId]!;
  if (question.label && question.label !== question.fieldId) return question.label;
  return question.fieldId
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .replace(/^./, (c) => c.toUpperCase())
    .trim();
}

function toBreakdown(distribution: QuestionAnalytics["distribution"]): BreakdownItem[] {
  return distribution.map((d) => ({
    key: d.value,
    label: d.label ?? d.value,
    count: d.count,
    percent: d.percent,
  }));
}

function topAnswersToBreakdown(answers: TopTextAnswer[]): BreakdownItem[] {
  const total = answers.reduce((sum, a) => sum + a.count, 0);
  return answers.map((a) => ({
    key: a.value,
    label: a.value,
    count: a.count,
    percent: total > 0 ? (a.count / total) * 100 : 0,
  }));
}

function chartItems(question: QuestionAnalytics): BreakdownItem[] {
  const distribution = toBreakdown(question.distribution);
  const top = question.topTextAnswers?.length ? topAnswersToBreakdown(question.topTextAnswers) : [];
  const answeredOnly =
    distribution.length === 1 && distribution[0]?.key.toLowerCase() === "answered";

  if (answeredOnly && top.length > 0) return top;
  if (distribution.length > 0 && !answeredOnly) return distribution;
  if (top.length > 0) return top;
  return distribution;
}

function showStats(question: QuestionAnalytics): boolean {
  if (!NUMERIC_TYPES.has(question.type.toLowerCase())) return false;
  return (
    question.average !== undefined ||
    question.median !== undefined ||
    question.min !== undefined ||
    question.max !== undefined
  );
}

export function QuestionBreakdownPanel({
  questions,
  chartView,
  fieldLabels = {},
}: QuestionBreakdownPanelProps) {
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
        const items = chartItems(question);

        return (
          <article
            key={question.fieldId}
            className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm ring-1 ring-slate-900/[0.03]"
          >
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-semibold text-slate-900">{labelFor(question, fieldLabels)}</h3>
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

            {showStats(question) ? (
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

            <div className="mt-4">
              {items.length === 0 ? (
                <p className="text-sm text-slate-500">No distribution data yet.</p>
              ) : (
                <BreakdownChart items={items} viewMode={chartView} />
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}
