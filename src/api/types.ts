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

export type WorkspaceSummary = {
  workSpaceId: string;
  workSpaceName: string;
};

export type WorkspaceMember = {
  userId: string;
  workSpaceName?: string;
  role: string;
};

export type FormStatus = "DRAFT" | "PUBLISHED" | "EXPIRED" | "ARCHIVED";

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
