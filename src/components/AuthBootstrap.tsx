"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { loadMe, markAuthReady } from "../store/slices/authSlice";
import { getAuthToken } from "../utils/authHeaders";
import { isDeepLinkRestorePending } from "../utils/routeParams";

/**
 * Hydrate the signed-in user whenever a JWT exists — including on marketing
 * routes like /home and /templates so navigation does not appear to log out.
 */
export function AuthBootstrap() {
  const dispatch = useAppDispatch();
  const pathname = usePathname() ?? "/";
  const user = useAppSelector((s) => s.auth.user);
  const ready = useAppSelector((s) => s.auth.ready);

  useEffect(() => {
    if (isDeepLinkRestorePending()) return;

    const token = getAuthToken();

    if (!token) {
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
