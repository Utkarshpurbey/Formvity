"use client";

import { memo, useEffect, useRef, useState, type ComponentType, type CSSProperties } from "react";
import {
  SCENE_DURATION_MS,
  SCENE_ORDER,
  SCENE_URLS,
  WALKTHROUGH_SCENES,
  type WalkthroughScene,
} from "./walkthroughData";
import { useWalkthroughTimer } from "./useWalkthroughTimer";
import {
  AnalyticsFrame,
  BuilderFrame,
  PublishFrame,
  TemplatesFrame,
} from "./WalkthroughFrames";
import "./walkthrough.css";

type ProductWalkthroughProps = {
  variant?: "compact" | "full";
  className?: string;
};

function BrowserChrome({ url }: { url: string }) {
  return (
    <div className="flex items-center gap-2 border-b border-white/10 bg-slate-800/80 px-4 py-3">
      <div className="flex gap-1.5" aria-hidden>
        <span className="size-3 rounded-full bg-rose-400/80" />
        <span className="size-3 rounded-full bg-amber-400/80" />
        <span className="size-3 rounded-full bg-emerald-400/80" />
      </div>
      <div className="mx-auto flex h-7 w-full max-w-sm items-center justify-center rounded-lg bg-slate-900/60 px-3 text-[11px] text-slate-400">
        {url}
      </div>
    </div>
  );
}

const SCENE_FRAMES: Record<WalkthroughScene, ComponentType<{ compact?: boolean }>> = {
  templates: TemplatesFrame,
  builder: BuilderFrame,
  publish: PublishFrame,
  analytics: AnalyticsFrame,
};

function WalkthroughViewport({
  scene,
  compact,
  sceneKey,
}: {
  scene: WalkthroughScene;
  compact: boolean;
  sceneKey: number;
}) {
  const Frame = SCENE_FRAMES[scene];
  const minH = compact ? "min-h-[300px] sm:min-h-[340px]" : "min-h-[360px] sm:min-h-[400px]";

  return (
    <div className={`relative overflow-hidden ${minH}`} key={sceneKey}>
      <Frame compact={compact} />
    </div>
  );
}

function ProgressBar({
  progressKey,
  isPaused,
  onEnd,
}: {
  progressKey: number;
  isPaused: boolean;
  onEnd: () => void;
}) {
  return (
    <span
      key={progressKey}
      className="wt-progress absolute bottom-0 left-0 h-0.5 bg-violet-400"
      style={{ "--wt-duration": `${SCENE_DURATION_MS}ms` } as CSSProperties}
      onAnimationEnd={onEnd}
      aria-hidden
    />
  );
}

function ProductWalkthroughInner({ variant = "full", className = "" }: ProductWalkthroughProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(variant === "compact");
  const compact = variant === "compact";

  const { activeIndex, isPaused, setIsPaused, goToScene, progressKey, onProgressEnd } =
    useWalkthroughTimer(SCENE_ORDER.length, isVisible);

  const activeScene = SCENE_ORDER[activeIndex]!;

  useEffect(() => {
    if (variant === "compact") {
      const idle = window.requestIdleCallback?.(() => setIsVisible(true), { timeout: 1200 });
      if (idle) return () => window.cancelIdleCallback(idle);
      const t = window.setTimeout(() => setIsVisible(true), 300);
      return () => window.clearTimeout(t);
    }

    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "120px", threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [variant]);

  if (compact) {
    return (
      <div
        ref={containerRef}
        className={`relative mx-auto w-full max-w-4xl ${isPaused ? "wt-paused" : ""} ${className}`}
        aria-label="Product preview"
      >
        <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-violet-500/20 via-indigo-500/10 to-cyan-500/20 blur-2xl" aria-hidden />
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white shadow-2xl shadow-indigo-500/20 ring-1 ring-white/10">
          <BrowserChrome url={SCENE_URLS[activeScene]} />
          {isVisible ? (
            <WalkthroughViewport scene={activeScene} compact sceneKey={progressKey} />
          ) : (
            <div className="min-h-[300px] bg-slate-50 sm:min-h-[340px]" aria-hidden />
          )}
          <div className="relative flex border-t border-slate-200 bg-slate-50">
            {WALKTHROUGH_SCENES.map((s, i) => (
              <button
                key={s.id}
                type="button"
                onClick={() => goToScene(i)}
                className="relative flex-1 px-2 py-2.5 text-[9px] font-medium text-slate-500 transition hover:text-slate-700 sm:text-[10px]"
                aria-label={`Show ${s.title}`}
                aria-current={i === activeIndex ? "step" : undefined}
              >
                {s.step}
                {i === activeIndex && isVisible ? (
                  <ProgressBar progressKey={progressKey} isPaused={isPaused} onEnd={onProgressEnd} />
                ) : null}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`${isPaused ? "wt-paused" : ""} ${className}`}>
      <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-14">
        <div className="space-y-3">
          {WALKTHROUGH_SCENES.map((scene, i) => {
            const isActive = i === activeIndex;
            return (
              <button
                key={scene.id}
                type="button"
                onClick={() => goToScene(i)}
                className={`group w-full rounded-2xl border p-5 text-left transition-all duration-300 ${
                  isActive
                    ? "border-violet-200 bg-white shadow-md ring-1 ring-violet-100"
                    : "border-transparent bg-transparent hover:border-slate-200 hover:bg-white/60"
                }`}
                aria-current={isActive ? "step" : undefined}
              >
                <div className="flex items-start gap-4">
                  <span
                    className={`text-3xl font-black tabular-nums transition-colors ${
                      isActive ? "text-violet-500" : "text-slate-200 group-hover:text-slate-300"
                    }`}
                  >
                    {scene.step}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3
                      className={`text-base font-bold transition-colors sm:text-lg ${
                        isActive ? "text-slate-900" : "text-slate-500"
                      }`}
                    >
                      {scene.title}
                    </h3>
                    <p
                      className={`mt-1 text-sm leading-relaxed transition-all duration-300 ${
                        isActive ? "text-slate-600 opacity-100" : "text-slate-400 opacity-70"
                      }`}
                    >
                      {scene.description}
                    </p>
                    {isActive && isVisible ? (
                      <div className="relative mt-3 h-1 overflow-hidden rounded-full bg-slate-100">
                        <span
                          key={progressKey}
                          className="wt-progress absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-violet-500 to-indigo-500"
                          style={{ "--wt-duration": `${SCENE_DURATION_MS}ms` } as CSSProperties}
                          onAnimationEnd={onProgressEnd}
                          aria-hidden
                        />
                      </div>
                    ) : null}
                  </div>
                </div>
              </button>
            );
          })}

          {isVisible ? (
            <button
              type="button"
              onClick={() => setIsPaused((p) => !p)}
              className="mt-2 inline-flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-medium text-slate-500 transition hover:text-slate-700"
              aria-pressed={isPaused}
            >
              {isPaused ? "▶ Resume tour" : "⏸ Pause tour"}
            </button>
          ) : null}
        </div>

        <div className="relative [content-visibility:auto] [contain-intrinsic-size:400px]">
          <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-violet-200/40 via-transparent to-cyan-200/30 blur-2xl" aria-hidden />
          <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/10 ring-1 ring-slate-900/5">
            <BrowserChrome url={SCENE_URLS[activeScene]} />
            {isVisible ? (
              <WalkthroughViewport scene={activeScene} compact={false} sceneKey={progressKey} />
            ) : (
              <div className="min-h-[360px] bg-slate-50 sm:min-h-[400px]" aria-hidden />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export const ProductWalkthrough = memo(ProductWalkthroughInner);
