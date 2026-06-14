import type { AnalyticsCompletionInsights, BreakdownItem } from "../../../api/types";

export function completionInsightsToBreakdown(
  completion: AnalyticsCompletionInsights,
  totalResponses: number,
): BreakdownItem[] {
  const full = completion.fullyCompletedCount;
  const partial = Math.max(0, totalResponses - full);
  if (totalResponses <= 0) return [];
  return [
    {
      key: "full",
      label: "100% complete",
      count: full,
      percent: (full / totalResponses) * 100,
    },
    {
      key: "partial",
      label: "Partially complete",
      count: partial,
      percent: (partial / totalResponses) * 100,
    },
  ].filter((item) => item.count > 0);
}
