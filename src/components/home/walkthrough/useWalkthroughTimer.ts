"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { SCENE_DURATION_MS } from "./walkthroughData";

export function useWalkthroughTimer(sceneCount: number, enabled = true) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progressKey, setProgressKey] = useState(0);
  const isPausedRef = useRef(isPaused);

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  const goToScene = useCallback(
    (index: number) => {
      setActiveIndex(index % sceneCount);
      setProgressKey((k) => k + 1);
    },
    [sceneCount],
  );

  const onProgressEnd = useCallback(() => {
    if (!enabled || isPausedRef.current) return;
    setActiveIndex((i) => (i + 1) % sceneCount);
    setProgressKey((k) => k + 1);
  }, [enabled, sceneCount]);

  return {
    activeIndex,
    isPaused,
    setIsPaused,
    goToScene,
    progressKey,
    onProgressEnd,
    durationMs: SCENE_DURATION_MS,
  };
}
