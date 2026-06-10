import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import * as api from "../../api/client";
import { ApiError } from "../../api/http";
import type { CurrentUser } from "../../api/types";
import { clearAuthToken, setAuthToken } from "../../utils/authHeaders";
import { setCachedUser } from "../../utils/userCache";

export type AuthState = {
  user: CurrentUser | null;
  ready: boolean;
  loading: boolean;
  error: string | null;
};

const initialState: AuthState = {
  user: null,
  ready: false,
  loading: false,
  error: null,
};

export const loginUser = createAsyncThunk(
  "auth/login",
  async ({ userName, password }: { userName: string; password: string }, { rejectWithValue }) => {
    try {
      const res = await api.login(userName, password);
      setAuthToken(res.token);
      return { id: res.id, displayName: res.displayName, email: userName };
    } catch (e) {
      clearAuthToken();
      return rejectWithValue(e instanceof ApiError ? e.message : "Login failed");
    }
  },
);

export const registerUser = createAsyncThunk(
  "auth/register",
  async ({ displayName, email, password }: { displayName: string; email: string; password: string }, { rejectWithValue }) => {
    try {
      await api.register(displayName, email, password);
      const res = await api.login(email, password);
      setAuthToken(res.token);
      return { id: res.id, displayName: res.displayName, email };
    } catch (e) {
      clearAuthToken();
      return rejectWithValue(e instanceof ApiError ? e.message : "Registration failed");
    }
  },
);

export const loadMe = createAsyncThunk("auth/me", async () => api.fetchMe());

export const logoutUser = createAsyncThunk("auth/logout", async () => {
  try {
    await api.logout();
  } catch {
    /* token may already be invalid */
  }
  clearAuthToken();
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearAuthError(state) {
      state.error = null;
    },
    markAuthReady(state) {
      state.ready = true;
    },
    hydrateUser(state, action: { payload: CurrentUser }) {
      state.user = action.payload;
      state.ready = true;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(loginUser.fulfilled, (s, a) => {
        s.loading = false;
        s.ready = true;
        s.user = a.payload;
        setCachedUser(a.payload);
      })
      .addCase(loginUser.rejected, (s, a) => {
        s.loading = false;
        s.error = (a.payload as string) ?? a.error.message ?? "Login failed";
      })
      .addCase(registerUser.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(registerUser.fulfilled, (s, a) => {
        s.loading = false;
        s.ready = true;
        s.user = a.payload;
        setCachedUser(a.payload);
      })
      .addCase(registerUser.rejected, (s, a) => {
        s.loading = false;
        s.error = (a.payload as string) ?? a.error.message ?? "Registration failed";
      })
      .addCase(loadMe.pending, (s) => {
        if (!s.user) s.loading = true;
      })
      .addCase(loadMe.fulfilled, (s, a) => {
        s.loading = false;
        s.ready = true;
        s.user = a.payload;
        setCachedUser(a.payload);
      })
      .addCase(loadMe.rejected, (s) => {
        s.loading = false;
        s.ready = true;
        s.user = null;
        setCachedUser(null);
        clearAuthToken();
      })
      .addCase(logoutUser.fulfilled, (s) => {
        s.user = null;
        s.loading = false;
        s.error = null;
        s.ready = true;
        setCachedUser(null);
      });
  },
});

export const { clearAuthError, markAuthReady, hydrateUser } = authSlice.actions;
export default authSlice.reducer;
