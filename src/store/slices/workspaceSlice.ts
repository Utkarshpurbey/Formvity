import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import * as api from "../../api/client";
import { normalizeWorkspaceSummary, normalizeWorkspaceList } from "../../lib/apiNormalize";
import type { WorkspaceDashboard, WorkspaceMember, WorkspaceSummary } from "../../api/types";

type WorkspaceState = {
  list: WorkspaceSummary[];
  activeId: string | null;
  dashboardByWorkspace: Record<string, WorkspaceDashboard | undefined>;
  dashboardLoadingByWorkspace: Record<string, boolean>;
  membersByWorkspace: Record<string, WorkspaceMember[]>;
  membersLoadingByWorkspace: Record<string, boolean>;
  deletingWorkspaceIds: Record<string, boolean>;
  loading: boolean;
  creating: boolean;
  error: string | null;
};

const initialState: WorkspaceState = {
  list: [],
  activeId: null,
  dashboardByWorkspace: {},
  dashboardLoadingByWorkspace: {},
  membersByWorkspace: {},
  membersLoadingByWorkspace: {},
  deletingWorkspaceIds: {},
  loading: false,
  creating: false,
  error: null,
};

export const selectMembersForWorkspace = (state: { workspace: WorkspaceState }, workspaceId: string | null) =>
  workspaceId ? (state.workspace.membersByWorkspace[workspaceId] ?? []) : [];

export const selectMembersLoading = (state: { workspace: WorkspaceState }, workspaceId: string | null) =>
  Boolean(workspaceId && state.workspace.membersLoadingByWorkspace[workspaceId]);

export const selectDashboardForWorkspace = (
  state: { workspace: WorkspaceState },
  workspaceId: string | null,
) => (workspaceId ? state.workspace.dashboardByWorkspace[workspaceId] : undefined);

export const selectDashboardLoading = (state: { workspace: WorkspaceState }, workspaceId: string | null) =>
  Boolean(workspaceId && state.workspace.dashboardLoadingByWorkspace[workspaceId]);

export const fetchWorkspaces = createAsyncThunk("workspace/list", api.listWorkspaces);

export const fetchWorkspaceDashboard = createAsyncThunk(
  "workspace/dashboard",
  (workSpaceId: string) => api.getWorkspaceDashboard(workSpaceId),
);

export const createWorkspace = createAsyncThunk(
  "workspace/create",
  async (workSpaceName: string) => api.createWorkspace(workSpaceName),
);

export const fetchMembers = createAsyncThunk(
  "workspace/members",
  async (workSpaceId: string) => api.listMembers(workSpaceId),
);

export const removeWorkspace = createAsyncThunk(
  "workspace/delete",
  async (workSpaceId: string) => {
    await api.deleteWorkspace(workSpaceId);
    return workSpaceId;
  },
);

function upsertWorkspaceMeta(state: WorkspaceState, dashboard: WorkspaceDashboard) {
  const idx = state.list.findIndex((w) => w.workSpaceId === dashboard.workspaceId);
  const entry: WorkspaceSummary = {
    workSpaceId: dashboard.workspaceId,
    workSpaceName: dashboard.workspaceName,
    formCount: dashboard.formCount,
  };
  if (idx >= 0) state.list[idx] = { ...state.list[idx]!, ...entry };
  else state.list.unshift(entry);
}

const workspaceSlice = createSlice({
  name: "workspace",
  initialState,
  reducers: {
    setActiveWorkspace(state, action: PayloadAction<string | null>) {
      state.activeId = action.payload;
    },
    clearWorkspaceError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWorkspaces.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(fetchWorkspaces.fulfilled, (s, a) => {
        s.loading = false;
        s.list = normalizeWorkspaceList(a.payload);
        if (!s.activeId && s.list[0]) s.activeId = s.list[0].workSpaceId;
      })
      .addCase(fetchWorkspaces.rejected, (s, a) => {
        s.loading = false;
        s.error = a.error.message ?? "Could not load workspaces";
      })
      .addCase(fetchWorkspaceDashboard.pending, (s, a) => {
        s.dashboardLoadingByWorkspace[a.meta.arg] = true;
        s.error = null;
      })
      .addCase(fetchWorkspaceDashboard.fulfilled, (s, a) => {
        s.dashboardLoadingByWorkspace[a.meta.arg] = false;
        s.dashboardByWorkspace[a.meta.arg] = a.payload;
        upsertWorkspaceMeta(s, a.payload);
      })
      .addCase(fetchWorkspaceDashboard.rejected, (s, a) => {
        s.dashboardLoadingByWorkspace[a.meta.arg] = false;
        s.error = a.error.message ?? "Could not load workspace dashboard";
      })
      .addCase(createWorkspace.pending, (s) => {
        s.creating = true;
        s.error = null;
      })
      .addCase(createWorkspace.fulfilled, (s, a) => {
        s.creating = false;
        const normalized = normalizeWorkspaceSummary(a.payload);
        if (normalized.workSpaceId) {
          s.list.unshift(normalized);
          s.activeId = normalized.workSpaceId;
        }
      })
      .addCase(createWorkspace.rejected, (s, a) => {
        s.creating = false;
        s.error = a.error.message ?? "Could not create workspace";
      })
      .addCase(fetchMembers.pending, (s, a) => {
        s.membersLoadingByWorkspace[a.meta.arg] = true;
      })
      .addCase(fetchMembers.fulfilled, (s, a) => {
        s.membersLoadingByWorkspace[a.meta.arg] = false;
        s.membersByWorkspace[a.meta.arg] = a.payload;
      })
      .addCase(fetchMembers.rejected, (s, a) => {
        s.membersLoadingByWorkspace[a.meta.arg] = false;
      })
      .addCase(removeWorkspace.pending, (s, a) => {
        s.deletingWorkspaceIds[a.meta.arg] = true;
        s.error = null;
      })
      .addCase(removeWorkspace.fulfilled, (s, a) => {
        delete s.deletingWorkspaceIds[a.payload];
        s.list = s.list.filter((w) => w.workSpaceId !== a.payload);
        delete s.dashboardByWorkspace[a.payload];
        delete s.membersByWorkspace[a.payload];
        if (s.activeId === a.payload) s.activeId = s.list[0]?.workSpaceId ?? null;
      })
      .addCase(removeWorkspace.rejected, (s, a) => {
        delete s.deletingWorkspaceIds[a.meta.arg];
        s.error = a.error.message ?? "Could not delete workspace";
      });
  },
});

export const { setActiveWorkspace, clearWorkspaceError } = workspaceSlice.actions;
export default workspaceSlice.reducer;
