import { useCallback, useEffect, useState } from "react";
import { getFormAnalyticsOverview, getFormAnalyticsSummary, listFormSubmissions } from "../api/client";
import { ApiError } from "../api/http";
import type {
  AnalyticsSummary,
  AnalyticsTimelinePoint,
  QuestionAnalytics,
  SubmissionsPage,
} from "../api/types";

type UseFormAnalyticsOptions = {
  days?: number;
  page?: number;
  size?: number;
  enabled?: boolean;
};

function formatLoadError(e: unknown): string {
  if (e instanceof ApiError) {
    if (e.status === 404) {
      return "Analytics API not found (404). Ensure Spring is running on :8081 and NEXT_PUBLIC_API_URL points to it (or set NEXT_PUBLIC_API_DIRECT=false to use the /api/v1 proxy).";
    }
    return e.message;
  }
  return e instanceof Error ? e.message : "Failed to load analytics";
}

export function useFormAnalytics(
  workspaceId: string,
  formId: string,
  options: UseFormAnalyticsOptions = {},
) {
  const { days = 30, page = 0, size = 20, enabled = true } = options;

  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [timeline, setTimeline] = useState<AnalyticsTimelinePoint[]>([]);
  const [questions, setQuestions] = useState<QuestionAnalytics[]>([]);
  const [submissions, setSubmissions] = useState<SubmissionsPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (isRefresh = false) => {
      if (!workspaceId || !formId || !enabled) {
        setLoading(false);
        return;
      }

      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      try {
        const [overview, pageData] = await Promise.all([
          getFormAnalyticsOverview(workspaceId, formId, days),
          listFormSubmissions(workspaceId, formId, page, size),
        ]);
        setSummary(overview.summary);
        setTimeline(overview.timeline);
        setQuestions(overview.questions);
        setSubmissions(pageData);
      } catch (e) {
        setError(formatLoadError(e));
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [workspaceId, formId, days, page, size, enabled],
  );

  useEffect(() => {
    void load(false);
  }, [load]);

  return {
    summary,
    timeline,
    questions,
    submissions,
    loading,
    refreshing,
    error,
    reload: () => load(true),
  };
}

export function useFormResponseCount(workspaceId: string, formId: string, enabled = true) {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    if (!enabled || !workspaceId || !formId) return;
    let cancelled = false;
    getFormAnalyticsSummary(workspaceId, formId)
      .then((summary) => {
        if (!cancelled) setCount(summary.totalResponses);
      })
      .catch(() => {
        if (!cancelled) setCount(null);
      });
    return () => {
      cancelled = true;
    };
  }, [workspaceId, formId, enabled]);

  return count;
}
