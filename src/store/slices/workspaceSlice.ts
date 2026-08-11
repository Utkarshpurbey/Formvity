import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import * as api from "../../api/client";
import { normalizeWorkspaceSummary, normalizeWorkspaceList } from "../../lib/apiNormalize";
import { persistActiveWorkspaceId, readActiveWorkspaceId } from "../../lib/activeWorkspaceStorage";
import type { InviteMemberResponse, WorkspaceDashboard, WorkspaceMember, WorkspaceRole, WorkspaceSummary } from "../../api/types";

function resolveActiveWorkspaceId(list: WorkspaceSummary[], current: string | null): string | null {
  const stored = readActiveWorkspaceId();
  if (stored && list.some((w) => w.workSpaceId === stored)) return stored;
  if (current && list.some((w) => w.workSpaceId === current)) return current;
  return list[0]?.workSpaceId ?? null;
}

type WorkspaceState = {
  list: WorkspaceSummary[];
  activeId: string | null;
  dashboardByWorkspace: Record<string, WorkspaceDashboard | undefined>;
  dashboardLoadingByWorkspace: Record<string, boolean>;
  membersByWorkspace: Record<string, WorkspaceMember[]>;
  membersLoadingByWorkspace: Record<string, boolean>;
  deletingWorkspaceIds: Record<string, boolean>;
  invitingByWorkspace: Record<string, boolean>;
  updatingMemberRoleIds: Record<string, boolean>;
  renamingWorkspaceIds: Record<string, boolean>;
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
  invitingByWorkspace: {},
  updatingMemberRoleIds: {},
  renamingWorkspaceIds: {},
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

export const fetchWorkspaces = createAsyncThunk(
  "workspace/list",
  api.listWorkspaces,
  {
    condition: (_, { getState }) => {
      const state = getState() as { workspace: WorkspaceState };
      if (state.workspace.loading) return false;
      return state.workspace.list.length === 0;
    },
  },
);

export const refreshWorkspaces = createAsyncThunk("workspace/refreshList", api.listWorkspaces);

export const fetchWorkspaceDashboard = createAsyncThunk(
  "workspace/dashboard",
  (workSpaceId: string) => api.getWorkspaceDashboard(workSpaceId),
  {
    condition: (workSpaceId, { getState }) => {
      const state = getState() as { workspace: WorkspaceState };
      if (state.workspace.dashboardLoadingByWorkspace[workSpaceId]) return false;
      return !state.workspace.dashboardByWorkspace[workSpaceId];
    },
  },
);

export const createWorkspace = createAsyncThunk(
  "workspace/create",
  async (workSpaceName: string) => api.createWorkspace(workSpaceName),
);

export const fetchMembers = createAsyncThunk(
  "workspace/members",
  async (workSpaceId: string) => api.listMembers(workSpaceId),
);

export const inviteWorkspaceMember = createAsyncThunk(
  "workspace/inviteMember",
  async ({
    workspaceId,
    email,
    role,
  }: {
    workspaceId: string;
    email: string;
    role: WorkspaceRole;
  }): Promise<{ workspaceId: string; result: InviteMemberResponse }> => {
    const result = await api.inviteMember(workspaceId, email, role);
    return { workspaceId, result };
  },
);

export const updateWorkspaceMemberRole = createAsyncThunk(
  "workspace/updateMemberRole",
  async ({
    workspaceId,
    userId,
    role,
  }: {
    workspaceId: string;
    userId: string;
    role: WorkspaceRole;
  }) => {
    const member = await api.patchMemberRole(workspaceId, userId, { role });
    return { workspaceId, member };
  },
);

export const renameWorkspace = createAsyncThunk(
  "workspace/rename",
  async ({ workspaceId, workspaceName }: { workspaceId: string; workspaceName: string }) => {
    await api.patchWorkspace(workspaceId, { workspaceName });
    return { workspaceId, workspaceName };
  },
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
      persistActiveWorkspaceId(action.payload);
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
        s.activeId = resolveActiveWorkspaceId(s.list, s.activeId);
      })
      .addCase(fetchWorkspaces.rejected, (s, a) => {
        s.loading = false;
        s.error = a.error.message ?? "Unable to load workspaces. Please try again.";
      })
      .addCase(refreshWorkspaces.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(refreshWorkspaces.fulfilled, (s, a) => {
        s.loading = false;
        s.list = normalizeWorkspaceList(a.payload);
        s.activeId = resolveActiveWorkspaceId(s.list, s.activeId);
      })
      .addCase(refreshWorkspaces.rejected, (s, a) => {
        s.loading = false;
        s.error = a.error.message ?? "Unable to load workspaces. Please try again.";
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
        s.error = a.error.message ?? "Unable to load workspace details. Please try again.";
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
        s.error = a.error.message ?? "Unable to create the workspace. Please try again.";
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
      .addCase(inviteWorkspaceMember.pending, (s, a) => {
        s.invitingByWorkspace[a.meta.arg.workspaceId] = true;
        s.error = null;
      })
      .addCase(inviteWorkspaceMember.fulfilled, (s, a) => {
        s.invitingByWorkspace[a.meta.arg.workspaceId] = false;
      })
      .addCase(inviteWorkspaceMember.rejected, (s, a) => {
        s.invitingByWorkspace[a.meta.arg.workspaceId] = false;
        s.error = a.error.message ?? "Unable to send the invitation. Please try again.";
      })
      .addCase(updateWorkspaceMemberRole.pending, (s, a) => {
        s.updatingMemberRoleIds[a.meta.arg.userId] = true;
        s.error = null;
      })
      .addCase(updateWorkspaceMemberRole.fulfilled, (s, a) => {
        delete s.updatingMemberRoleIds[a.meta.arg.userId];
        const { workspaceId, member } = a.payload;
        const list = s.membersByWorkspace[workspaceId];
        if (!list) return;
        const idx = list.findIndex((m) => m.userId === member.userId);
        if (idx >= 0) list[idx] = { ...list[idx]!, ...member };
      })
      .addCase(updateWorkspaceMemberRole.rejected, (s, a) => {
        delete s.updatingMemberRoleIds[a.meta.arg.userId];
        s.error = a.error.message ?? "Unable to update the member role. Please try again.";
      })
      .addCase(renameWorkspace.pending, (s, a) => {
        s.renamingWorkspaceIds[a.meta.arg.workspaceId] = true;
        s.error = null;
      })
      .addCase(renameWorkspace.fulfilled, (s, a) => {
        s.renamingWorkspaceIds[a.meta.arg.workspaceId] = false;
        const { workspaceId, workspaceName } = a.payload;
        const idx = s.list.findIndex((w) => w.workSpaceId === workspaceId);
        if (idx >= 0) s.list[idx] = { ...s.list[idx]!, workSpaceName: workspaceName };
        const dash = s.dashboardByWorkspace[workspaceId];
        if (dash) s.dashboardByWorkspace[workspaceId] = { ...dash, workspaceName };
      })
      .addCase(renameWorkspace.rejected, (s, a) => {
        s.renamingWorkspaceIds[a.meta.arg.workspaceId] = false;
        s.error = a.error.message ?? "Unable to rename the workspace. Please try again.";
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
        if (s.activeId === a.payload) {
          s.activeId = resolveActiveWorkspaceId(s.list, null);
          persistActiveWorkspaceId(s.activeId);
        }
      })
      .addCase(removeWorkspace.rejected, (s, a) => {
        delete s.deletingWorkspaceIds[a.meta.arg];
        s.error = a.error.message ?? "Unable to deactivate the workspace. Please try again.";
      });
  },
});

export const { setActiveWorkspace, clearWorkspaceError } = workspaceSlice.actions;
export default workspaceSlice.reducer;
