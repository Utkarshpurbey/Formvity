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

/** Raw invite response shape from POST /workspaces/{id}/members */
export type InviteMemberResponse = {
  workspaceId: string;
  userId: string | null;
  emailId: string;
  roles: WorkspaceRole;
  joinedAt: string | null;
  inviteUrl: string | null;
  isNewUser: boolean;
};

export type InvitePreview = {
  email: string;
  workspaceId: string;
  workspaceName: string;
  role: WorkspaceRole;
  expiresAt: string;
};

export type ActivateUserResponse = {
  token: string;
  id: string;
  displayName: string;
  workspaceId: string;
  joinedAt: string;
};

export type PatchWorkspaceRequest = {
  workspaceName: string;
};

export type PatchMemberRoleRequest = {
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
  responsesLast7Days?: number;
  responsesLast30Days?: number;
  uniqueRespondents?: number;
  returningRespondents?: number;
  avgCompletionRate?: number;
  peakHour?: number | null;
  peakDayOfWeek?: string | null;
  submissionsWithMetadata?: number;
};

export type BreakdownItem = {
  key: string;
  label: string;
  count: number;
  percent: number;
};

/** Backend wraps breakdowns as `{ dimension, label, breakdown: [...] }`. */
export type InsightDimensionGroup = {
  key: string;
  label: string;
  items: BreakdownItem[];
};

export type AnalyticsAudienceInsights = {
  uniqueRespondents: number;
  returningRespondents: number;
  withEmail: number;
  withName: number;
  withPhone: number;
  emailDomains: BreakdownItem[];
  respondentAttributeGroups: InsightDimensionGroup[];
  respondentAttributes: BreakdownItem[];
};

export type AnalyticsTrafficInsights = {
  submissionsWithMetadata: number;
  browsers: BreakdownItem[];
  operatingSystems: BreakdownItem[];
  deviceTypes: BreakdownItem[];
  referrerHosts: BreakdownItem[];
  utmSources: BreakdownItem[];
  utmMediums: BreakdownItem[];
  utmCampaigns: BreakdownItem[];
  locales: BreakdownItem[];
  timezones: BreakdownItem[];
  countries: BreakdownItem[];
  cities: BreakdownItem[];
  platforms: BreakdownItem[];
  otherMetadata: BreakdownItem[];
};

export type AnalyticsTemporalInsights = {
  byHour: BreakdownItem[];
  byDayOfWeek: BreakdownItem[];
  peakHour: number | null;
  peakDayOfWeek: string | null;
};

export type AnalyticsCompletionInsights = {
  avgFieldsAnswered: number;
  avgCompletionRate: number;
  fullyCompletedCount: number;
  fullyCompletedRate: number;
};

export type PublicationVersionInsight = {
  version: number;
  slug?: string;
  publishedAt?: string | null;
  current: boolean;
  responseCount: number;
  percentOfTotal: number;
};

export type AnalyticsPublicationInsights = {
  versions: PublicationVersionInsight[];
};

export type AnalyticsInsights = {
  audience: AnalyticsAudienceInsights;
  traffic: AnalyticsTrafficInsights;
  temporal: AnalyticsTemporalInsights;
  completion: AnalyticsCompletionInsights;
  publications: AnalyticsPublicationInsights;
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

export type TopTextAnswer = {
  value: string;
  count: number;
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
  median?: number;
  required?: boolean;
  completionRate?: number;
  distribution: QuestionDistribution[];
  topTextAnswers?: TopTextAnswer[];
};

export type FormAnalyticsOverview = {
  summary: AnalyticsSummary;
  timeline: AnalyticsTimelinePoint[];
  questions: QuestionAnalytics[];
  insights?: AnalyticsInsights | null;
};

export type SubmissionRow = {
  id: string;
  createdAt: string;
  publicationVersion?: number;
  respondent: Record<string, unknown>;
  answers: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  answeredFieldCount?: number;
  totalFieldCount?: number;
  completionRate?: number;
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
