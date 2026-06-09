import type {
  FormStatus,
  PublicationMeta,
  PublishResponse,
  PublishStatus,
} from "../api/types";
import { buildPublicUrl } from "../utils/publicUrl";

export type FormLifecycleKind = "live" | "never_published" | "unpublished" | "archived" | "not_found";

export type FormLifecycle = {
  kind: FormLifecycleKind;
  isLive: boolean;
  formStatus: FormStatus;
  lastPublishedAt?: string;
  slug?: string;
  publicUrl?: string;
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

/** Map backend FormPublicationEntity (or similar) to app publish shape. */
export function normalizePublicationResponse(raw: unknown, formId?: string): PublishResponse {
  const r = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const slug = String(r.slug ?? r.publicSlug ?? "");
  const id = String(r.formId ?? formId ?? "");
  const publishedAt = String(r.publishedAt ?? r.createdAt ?? new Date().toISOString());
  return {
    formId: id,
    slug,
    publicUrl: slug ? buildPublicUrl(slug) : "",
    version: Number(r.version ?? r.publicationVersion ?? 1),
    publishedAt,
  };
}

export function normalizeUnpublishResponse(raw: unknown): PublishStatus {
  const r = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const slug = r.slug ? String(r.slug) : undefined;
  return {
    status: "unpublished",
    slug,
    publicUrl: slug ? buildPublicUrl(slug) : undefined,
    lastPublishedAt: r.lastPublishedAt ? String(r.lastPublishedAt) : r.publishedAt ? String(r.publishedAt) : undefined,
    draftChangedSincePublish: false,
  };
}

export function derivePublishStatusFromForm(
  formStatus?: string,
  slug?: string,
  lastPublishedAt?: string,
): PublishStatus {
  if (formStatus === "PUBLISHED") {
    return {
      status: "published",
      slug,
      publicUrl: slug ? buildPublicUrl(slug) : undefined,
      lastPublishedAt,
      draftChangedSincePublish: false,
    };
  }
  if (formStatus === "UNPUBLISHED") {
    return {
      status: "unpublished",
      slug,
      publicUrl: slug ? buildPublicUrl(slug) : undefined,
      lastPublishedAt,
      draftChangedSincePublish: false,
    };
  }
  return {
    status: formStatus === "ARCHIVED" ? "unpublished" : "draft",
    slug,
    publicUrl: slug ? buildPublicUrl(slug) : undefined,
    draftChangedSincePublish: false,
  };
}

function normalizeFormStatus(raw?: string | null): FormStatus {
  const upper = String(raw ?? "DRAFT").toUpperCase();
  if (upper === "PUBLISHED") return "PUBLISHED";
  if (upper === "UNPUBLISHED") return "UNPUBLISHED";
  if (upper === "ARCHIVED") return "ARCHIVED";
  if (upper === "EXPIRED") return "EXPIRED";
  return "DRAFT";
}

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
