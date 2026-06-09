import type { FormDef } from "../components/page-def/builder/pageDef";

export type ApiResponse<T> = {
  status: number;
  data: T;
  message?: string;
};

export type ApiErrorBody = {
  status?: number;
  error?: string;
  errorMessage?: string;
  message?: string;
};

export type CurrentUser = {
  id: string;
  displayName: string;
  email?: string;
};

export type LoginResponse = {
  token: string;
  id: string;
  displayName: string;
};

export type UserDto = {
  id: string;
  displayName: string;
  email: string;
};

export type WorkspaceRole = "ADMIN" | "EDITOR" | "VIEWER" | "ATTENDEE";

export type WorkspaceSummary = {
  workSpaceId: string;
  workSpaceName: string;
  formCount?: number;
};

export type WorkspaceDashboard = {
  workspaceId: string;
  workspaceName: string;
  formCount: number;
  recentForms: FormSummary[];
};

export type WorkspaceMember = {
  userId: string;
  displayName?: string;
  email?: string;
  role: WorkspaceRole;
};

export type PublicationMeta = {
  slug?: string;
  publicUrl?: string;
  publishedAt?: string;
  lastPublishedAt?: string;
  isLive?: boolean;
};

export type FormStatus = "DRAFT" | "PUBLISHED" | "UNPUBLISHED" | "EXPIRED" | "ARCHIVED";

export type FormSummary = {
  id: string;
  workspaceId: string;
  createdByUser: string;
  status: FormStatus;
  title: string;
  createdAt: string;
  updatedAt: string;
};

export type FormEntity = FormSummary & {
  draftPageDef?: FormDef | Record<string, unknown>;
};

export type DraftPageDef = FormDef;

export type PublishResponse = {
  formId: string;
  slug: string;
  publicUrl: string;
  version: number;
  publishedAt: string;
};

export type PublishStatus = {
  status: "draft" | "published" | "unpublished";
  slug?: string;
  publicUrl?: string;
  lastPublishedAt?: string;
  draftChangedSincePublish: boolean;
};

export type AnalyticsSummary = {
  totalResponses: number;
  responsesToday: number;
  firstResponseAt: string | null;
  lastResponseAt: string | null;
  currentPublicationVersion: number | null;
};

export type AnalyticsTimelinePoint = {
  date: string;
  count: number;
};

export type AnalyticsTimeline = {
  days: number;
  points: AnalyticsTimelinePoint[];
};

export type QuestionDistribution = {
  value: string;
  label?: string;
  count: number;
  percent: number;
};

export type QuestionAnalytics = {
  fieldId: string;
  label: string;
  type: string;
  responseCount: number;
  skippedCount?: number;
  average?: number;
  min?: number;
  max?: number;
  distribution: QuestionDistribution[];
};

export type FormAnalyticsOverview = {
  summary: AnalyticsSummary;
  timeline: AnalyticsTimelinePoint[];
  questions: QuestionAnalytics[];
};

export type SubmissionRow = {
  id: string;
  createdAt: string;
  publicationVersion?: number;
  respondent: Record<string, unknown>;
  answers: Record<string, unknown>;
};

export type SubmissionsPage = {
  content: SubmissionRow[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
};
