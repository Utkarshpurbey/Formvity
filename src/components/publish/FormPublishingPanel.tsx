"use client";

import { PublicLinkPanel } from "../publish/PublicLinkPanel";
import { FormLifecycleBadge } from "../ui/FormLifecycleBadge";
import { Spinner } from "../ui/index";
import type { FormLifecycle } from "../../lib/publish";

type FormPublishingPanelProps = {
  lifecycle: FormLifecycle;
  loading?: boolean;
  onPublish?: () => void;
  onRepublish?: () => void;
  onShare?: () => void;
  onUnpublish?: () => void;
  publishing?: boolean;
  unpublishing?: boolean;
  canPublish?: boolean;
  canUnpublish?: boolean;
};

function DisabledPublicLink({ url, label = "Previous public link" }: { url: string; label?: string }) {
  return (
    <div className="mt-4">
      <p className="mb-2 text-xs font-medium text-slate-500">{label}</p>
      <div className="flex gap-2 opacity-60">
        <input
          type="text"
          readOnly
          disabled
          value={url}
          className="min-w-0 flex-1 cursor-not-allowed rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-500"
        />
        <button
          type="button"
          disabled
          className="shrink-0 cursor-not-allowed rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-400"
        >
          Offline
        </button>
      </div>
      <p className="mt-1.5 text-[11px] text-slate-400">This link is no longer active. Publish again to restore access.</p>
    </div>
  );
}

export function FormPublishingPanel({
  lifecycle,
  loading,
  onPublish,
  onRepublish,
  onShare,
  onUnpublish,
  publishing,
  unpublishing,
  canPublish = true,
  canUnpublish = true,
}: FormPublishingPanelProps) {
  if (loading) {
    return (
      <div className="mt-6 flex items-center gap-2 text-sm text-slate-500">
        <Spinner size="sm" />
        Loading publish status…
      </div>
    );
  }

  if (lifecycle.kind === "live") {
    return (
      <div className="mt-6 space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <FormLifecycleBadge lifecycle={lifecycle} size="md" />
          {lifecycle.draftChangedSincePublish ? (
            <span className="text-sm text-amber-700">Unpublished changes in draft</span>
          ) : (
            <span className="text-sm text-emerald-700">Accepting responses</span>
          )}
        </div>
        {lifecycle.publicUrl ? <PublicLinkPanel publicUrl={lifecycle.publicUrl} /> : null}
        <div className="flex flex-wrap gap-2 pt-1">
          {onShare ? (
            <button
              type="button"
              onClick={onShare}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Share link
            </button>
          ) : null}
          {lifecycle.draftChangedSincePublish && onRepublish ? (
            <button
              type="button"
              onClick={onRepublish}
              disabled={publishing}
              className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600 disabled:opacity-60"
            >
              Update live version
            </button>
          ) : null}
          {onUnpublish ? (
            <button
              type="button"
              onClick={onUnpublish}
              disabled={unpublishing || !canUnpublish}
              className="inline-flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-100 disabled:opacity-60"
            >
              {unpublishing ? <Spinner size="sm" /> : null}
              Take offline
            </button>
          ) : null}
        </div>
      </div>
    );
  }

  if (lifecycle.kind === "unpublished") {
    return (
      <div className="mt-6 space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <FormLifecycleBadge lifecycle={lifecycle} size="md" />
          <span className="text-sm text-slate-600">This form is offline and not collecting responses.</span>
        </div>
        {lifecycle.previousPublicUrl ? (
          <DisabledPublicLink url={lifecycle.previousPublicUrl} />
        ) : null}
        {onPublish ? (
          <button
            type="button"
            onClick={onPublish}
            disabled={publishing || !canPublish}
            className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-violet-600/20 hover:bg-violet-700 disabled:opacity-60"
          >
            {publishing ? <Spinner size="sm" className="border-white/30 border-t-white" /> : null}
            Publish again
          </button>
        ) : null}
      </div>
    );
  }

  if (lifecycle.kind === "never_published") {
    return (
      <div className="mt-6 space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <FormLifecycleBadge lifecycle={lifecycle} size="md" />
          <span className="text-sm text-slate-600">This form is not visible to respondents and is not collecting responses.</span>
        </div>
        {onPublish ? (
          <button
            type="button"
            onClick={onPublish}
            disabled={publishing || !canPublish}
            className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-violet-600/20 hover:bg-violet-700 disabled:opacity-60"
          >
            {publishing ? <Spinner size="sm" className="border-white/30 border-t-white" /> : null}
            Publish form
          </button>
        ) : null}
      </div>
    );
  }

  return null;
}
