"use client";

import { useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { persistActiveWorkspaceId } from "../../lib/activeWorkspaceStorage";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  fetchMembers,
  fetchWorkspaceDashboard,
  fetchWorkspaces,
  selectDashboardForWorkspace,
  selectMembersForWorkspace,
  setActiveWorkspace,
} from "../../store/slices/workspaceSlice";
import { fetchForms } from "../../store/slices/formsSlice";
import { useWorkspaceRole } from "./index";

export function useWorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const workspaceId = typeof params.workspaceId === "string" ? params.workspaceId : "";
  const { user, ready } = useAppSelector((s) => s.auth);
  const workspaces = useAppSelector((s) => s.workspace.list);
  const dashboard = useAppSelector((s) => selectDashboardForWorkspace(s, workspaceId));
  const members = useAppSelector((s) => selectMembersForWorkspace(s, workspaceId));
  const role = useWorkspaceRole(workspaceId);

  const workspace = useMemo(() => {
    const fromList = workspaces.find((w) => w.workSpaceId === workspaceId);
    if (fromList) return fromList;
    if (dashboard) {
      return {
        workSpaceId: dashboard.workspaceId,
        workSpaceName: dashboard.workspaceName,
        formCount: dashboard.formCount,
      };
    }
    return undefined;
  }, [workspaces, workspaceId, dashboard]);

  useEffect(() => {
    if (!ready) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    dispatch(fetchWorkspaces());
  }, [ready, user, router, dispatch]);

  useEffect(() => {
    if (!workspaceId) return;
    persistActiveWorkspaceId(workspaceId);
    dispatch(setActiveWorkspace(workspaceId));
    dispatch(fetchWorkspaceDashboard(workspaceId))
      .unwrap()
      .catch(() => {
        dispatch(fetchForms(workspaceId));
      });
    dispatch(fetchForms(workspaceId));
    dispatch(fetchMembers(workspaceId));
  }, [workspaceId, dispatch]);

  return {
    workspaceId,
    workspace,
    workspaceName: workspace?.workSpaceName ?? "Workspace",
    dashboard,
    members,
    role,
    user,
    ready,
  };
}
