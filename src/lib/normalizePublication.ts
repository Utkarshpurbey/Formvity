import type { PublishResponse, PublishStatus } from "../api/types";
import { buildPublicUrl } from "../utils/publicUrl";

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
