import { useEffect, useState } from "react";
import * as formsApi from "../api/formsApi";
import { buildPublicUrl } from "../utils/publicUrl";

export function usePublishPublicUrl(workspaceId: string, formId: string, enabled = true) {
  const [publicUrl, setPublicUrl] = useState("");
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled || !workspaceId || !formId) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    formsApi
      .getPublishStatus(workspaceId, formId)
      .then((status) => {
        if (cancelled) return;
        const url = status.slug ? buildPublicUrl(status.slug) : (status.publicUrl ?? "");
        setPublicUrl(url);
        if (!url) setError("No public link available yet.");
      })
      .catch(() => {
        if (cancelled) return;
        setError("Could not load share link.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [workspaceId, formId, enabled]);

  return { publicUrl, loading, error };
}
