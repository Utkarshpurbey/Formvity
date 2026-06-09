"use client";

import { useParams, usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { resolveFormId, resolveWorkspaceId } from "../utils/routeParams";

function syncId(paramId: string, resolve: (param: string) => string): string {
  return resolve(paramId);
}

export function useWorkspaceId(): string {
  const params = useParams();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const paramId = typeof params.workspaceId === "string" ? params.workspaceId : "";
  const [workspaceId, setWorkspaceId] = useState(() => syncId(paramId, resolveWorkspaceId));

  useEffect(() => {
    setWorkspaceId(syncId(paramId, resolveWorkspaceId));
  }, [paramId, pathname, searchParams]);

  return workspaceId;
}

export function useFormId(): string {
  const params = useParams();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const paramId = typeof params.formId === "string" ? params.formId : "";
  const [formId, setFormId] = useState(() => syncId(paramId, resolveFormId));

  useEffect(() => {
    setFormId(syncId(paramId, resolveFormId));
  }, [paramId, pathname, searchParams]);

  return formId;
}
