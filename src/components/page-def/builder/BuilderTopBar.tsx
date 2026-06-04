"use client";

import Link from "next/link";
import type { PublishStatus } from "../../../api/types";

export type CenterView = "preview" | "json";
export type SaveState = "saving" | "saved" | "unsaved";

type BuilderTopBarProps = {
  formTitle: string;
  centerView: CenterView;
  onCenterViewChange: (view: CenterView) => void;
  saveState: SaveState;
  apiMode: boolean;
  publishStatus: PublishStatus | null;
  onSave: () => void;
  onPublish: () => void;
  onShare: () => void;
  onUpdateLive: () => void;
  saving: boolean;
};

function SaveIndicator({ state }: { state: SaveState }) {
  if (state === "saving") {
    return <span className="text-xs text-slate-500">Saving…</span>;
  }
  if (state === "unsaved") {
    return <span className="text-xs font-medium text-amber-600">Unsaved changes</span>;
  }
  return (
    <span className="flex items-center gap-1 text-xs text-slate-500">
      <span className="size-1.5 rounded-full bg-emerald-500" aria-hidden />
      Saved
    </span>
  );
}

export function BuilderTopBar({
  formTitle,
  centerView,
  onCenterViewChange,
  saveState,
  apiMode,
  publishStatus,
  onSave,
  onPublish,
  onShare,
  onUpdateLive,
  saving,
}: BuilderTopBarProps) {
  const isPublished = publishStatus?.status === "published";
  const hasDraftDrift = Boolean(publishStatus?.draftChangedSincePublish);

  return (
    <header className="mb-3 flex shrink-0 flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <Link
          href="/workspace"
          className="shrink-0 rounded-lg px-2 py-1 text-xs font-medium text-slate-500 transition hover:bg-slate-50 hover:text-slate-800"
        >
          ← Workspace
        </Link>
        <span className="hidden h-4 w-px bg-slate-200 sm:block" aria-hidden />
        <p className="min-w-0 truncate text-sm font-semibold text-slate-900">{formTitle.trim() || "Untitled form"}</p>
        {apiMode && isPublished ? (
          <span className="hidden shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700 ring-1 ring-emerald-600/15 sm:inline-flex">
            <span className="size-1.5 rounded-full bg-emerald-500" aria-hidden />
            Live
          </span>
        ) : null}
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onCenterViewChange("preview")}
          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
            centerView === "preview"
              ? "bg-indigo-600 text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          Preview
        </button>
        <button
          type="button"
          onClick={() => onCenterViewChange("json")}
          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
            centerView === "json"
              ? "bg-indigo-600 text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          JSON
        </button>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <SaveIndicator state={saveState} />
        {!apiMode ? (
          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            Save
          </button>
        ) : (
          <>
            {isPublished && !hasDraftDrift ? (
              <button
                type="button"
                onClick={onShare}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Share
              </button>
            ) : null}
            {isPublished && hasDraftDrift ? (
              <button
                type="button"
                onClick={onUpdateLive}
                className="rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-600"
              >
                Update live
              </button>
            ) : null}
            {!isPublished ? (
              <button
                type="button"
                onClick={onPublish}
                className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700"
              >
                Publish
              </button>
            ) : null}
          </>
        )}
      </div>
    </header>
  );
}
