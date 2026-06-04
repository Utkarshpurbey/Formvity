import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import * as workspaceApi from "../../api/workspaceApi";
import type { WorkspaceMember, WorkspaceSummary } from "../../api/types";

type WorkspaceState = {
  list: WorkspaceSummary[];
  activeId: string | null;
  membersByWorkspace: Record<string, WorkspaceMember[]>;
  membersLoadingByWorkspace: Record<string, boolean>;
  loading: boolean;
  creating: boolean;
  error: string | null;
};

const initialState: WorkspaceState = {
  list: [],
  activeId: null,
  membersByWorkspace: {},
  membersLoadingByWorkspace: {},
  loading: false,
  creating: false,
  error: null,
};

export const selectMembersForWorkspace = (state: { workspace: WorkspaceState }, workspaceId: string | null) =>
  workspaceId ? (state.workspace.membersByWorkspace[workspaceId] ?? []) : [];

export const selectMembersLoading = (state: { workspace: WorkspaceState }, workspaceId: string | null) =>
  Boolean(workspaceId && state.workspace.membersLoadingByWorkspace[workspaceId]);

export const fetchWorkspaces = createAsyncThunk("workspace/list", workspaceApi.listWorkspaces);

export const createWorkspace = createAsyncThunk(
  "workspace/create",
  async (workSpaceName: string) => workspaceApi.createWorkspace(workSpaceName),
);

export const fetchMembers = createAsyncThunk(
  "workspace/members",
  async (workSpaceId: string) => workspaceApi.listMembers(workSpaceId),
);

export const removeWorkspace = createAsyncThunk(
  "workspace/delete",
  async (workSpaceId: string) => {
    await workspaceApi.deleteWorkspace(workSpaceId);
    return workSpaceId;
  },
);

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
        s.list = a.payload;
        if (!s.activeId && a.payload[0]) s.activeId = a.payload[0].workSpaceId;
      })
      .addCase(fetchWorkspaces.rejected, (s, a) => {
        s.loading = false;
        s.error = a.error.message ?? "Could not load workspaces";
      })
      .addCase(createWorkspace.pending, (s) => {
        s.creating = true;
        s.error = null;
      })
      .addCase(createWorkspace.fulfilled, (s, a) => {
        s.creating = false;
        const p = a.payload as Record<string, unknown>;
        const id = String(p.id ?? p.workSpaceId ?? "");
        const name = String(p.name ?? p.workSpaceName ?? "Workspace");
        if (id) {
          s.list.unshift({ workSpaceId: id, workSpaceName: name });
          s.activeId = id;
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
      .addCase(removeWorkspace.fulfilled, (s, a) => {
        s.list = s.list.filter((w) => w.workSpaceId !== a.payload);
        if (s.activeId === a.payload) s.activeId = s.list[0]?.workSpaceId ?? null;
      });
  },
});

export const { setActiveWorkspace, clearWorkspaceError } = workspaceSlice.actions;
export default workspaceSlice.reducer;
