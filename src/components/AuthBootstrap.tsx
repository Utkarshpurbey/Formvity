"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { loadMe, markAuthReady } from "../store/slices/authSlice";
import { isPublicAuthPath } from "../lib/auth/publicPaths";
import { getAuthToken } from "../utils/authHeaders";

/**
 * Public routes: mark ready without /auth/me.
 * Protected routes: hydrate user from JWT via GET /auth/me when token exists.
 */
export function AuthBootstrap() {
  const dispatch = useAppDispatch();
  const pathname = usePathname() ?? "/";
  const user = useAppSelector((s) => s.auth.user);
  const ready = useAppSelector((s) => s.auth.ready);

  useEffect(() => {
    if (isPublicAuthPath(pathname)) {
      dispatch(markAuthReady());
      return;
    }

    if (!getAuthToken()) {
      if (!ready) dispatch(markAuthReady());
      return;
    }

    if (user) {
      if (!ready) dispatch(markAuthReady());
      return;
    }

    dispatch(loadMe());
  }, [dispatch, pathname, user, ready]);

  return null;
}
