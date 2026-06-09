"use client";

import { useRouter } from "next/navigation";
import type { FormLifecycle } from "../../../lib/publish";
import { FormLifecycleBadge } from "../../ui/FormLifecycleBadge";
import { PublicLinkPanel } from "../../publish/PublicLinkPanel";
import { Spinner } from "../../ui/index";

export type SaveState = "saving" | "saved" | "unsaved";

type BuilderTopBarProps = {
  formTitle: string;
  saveState: SaveState;
  apiMode: boolean;
  lifecycle: FormLifecycle | null;
  showJson: boolean;
  onToggleJson: () => void;
  onSave: () => void;
  onPublish: () => void;
  onShare: () => void;
  onUpdateLive: () => void;
  saving: boolean;
  publishing?: boolean;
};

function SaveIndicator({ state }: { state: SaveState }) {
  if (state === "saving") {
    return (
      <span className="flex items-center gap-1.5 text-xs text-slate-500">
        <Spinner size="sm" />
        Saving…
      </span>
    );
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
  saveState,
  apiMode,
  lifecycle,
  showJson,
  onToggleJson,
  onSave,
  onPublish,
  onShare,
  onUpdateLive,
  saving,
  publishing = false,
}: BuilderTopBarProps) {
  const router = useRouter();
  const isLive = lifecycle?.kind === "live";
  const hasDraftDrift = Boolean(lifecycle?.draftChangedSincePublish);
  const isUnpublished = lifecycle?.kind === "unpublished";
  const isNeverPublished = lifecycle?.kind === "never_published";

  return (
    <header className="mb-3 flex shrink-0 flex-col gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <button
            type="button"
            onClick={() => router.push("/workspaces")}
            className="shrink-0 rounded-lg px-2 py-1 text-xs font-medium text-slate-500 transition hover:bg-slate-50 hover:text-slate-800"
          >
            ← Workspace
          </button>
          <span className="hidden h-4 w-px bg-slate-200 sm:block" aria-hidden />
          <p className="min-w-0 truncate text-sm font-semibold text-slate-900">{formTitle.trim() || "Untitled form"}</p>
          {apiMode && lifecycle ? <FormLifecycleBadge lifecycle={lifecycle} /> : null}
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onToggleJson}
            className={`rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${
              showJson ? "bg-slate-800 text-white" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
            }`}
            title="Edit raw FormDef JSON"
          >
            JSON
          </button>
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
              {isLive && !hasDraftDrift ? (
                <button
                  type="button"
                  onClick={onShare}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Share
                </button>
              ) : null}
              {isLive && hasDraftDrift ? (
                <button
                  type="button"
                  onClick={onUpdateLive}
                  className="rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-600"
                >
                  Update live
                </button>
              ) : null}
              {(isNeverPublished || isUnpublished) && !isLive ? (
                <button
                  type="button"
                  onClick={onPublish}
                  disabled={publishing}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {publishing ? (
                    <>
                      <Spinner size="sm" className="border-white/30 border-t-white" />
                      Publishing…
                    </>
                  ) : isUnpublished ? (
                    "Publish again"
                  ) : (
                    "Publish"
                  )}
                </button>
              ) : null}
            </>
          )}
        </div>
      </div>

      {apiMode && isLive && lifecycle.publicUrl ? (
        <PublicLinkPanel publicUrl={lifecycle.publicUrl} compact />
      ) : null}
    </header>
  );
}
