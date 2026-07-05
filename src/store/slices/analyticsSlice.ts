import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import * as api from "../../api/client";
import { ApiError } from "../../api/http";
import type {
  AnalyticsInsights,
  AnalyticsSummary,
  AnalyticsTimelinePoint,
  QuestionAnalytics,
  SubmissionsPage,
} from "../../api/types";

type AnalyticsCacheEntry = {
  summary: AnalyticsSummary | null;
  timeline: AnalyticsTimelinePoint[];
  questions: QuestionAnalytics[];
  insights: AnalyticsInsights | null;
  submissions: SubmissionsPage | null;
};

type AnalyticsState = {
  byKey: Record<string, AnalyticsCacheEntry>;
  loadingByKey: Record<string, boolean>;
  errorByKey: Record<string, string | null>;
};

const initialState: AnalyticsState = {
  byKey: {},
  loadingByKey: {},
  errorByKey: {},
};

export function analyticsCacheKey(
  workspaceId: string,
  formId: string,
  days: number,
  page: number,
  size: number,
) {
  return `${workspaceId}:${formId}:${days}:${page}:${size}`;
}

function formatLoadError(e: unknown): string {
  if (e instanceof ApiError) {
    if (e.status === 404) {
      return "Analytics data is not available for this form yet.";
    }
    return e.message;
  }
  return e instanceof Error ? e.message : "Unable to load analytics. Please try again.";
}

type FetchFormAnalyticsArg = {
  workspaceId: string;
  formId: string;
  days?: number;
  page?: number;
  size?: number;
  force?: boolean;
};

export const fetchFormAnalytics = createAsyncThunk(
  "analytics/fetch",
  async ({ workspaceId, formId, days = 7, page = 0, size = 20 }: FetchFormAnalyticsArg) => {
    const [overview, submissions] = await Promise.all([
      api.getFormAnalyticsOverview(workspaceId, formId, days),
      api.listFormSubmissions(workspaceId, formId, page, size),
    ]);
    let insights = overview.insights ?? null;
    if (!insights) {
      try {
        insights = await api.getFormAnalyticsInsights(workspaceId, formId, days);
      } catch {
        insights = null;
      }
    }
    return {
      key: analyticsCacheKey(workspaceId, formId, days, page, size),
      summary: overview.summary,
      timeline: overview.timeline,
      questions: overview.questions,
      insights,
      submissions,
    };
  },
  {
    condition: (arg, { getState }) => {
      if (arg.force) return true;
      const { workspaceId, formId, days = 7, page = 0, size = 20 } = arg;
      const key = analyticsCacheKey(workspaceId, formId, days, page, size);
      const state = getState() as { analytics: AnalyticsState };
      if (state.analytics.loadingByKey[key]) return false;
      return !state.analytics.byKey[key];
    },
  },
);

export const selectAnalyticsEntry = (
  state: { analytics: AnalyticsState },
  key: string,
) => state.analytics.byKey[key];

export const selectAnalyticsLoading = (
  state: { analytics: AnalyticsState },
  key: string,
) => Boolean(state.analytics.loadingByKey[key]);

export const selectAnalyticsError = (
  state: { analytics: AnalyticsState },
  key: string,
) => state.analytics.errorByKey[key] ?? null;

const analyticsSlice = createSlice({
  name: "analytics",
  initialState,
  reducers: {
    invalidateFormAnalytics(state, action: { payload: { workspaceId: string; formId: string } }) {
      const prefix = `${action.payload.workspaceId}:${action.payload.formId}:`;
      for (const key of Object.keys(state.byKey)) {
        if (key.startsWith(prefix)) {
          delete state.byKey[key];
          delete state.loadingByKey[key];
          delete state.errorByKey[key];
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFormAnalytics.pending, (s, a) => {
        const { workspaceId, formId, days = 7, page = 0, size = 20 } = a.meta.arg;
        const key = analyticsCacheKey(workspaceId, formId, days, page, size);
        s.loadingByKey[key] = true;
        s.errorByKey[key] = null;
      })
      .addCase(fetchFormAnalytics.fulfilled, (s, a) => {
        const key = a.payload.key;
        delete s.loadingByKey[key];
        s.byKey[key] = {
          summary: a.payload.summary,
          timeline: a.payload.timeline,
          questions: a.payload.questions,
          insights: a.payload.insights,
          submissions: a.payload.submissions,
        };
      })
      .addCase(fetchFormAnalytics.rejected, (s, a) => {
        const { workspaceId, formId, days = 7, page = 0, size = 20 } = a.meta.arg;
        const key = analyticsCacheKey(workspaceId, formId, days, page, size);
        delete s.loadingByKey[key];
        s.errorByKey[key] = formatLoadError(a.error);
      });
  },
});

export const { invalidateFormAnalytics } = analyticsSlice.actions;
export default analyticsSlice.reducer;
