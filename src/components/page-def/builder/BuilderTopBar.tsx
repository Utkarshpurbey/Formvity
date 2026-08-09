"use client";

import { FormLifecycleBadge } from "../../ui/FormLifecycleBadge";
import type { FormLifecycle } from "../../../lib/publish";

import type { BuilderMode } from "../../../hooks/useBuilderPage";

export type SaveState = "saving" | "saved" | "unsaved";

type BuilderTopBarProps = {
  formTitle: string;
  saveState: SaveState;
  apiMode: boolean;
  lifecycle: FormLifecycle | null;
  builderMode: BuilderMode;
  intakeIsDefault: boolean;
  showJson: boolean;
  saving: boolean;
  publishing: boolean;
  onModeChange: (mode: BuilderMode) => void;
  onToggleJson: () => void;
  onSave: () => void;
  onPublish: () => void;
  onShare: () => void;
  onUpdateLive: () => void;
  onPreview: () => void;
  onOpenGuide: () => void;
  onOpenAiModal?: () => void;
};

export function BuilderTopBar({
  formTitle,
  saveState,
  apiMode,
  lifecycle,
  builderMode,
  intakeIsDefault,
  showJson,
  saving,
  publishing,
  onModeChange,
  onToggleJson,
  onSave,
  onPublish,
  onShare,
  onUpdateLive,
  onPreview,
  onOpenGuide,
}: BuilderTopBarProps) {
  const saveLabel =
    saveState === "saving" ? "Saving…" : saveState === "unsaved" ? "Unsaved changes" : "Saved";

  return (
    <header className="mb-4 flex shrink-0 flex-wrap items-center gap-3 rounded-2xl border border-slate-200/80 bg-white px-4 py-3 shadow-sm">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="truncate text-sm font-semibold text-slate-900">{formTitle.trim() || "Untitled form"}</h1>
          {apiMode && lifecycle ? <FormLifecycleBadge lifecycle={lifecycle} size="sm" /> : null}
        </div>
        <p className="mt-0.5 text-xs text-slate-500">{saveLabel}</p>
      </div>

      <nav className="flex rounded-xl bg-slate-100 p-1" aria-label="Builder mode">
        <button
          type="button"
          onClick={() => onModeChange("intake")}
          className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
            builderMode === "intake" ? "bg-white text-violet-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Intake
          {intakeIsDefault ? (
            <span className="ml-1 text-[10px] font-normal text-slate-400">(default)</span>
          ) : null}
        </button>
        <button
          type="button"
          onClick={() => onModeChange("pages")}
          className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
            builderMode === "pages" ? "bg-white text-violet-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Form pages
        </button>
      </nav>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onOpenGuide}
          className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
        >
          How to build
        </button>
        <button
          type="button"
          onClick={onPreview}
          className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
        >
          Preview
        </button>
        <button
          type="button"
          onClick={onToggleJson}
          className={`rounded-lg border px-3 py-1.5 text-xs font-medium ${
            showJson ? "border-violet-300 bg-violet-50 text-violet-700" : "border-slate-200 text-slate-600 hover:bg-slate-50"
          }`}
        >
          JSON
        </button>
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-60"
        >
          Save
        </button>
        {apiMode && lifecycle?.kind === "live" ? (
          <>
            <button
              type="button"
              onClick={onShare}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Share
            </button>
            <button
              type="button"
              onClick={onUpdateLive}
              disabled={publishing}
              className="rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-violet-700 disabled:opacity-60"
            >
              Update live
            </button>
          </>
        ) : apiMode ? (
          <button
            type="button"
            onClick={onPublish}
            disabled={publishing}
            className="rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-violet-700 disabled:opacity-60"
          >
            Publish
          </button>
        ) : null}
      </div>
    </header>
  );
}
