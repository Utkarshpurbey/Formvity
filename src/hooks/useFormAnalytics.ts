import { useCallback, useEffect, useMemo, useState } from "react";
import { getFormAnalyticsSummary } from "../api/client";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  analyticsCacheKey,
  fetchFormAnalytics,
  selectAnalyticsEntry,
  selectAnalyticsError,
  selectAnalyticsLoading,
} from "../store/slices/analyticsSlice";

type UseFormAnalyticsOptions = {
  days?: number;
  page?: number;
  size?: number;
  enabled?: boolean;
};

export function useFormAnalytics(
  workspaceId: string,
  formId: string,
  options: UseFormAnalyticsOptions = {},
) {
  const { days = 7, page = 0, size = 20, enabled = true } = options;
  const dispatch = useAppDispatch();

  const cacheKey = useMemo(
    () => (workspaceId && formId ? analyticsCacheKey(workspaceId, formId, days, page, size) : ""),
    [workspaceId, formId, days, page, size],
  );

  const entry = useAppSelector((s) => (cacheKey ? selectAnalyticsEntry(s, cacheKey) : undefined));
  const loading = useAppSelector((s) => Boolean(cacheKey && selectAnalyticsLoading(s, cacheKey) && !entry));
  const refreshing = useAppSelector((s) => Boolean(cacheKey && selectAnalyticsLoading(s, cacheKey) && entry));
  const error = useAppSelector((s) => (cacheKey ? selectAnalyticsError(s, cacheKey) : null));

  const load = useCallback(
    (force = false) => {
      if (!workspaceId || !formId || !enabled) return;
      dispatch(fetchFormAnalytics({ workspaceId, formId, days, page, size, force }));
    },
    [dispatch, workspaceId, formId, days, page, size, enabled],
  );

  useEffect(() => {
    load(false);
  }, [load]);

  return {
    summary: entry?.summary ?? null,
    timeline: entry?.timeline ?? [],
    questions: entry?.questions ?? [],
    insights: entry?.insights ?? null,
    submissions: entry?.submissions ?? null,
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
