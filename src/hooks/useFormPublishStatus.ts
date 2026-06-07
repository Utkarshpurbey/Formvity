"use client";

import { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchPublishStatus } from "../store/slices/formsSlice";
import { selectFormsForWorkspace } from "../store/slices/formsSlice";
import type { PublishStatus } from "../api/types";
import { buildPublicUrl } from "../utils/publicUrl";

export function useFormPublishStatus(workspaceId: string, formId: string, enabled = true) {
  const dispatch = useAppDispatch();
  const form = useAppSelector((s) => selectFormsForWorkspace(s, workspaceId).find((f) => f.id === formId));
  const publication = useAppSelector((s) => s.forms.publicationByForm[formId]);
  const reduxStatus = useAppSelector((s) => s.forms.publishStatus);
  const lastPublish = useAppSelector((s) => s.forms.lastPublishResult);

  const [remoteStatus, setRemoteStatus] = useState<PublishStatus | null>(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled || !workspaceId || !formId) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    dispatch(fetchPublishStatus({ workspaceId, formId }))
      .unwrap()
      .then((data) => {
        if (!cancelled) setRemoteStatus(data);
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Could not load publish status");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [workspaceId, formId, enabled, dispatch]);

  const status = useMemo((): PublishStatus | null => {
    if (reduxStatus && (form?.status === "PUBLISHED" || reduxStatus.status === "published")) {
      return reduxStatus;
    }
    if (remoteStatus) return remoteStatus;
    if (form?.status === "PUBLISHED") {
      const slug = publication?.slug ?? lastPublish?.slug;
      return {
        status: "published",
        slug,
        publicUrl: publication?.publicUrl ?? (slug ? buildPublicUrl(slug) : undefined),
        lastPublishedAt: publication?.publishedAt ?? lastPublish?.publishedAt,
        draftChangedSincePublish: false,
      };
    }
    return { status: "draft", draftChangedSincePublish: false };
  }, [reduxStatus, remoteStatus, form?.status, publication, lastPublish]);

  const setStatus = setRemoteStatus;

  return { status, loading, error, setStatus };
}
