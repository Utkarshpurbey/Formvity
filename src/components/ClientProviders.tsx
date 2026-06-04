"use client";

import type { ReactNode } from "react";
import { Provider } from "react-redux";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthBootstrap } from "./AuthBootstrap";
import { NavigationProgress } from "./layout/NavigationProgress";
import { store } from "../store/store";

export function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <Provider store={store}>
      <AuthBootstrap />
      <NavigationProgress />
      {children}
      <ToastContainer position="bottom-right" theme="colored" autoClose={3200} hideProgressBar />
    </Provider>
  );
}
