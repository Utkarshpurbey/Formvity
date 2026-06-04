import { useEffect, useMemo, useState } from "react";
import type { FormDef } from "../components/page-def/builder/pageDef";
import { fetchFormDef, type FormLoadSource } from "../lib/formDefFromApi";

export type FormDefLoadStatus = "idle" | "loading" | "success" | "error";

export function useFormDef(source: FormLoadSource | null) {
  const [pageDef, setPageDef] = useState<FormDef | null>(null);
  const [status, setStatus] = useState<FormDefLoadStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const sourceKey = useMemo(() => {
    if (!source) return "";
    return source.type === "public"
      ? `public:${source.slug}`
      : `workspace:${source.workspaceId}:${source.formId}`;
  }, [source]);

  useEffect(() => {
    if (!source) {
      setPageDef(null);
      setStatus("idle");
      setError(null);
      return;
    }

    const ac = new AbortController();
    setStatus("loading");
    setError(null);

    fetchFormDef(source, ac.signal)
      .then((def) => {
        setPageDef(def);
        setStatus("success");
      })
      .catch((err: unknown) => {
        if (ac.signal.aborted) return;
        setPageDef(null);
        setStatus("error");
        setError(err instanceof Error ? err.message : "Failed to load form");
      });

    return () => ac.abort();
  }, [source, sourceKey]);

  return {
    pageDef,
    status,
    error,
    isLoading: status === "loading",
    isError: status === "error",
    isSuccess: status === "success",
  };
}
