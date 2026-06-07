import type { FormStatus, PublicationMeta, PublishStatus } from "../api/types";
import { buildPublicUrl } from "../utils/publicUrl";

export type FormLifecycleKind = "live" | "never_published" | "unpublished" | "archived" | "not_found";

export type FormLifecycle = {
  kind: FormLifecycleKind;
  /** True when the form has an active public publication. */
  isLive: boolean;
  formStatus: FormStatus;
  lastPublishedAt?: string;
  slug?: string;
  publicUrl?: string;
  /** Previous link kept after unpublish — shown disabled. */
  previousPublicUrl?: string;
  previousSlug?: string;
  draftChangedSincePublish: boolean;
};

export type FormLifecycleInput = {
  formStatus?: string | null;
  notFound?: boolean;
  publishStatus?: PublishStatus | null;
  publication?: PublicationMeta | null;
  lastPublishResult?: { slug?: string; publicUrl?: string; publishedAt?: string } | null;
};

function normalizeFormStatus(raw?: string | null): FormStatus {
  const upper = String(raw ?? "DRAFT").toUpperCase();
  if (upper === "PUBLISHED") return "PUBLISHED";
  if (upper === "UNPUBLISHED") return "UNPUBLISHED";
  if (upper === "ARCHIVED") return "ARCHIVED";
  if (upper === "EXPIRED") return "EXPIRED";
  return "DRAFT";
}

/** Single source of truth for maker UI publish/lifecycle display. */
export function deriveFormLifecycle(input: FormLifecycleInput): FormLifecycle {
  if (input.notFound) {
    return {
      kind: "not_found",
      isLive: false,
      formStatus: "ARCHIVED",
      draftChangedSincePublish: false,
    };
  }

  const formStatus = normalizeFormStatus(input.formStatus);

  if (formStatus === "ARCHIVED") {
    return {
      kind: "archived",
      isLive: false,
      formStatus,
      draftChangedSincePublish: false,
    };
  }

  const slug =
    input.publishStatus?.slug ??
    input.publication?.slug ??
    input.lastPublishResult?.slug;
  const lastPublishedAt =
    input.publishStatus?.lastPublishedAt ??
    input.publication?.lastPublishedAt ??
    input.publication?.publishedAt ??
    input.lastPublishResult?.publishedAt;
  const publicUrl =
    input.publishStatus?.publicUrl ??
    input.publication?.publicUrl ??
    input.lastPublishResult?.publicUrl ??
    (slug ? buildPublicUrl(slug) : undefined);
  const draftChangedSincePublish = Boolean(input.publishStatus?.draftChangedSincePublish);

  const publishStateLive = input.publishStatus?.status === "published";
  const statusLive = formStatus === "PUBLISHED";
  const publicationInactive = input.publication?.isLive === false;
  const isLive = publishStateLive || (statusLive && !publicationInactive);

  if (isLive) {
    return {
      kind: "live",
      isLive: true,
      formStatus,
      lastPublishedAt,
      slug,
      publicUrl,
      draftChangedSincePublish,
    };
  }

  if (formStatus === "UNPUBLISHED" || (lastPublishedAt && formStatus !== "PUBLISHED")) {
    const prevUrl = publicUrl ?? (slug ? buildPublicUrl(slug) : undefined);
    return {
      kind: "unpublished",
      isLive: false,
      formStatus: formStatus === "DRAFT" && lastPublishedAt ? "UNPUBLISHED" : formStatus,
      lastPublishedAt,
      previousSlug: slug,
      previousPublicUrl: prevUrl,
      draftChangedSincePublish: false,
    };
  }

  return {
    kind: "never_published",
    isLive: false,
    formStatus,
    draftChangedSincePublish: false,
  };
}

export function isEditableFormLifecycle(lifecycle: FormLifecycle): boolean {
  return lifecycle.kind !== "archived" && lifecycle.kind !== "not_found";
}

/** Workspace lists — hide archived from normal flows. */
export function filterActiveForms<T extends { status: string }>(forms: T[]): T[] {
  return forms.filter((f) => String(f.status).toUpperCase() !== "ARCHIVED");
}

export function lifecycleLabel(lifecycle: FormLifecycle): string {
  switch (lifecycle.kind) {
    case "live":
      return "Live";
    case "never_published":
      return "Never published";
    case "unpublished":
      return "Unpublished";
    case "archived":
      return "Archived";
    case "not_found":
      return "Not found";
    default:
      return "Draft";
  }
}
