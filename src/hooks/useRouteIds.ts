"use client";

import { useParams, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { resolveFormId, resolveWorkspaceId } from "../utils/routeParams";

export function useWorkspaceId(): string {
  const params = useParams();
  const pathname = usePathname();
  const paramId = typeof params.workspaceId === "string" ? params.workspaceId : "";
  const [workspaceId, setWorkspaceId] = useState(() => resolveWorkspaceId(paramId));

  useEffect(() => {
    setWorkspaceId(resolveWorkspaceId(paramId));
  }, [paramId, pathname]);

  return workspaceId;
}

export function useFormId(): string {
  const params = useParams();
  const pathname = usePathname();
  const paramId = typeof params.formId === "string" ? params.formId : "";
  const [formId, setFormId] = useState(() => resolveFormId(paramId));

  useEffect(() => {
    setFormId(resolveFormId(paramId));
  }, [paramId, pathname]);

  return formId;
}
