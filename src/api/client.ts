import type { FormDef } from "../components/page-def/builder/pageDef";
import {
  normalizePublicationResponse,
  normalizeUnpublishResponse,
} from "../lib/publish";
import {
  normalizeMemberList,
  normalizeActivateUserResponse,
  normalizeInviteMemberResponse,
  normalizeInvitePreview,
  normalizeWorkspaceDashboard,
  normalizeWorkspaceList,
} from "../lib/apiNormalize";
import {
  normalizeAnalyticsSummary,
  normalizeAnalyticsTimeline,
  normalizeFormAnalyticsInsightsOnly,
  normalizeFormAnalyticsOverview,
  normalizeQuestionAnalyticsList,
  normalizeSubmissionsPage,
} from "../lib/analyticsNormalize";
import { ApiPath, getCompleteHost } from "../utils/apiPath";
import { getApiHeaders } from "../utils/authHeaders";
import { ApiError, apiData, apiFetch, unwrapData } from "./http";
import type { PublicSubmissionPayload } from "../lib/submissionPayload";
import type {
  AnalyticsInsights,
  AnalyticsSummary,
  AnalyticsTimelinePoint,
  CurrentUser,
  DraftPageDef,
  FormAnalyticsOverview,
  FormEntity,
  FormSummary,
  LoginResponse,
  PublishResponse,
  PublishStatus,
  QuestionAnalytics,
  SubmissionsPage,
  WorkspaceDashboard,
  WorkspaceMember,
  WorkspaceSummary,
  ActivateUserResponse,
  InviteMemberResponse,
  InvitePreview,
  PatchMemberRoleRequest,
  PatchWorkspaceRequest,
  WorkspaceRole,
} from "./types";

// — Auth —

export function login(userName: string, password: string) {
  const email = userName.trim();
  return apiFetch<LoginResponse>(ApiPath.auth.login, {
    method: "POST",
    body: JSON.stringify({ email, userName: email, password }),
  });
}

export function register(displayName: string, email: string, password: string) {
  return apiData<unknown>(ApiPath.auth.register, {
    method: "POST",
    body: JSON.stringify({ displayName, email, password }),
  });
}

export async function fetchMe() {
  const body = await apiFetch<unknown>(ApiPath.auth.me);
  return unwrapData<CurrentUser>(body);
}

export function logout() {
  return apiData<string>(ApiPath.auth.logout, { method: "POST" });
}

// — Workspaces —

export async function listWorkspaces(): Promise<WorkspaceSummary[]> {
  const raw = await apiData<unknown>(ApiPath.workspaces.list);
  return normalizeWorkspaceList(raw);
}

export function createWorkspace(workSpaceName: string) {
  return apiData<{ id: string; name: string }>(ApiPath.workspaces.list, {
    method: "POST",
    body: JSON.stringify({ workSpaceName }),
  });
}

export function deleteWorkspace(workSpaceId: string) {
  return apiData<string>(ApiPath.workspaces.byId(workSpaceId), { method: "DELETE" });
}

export async function getWorkspaceDashboard(workSpaceId: string): Promise<WorkspaceDashboard> {
  const raw = await apiData<unknown>(ApiPath.workspaces.dashboard(workSpaceId));
  return normalizeWorkspaceDashboard(raw);
}

export async function listMembers(workSpaceId: string): Promise<WorkspaceMember[]> {
  const raw = await apiData<unknown>(ApiPath.workspaces.members(workSpaceId));
  return normalizeMemberList(raw);
}

export async function inviteMember(
  workspaceId: string,
  email: string,
  role: WorkspaceRole,
): Promise<InviteMemberResponse> {
  const raw = await apiData<unknown>(ApiPath.workspaces.members(workspaceId), {
    method: "POST",
    body: JSON.stringify({ email, role }),
  });
  return normalizeInviteMemberResponse(raw);
}

export async function patchMemberRole(
  workspaceId: string,
  userId: string,
  body: PatchMemberRoleRequest,
): Promise<WorkspaceMember> {
  const raw = await apiData<unknown>(`${ApiPath.workspaces.members(workspaceId)}/${encodeURIComponent(userId)}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
  const list = normalizeMemberList(Array.isArray(raw) ? raw : [raw]);
  return list[0] ?? { userId, role: body.role };
}

export function patchWorkspace(workspaceId: string, body: PatchWorkspaceRequest) {
  return apiData<unknown>(ApiPath.workspaces.byId(workspaceId), {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export async function fetchInvitePreview(token: string): Promise<InvitePreview> {
  const raw = await apiData<unknown>(ApiPath.auth.invitePreview(token));
  return normalizeInvitePreview(raw);
}

export async function activateInvitedUser(
  token: string,
  displayName: string,
  password: string,
): Promise<ActivateUserResponse> {
  const raw = await apiData<unknown>(ApiPath.auth.activate, {
    method: "POST",
    body: JSON.stringify({ token, displayName, password }),
  });
  return normalizeActivateUserResponse(raw);
}

// — Forms —

export function listForms(workspaceId: string) {
  return apiData<FormSummary[]>(ApiPath.forms.list(workspaceId));
}

export function createForm(workspaceId: string, title: string, draftPageDef: FormDef) {
  return apiData<FormEntity>(ApiPath.forms.list(workspaceId), {
    method: "POST",
    body: JSON.stringify({ title, draftPageDef }),
  });
}

export function getFormDraft(workspaceId: string, formId: string) {
  return apiData<DraftPageDef>(ApiPath.forms.byId(workspaceId, formId));
}

export function patchForm(
  workspaceId: string,
  formId: string,
  patch: { title?: string; draftPageDef?: FormDef },
) {
  return apiData<FormEntity>(ApiPath.forms.byId(workspaceId, formId), {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
}

export function deleteForm(workspaceId: string, formId: string, hard = false) {
  return apiData<string>(ApiPath.forms.delete(workspaceId, formId, hard), { method: "DELETE" });
}

/** Optional endpoint — returns null when backend has no publish-status route (404). */
export async function getPublishStatus(
  workspaceId: string,
  formId: string,
): Promise<PublishStatus | null> {
  try {
    return await apiData<PublishStatus>(ApiPath.forms.publishStatus(workspaceId, formId));
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return null;
    throw e;
  }
}

/** Backend generates slug; no request body required. */
export async function publishForm(workspaceId: string, formId: string): Promise<PublishResponse> {
  const raw = await apiData<unknown>(ApiPath.forms.publish(workspaceId, formId), {
    method: "POST",
  });
  return normalizePublicationResponse(raw, formId);
}

export async function unpublishForm(workspaceId: string, formId: string): Promise<PublishStatus> {
  const raw = await apiData<unknown>(ApiPath.forms.unpublish(workspaceId, formId), {
    method: "POST",
  });
  return normalizeUnpublishResponse(raw);
}

/** Submit public form response to `POST /public/:slug/submit`. */
export async function submitPublicForm(slug: string, body: PublicSubmissionPayload): Promise<void> {
  await apiData<unknown>(ApiPath.public.submit(slug), {
    method: "POST",
    body: JSON.stringify(body),
  });
}

// — Analytics & submissions (FormAnalyticsController) —

/** GET /workspaces/{workspaceId}/forms/{formId}/analytics?days= */
export async function getFormAnalyticsOverview(
  workspaceId: string,
  formId: string,
  days = 7,
): Promise<FormAnalyticsOverview> {
  const raw = await apiData<unknown>(ApiPath.forms.analyticsOverview(workspaceId, formId, days));
  return normalizeFormAnalyticsOverview(raw, days);
}

/** GET …/analytics/summary */
export async function getFormAnalyticsSummary(
  workspaceId: string,
  formId: string,
): Promise<AnalyticsSummary> {
  const raw = await apiData<unknown>(ApiPath.forms.analyticsSummary(workspaceId, formId));
  return normalizeAnalyticsSummary(raw);
}

/** GET …/analytics/timeline?days= — data is List<TimelineBucketDto> */
export async function getFormAnalyticsTimeline(
  workspaceId: string,
  formId: string,
  days = 7,
): Promise<AnalyticsTimelinePoint[]> {
  const raw = await apiData<unknown>(ApiPath.forms.analyticsTimeline(workspaceId, formId, days));
  return normalizeAnalyticsTimeline(raw, days).points;
}

/** GET …/analytics/questions — data is List<QuestionAnalyticsDto> */
export async function getFormQuestionAnalytics(
  workspaceId: string,
  formId: string,
): Promise<QuestionAnalytics[]> {
  const raw = await apiData<unknown>(ApiPath.forms.analyticsQuestions(workspaceId, formId));
  return normalizeQuestionAnalyticsList(raw);
}

/** GET …/analytics/insights?days= */
export async function getFormAnalyticsInsights(
  workspaceId: string,
  formId: string,
  days = 7,
): Promise<AnalyticsInsights> {
  const raw = await apiData<unknown>(ApiPath.forms.analyticsInsights(workspaceId, formId, days));
  return normalizeFormAnalyticsInsightsOnly(raw);
}

/** GET …/submissions?page=&size= — data is Page<SubmissionListItemDto> */
export async function listFormSubmissions(
  workspaceId: string,
  formId: string,
  page = 0,
  size = 20,
): Promise<SubmissionsPage> {
  const raw = await apiData<unknown>(ApiPath.forms.submissions(workspaceId, formId, page, size));
  return normalizeSubmissionsPage(raw);
}

/** Download Excel (.xlsx) submissions export */
export async function downloadSubmissionsExport(
  workspaceId: string,
  formId: string,
): Promise<void> {
  const path = ApiPath.forms.exportExcel(workspaceId, formId);
  const url = getCompleteHost(path);

  const res = await fetch(url, {
    method: "GET",
    headers: {
      ...getApiHeaders(),
      Accept: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, */*",
    },
  });

  if (!res.ok) {
    throw new ApiError(`Failed to export submissions to Excel`, res.status);
  }

  const blob = await res.blob();
  const filename = `submissions-export.xlsx`;

  const blobUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = blobUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(blobUrl);
}

export function exportFormSubmissionsExcel(workspaceId: string, formId: string) {
  return downloadSubmissionsExport(workspaceId, formId);
}

export type { PublicSubmissionPayload } from "../lib/submissionPayload";
