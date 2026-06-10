"use client";

import { useEffect, useRef } from "react";
import { useAppDispatch } from "../store/hooks";
import { hydrateUser, loadMe, markAuthReady } from "../store/slices/authSlice";
import { getAuthToken } from "../utils/authHeaders";
import { getCachedUser, setCachedUser } from "../utils/userCache";

/**
 * Hydrate the signed-in user once on app load. Cached user unlocks the shell
 * immediately while /auth/me verifies the token in the background.
 */
export function AuthBootstrap() {
  const dispatch = useAppDispatch();
  const booted = useRef(false);

  useEffect(() => {
    if (booted.current) return;
    booted.current = true;

    const token = getAuthToken();
    if (!token) {
      setCachedUser(null);
      dispatch(markAuthReady());
      return;
    }

    const cached = getCachedUser();
    if (cached) {
      dispatch(hydrateUser(cached));
    } else {
      dispatch(markAuthReady());
    }

    dispatch(loadMe());
  }, [dispatch]);

  return null;
}
