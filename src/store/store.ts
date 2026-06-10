import { combineReducers, configureStore, type UnknownAction } from "@reduxjs/toolkit";
import authReducer, { logoutUser } from "./slices/authSlice";
import workspaceReducer from "./slices/workspaceSlice";
import formsReducer from "./slices/formsSlice";
import analyticsReducer from "./slices/analyticsSlice";

const appReducer = combineReducers({
  auth: authReducer,
  workspace: workspaceReducer,
  forms: formsReducer,
  analytics: analyticsReducer,
});

const rootReducer = (state: ReturnType<typeof appReducer> | undefined, action: UnknownAction) => {
  if (logoutUser.fulfilled.match(action)) {
    return appReducer(undefined, action);
  }
  return appReducer(state, action);
};

export const store = configureStore({
  reducer: rootReducer,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
