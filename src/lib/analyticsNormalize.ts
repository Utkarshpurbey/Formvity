import type {
  AnalyticsSummary,
  AnalyticsTimeline,
  AnalyticsTimelinePoint,
  FormAnalyticsOverview,
  QuestionAnalytics,
  QuestionDistribution,
  SubmissionRow,
  SubmissionsPage,
} from "../api/types";

/**
 * Normalizers for FormAnalyticsController (`/workspaces/{id}/forms/{id}/…`).
 * `apiData()` unwraps `{ status, data, message }` before these run.
 */

function asRecord(raw: unknown): Record<string, unknown> {
  return raw && typeof raw === "object" && !Array.isArray(raw) ? (raw as Record<string, unknown>) : {};
}

function asArray(raw: unknown): unknown[] {
  return Array.isArray(raw) ? raw : [];
}

function pickString(...values: unknown[]): string | null {
  for (const v of values) {
    if (typeof v === "string" && v.trim()) return v;
  }
  return null;
}

function pickNumber(...values: unknown[]): number {
  for (const v of values) {
    if (typeof v === "number" && Number.isFinite(v)) return v;
    if (typeof v === "string" && v.trim() && Number.isFinite(Number(v))) return Number(v);
  }
  return 0;
}

function pickBool(...values: unknown[]): boolean {
  for (const v of values) {
    if (typeof v === "boolean") return v;
  }
  return false;
}

/** FormAnalyticsSummaryDto */
export function normalizeAnalyticsSummary(raw: unknown): AnalyticsSummary {
  const r = asRecord(raw);
  const versionRaw = r.currentPublicationVersion ?? r.currentPublishVersion ?? r.publishVersion ?? r.version;
  return {
    totalResponses: pickNumber(r.totalResponses, r.total, r.totalCount, r.responseCount),
    responsesToday: pickNumber(r.responsesToday, r.todayCount, r.today, r.todayResponses),
    firstResponseAt: pickString(r.firstResponseAt, r.firstResponseTime, r.firstResponse),
    lastResponseAt: pickString(r.lastResponseAt, r.lastResponseTime, r.lastResponse),
    currentPublicationVersion:
      versionRaw === null || versionRaw === undefined ? null : pickNumber(versionRaw),
  };
}

/** TimelineBucketDto */
function normalizeTimelinePoint(raw: unknown): AnalyticsTimelinePoint | null {
  const r = asRecord(raw);
  const date = pickString(r.date, r.day, r.label, r.bucket);
  if (!date) return null;
  return {
    date,
    count: pickNumber(r.count, r.responses, r.value, r.total),
  };
}

function normalizeTimelinePoints(raw: unknown): AnalyticsTimelinePoint[] {
  return asArray(raw)
    .map(normalizeTimelinePoint)
    .filter((p): p is AnalyticsTimelinePoint => p !== null);
}

/** GET …/analytics/timeline → data is List<TimelineBucketDto> */
export function normalizeAnalyticsTimeline(raw: unknown, fallbackDays = 30): AnalyticsTimeline {
  if (Array.isArray(raw)) {
    return { days: fallbackDays, points: normalizeTimelinePoints(raw) };
  }
  const r = asRecord(raw);
  const points = normalizeTimelinePoints(r.points ?? r.buckets ?? r.timeline ?? r.data);
  return {
    days: pickNumber(r.days, fallbackDays) || fallbackDays,
    points,
  };
}

/** Distribution entry inside QuestionAnalyticsDto */
function normalizeDistribution(raw: unknown): QuestionDistribution | null {
  const r = asRecord(raw);
  const value = pickString(r.value, r.option, r.answer, r.key);
  const label = pickString(r.label, r.value, r.option);
  if (value === null && label === null) return null;
  const count = pickNumber(r.count, r.responses, r.total);
  const percent = pickNumber(r.percent, r.percentage, r.pct);
  return {
    value: value ?? label ?? "",
    label: label ?? undefined,
    count,
    percent: percent || 0,
  };
}

/** QuestionAnalyticsDto */
function normalizeQuestion(raw: unknown): QuestionAnalytics | null {
  const r = asRecord(raw);
  const fieldId = pickString(r.fieldId, r.id, r.questionId, r.componentId);
  if (!fieldId) return null;
  const distribution = asArray(r.distribution ?? r.options ?? r.breakdown ?? r.values ?? r.choices)
    .map(normalizeDistribution)
    .filter((d): d is QuestionDistribution => d !== null);
  const responseCount = pickNumber(r.responseCount, r.totalResponses, r.count, r.answers);
  return {
    fieldId,
    label: pickString(r.label, r.questionLabel, r.title, r.name) ?? fieldId,
    type: pickString(r.type, r.fieldType, r.componentType) ?? "text",
    responseCount: responseCount || distribution.reduce((sum, d) => sum + d.count, 0),
    skippedCount: r.skippedCount !== undefined ? pickNumber(r.skippedCount) : undefined,
    average: r.average !== undefined ? pickNumber(r.average) : undefined,
    min: r.min !== undefined ? pickNumber(r.min) : undefined,
    max: r.max !== undefined ? pickNumber(r.max) : undefined,
    distribution,
  };
}

/** GET …/analytics/questions → data is List<QuestionAnalyticsDto> */
export function normalizeQuestionAnalyticsList(raw: unknown): QuestionAnalytics[] {
  if (Array.isArray(raw)) {
    return raw.map(normalizeQuestion).filter((q): q is QuestionAnalytics => q !== null);
  }
  const r = asRecord(raw);
  return asArray(r.questions ?? r.breakdown ?? r.fields ?? r.items)
    .map(normalizeQuestion)
    .filter((q): q is QuestionAnalytics => q !== null);
}

/** GET …/analytics → data is FormAnalyticsOverviewDto */
export function normalizeFormAnalyticsOverview(raw: unknown, fallbackDays = 30): FormAnalyticsOverview {
  const r = asRecord(raw);
  return {
    summary: normalizeAnalyticsSummary(r.summary ?? r),
    timeline: normalizeTimelinePoints(r.timeline ?? r.buckets ?? r.points),
    questions: normalizeQuestionAnalyticsList(r.questions ?? r.questionAnalytics ?? []),
  };
}

/** SubmissionListItemDto */
function normalizeSubmissionRow(raw: unknown): SubmissionRow | null {
  const r = asRecord(raw);
  const id = pickString(r.id, r.submissionId);
  if (!id) return null;
  return {
    id,
    createdAt: pickString(r.createdAt, r.submittedAt, r.submitted_at) ?? new Date(0).toISOString(),
    publicationVersion: r.publicationVersion !== undefined ? pickNumber(r.publicationVersion) : undefined,
    respondent: asRecord(r.respondent ?? r.responderDetails ?? r.intake),
    answers: asRecord(r.answers ?? r.formAnswers ?? r.fields),
  };
}

/** GET …/submissions → data is Page<SubmissionListItemDto> */
export function normalizeSubmissionsPage(raw: unknown): SubmissionsPage {
  const r = asRecord(raw);
  const content = asArray(r.content ?? r.items)
    .map(normalizeSubmissionRow)
    .filter((row): row is SubmissionRow => row !== null);
  const page = pickNumber(r.number, r.page, r.pageNumber);
  const size = pickNumber(r.size, r.pageSize) || 20;
  const totalElements = pickNumber(r.totalElements, r.total, r.totalCount);
  const totalPages = pickNumber(r.totalPages, r.pages) || 1;
  return {
    content,
    page,
    size,
    totalElements: totalElements || content.length,
    totalPages: totalPages || (size > 0 ? Math.ceil((totalElements || content.length) / size) : 1),
    first: pickBool(r.first, page <= 0),
    last: pickBool(r.last, page + 1 >= totalPages),
  };
}
