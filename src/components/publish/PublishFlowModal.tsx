"use client";

import { useEffect, useRef, useState } from "react";
import type { FormDef } from "../page-def/builder/pageDef";
import type { PublishResponse } from "../../api/types";
import { buildPublicUrl, slugifyTitle } from "../../utils/publicUrl";
import { PublicLinkPanel } from "./PublicLinkPanel";

export type PublishModalMode = "publish" | "republish" | "share";

type PublishFlowModalProps = {
  open: boolean;
  mode: PublishModalMode;
  formDef: FormDef;
  existingSlug?: string;
  existingPublicUrl?: string;
  publishing: boolean;
  onClose: () => void;
  onPublish: (slug?: string) => Promise<PublishResponse | void>;
  publishResult: PublishResponse | null;
  error: string | null;
};

type Step = "review" | "publishing" | "success" | "error";

function fieldCount(formDef: FormDef): number {
  return formDef.pages.reduce((n, p) => n + p.components.length, 0);
}

export function PublishFlowModal({
  open,
  mode,
  formDef,
  existingSlug,
  existingPublicUrl,
  publishing,
  onClose,
  onPublish,
  publishResult,
  error,
}: PublishFlowModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [slug, setSlug] = useState("");
  const [step, setStep] = useState<Step>("review");

  const suggestedSlug = slugifyTitle(formDef.title) || "my-form";
  const slugLocked = mode === "republish" || mode === "share";
  const effectiveSlug =
    existingSlug ?? publishResult?.slug ?? (slug.trim() || suggestedSlug);
  const publicUrl =
    publishResult?.publicUrl ?? existingPublicUrl ?? (effectiveSlug ? buildPublicUrl(effectiveSlug) : "");

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (open) {
      if (!el.open) el.showModal();
    } else if (el.open) {
      el.close();
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    if (mode === "share") {
      setStep("success");
      return;
    }
    setStep("review");
    setSlug(existingSlug ?? suggestedSlug);
  }, [open, mode, existingSlug, suggestedSlug]);

  useEffect(() => {
    if (publishing) setStep("publishing");
  }, [publishing]);

  useEffect(() => {
    if (publishResult && !publishing) setStep("success");
  }, [publishResult, publishing]);

  useEffect(() => {
    if (error && !publishing) setStep("error");
  }, [error, publishing]);

  const handleSubmit = async () => {
    setStep("publishing");
    const slugToSend = slugLocked ? undefined : slug.trim() || suggestedSlug;
    await onPublish(slugToSend);
  };

  if (!open) return null;

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="fixed inset-0 z-50 m-auto w-[min(100%-2rem,28rem)] max-h-[90vh] overflow-auto rounded-2xl border border-slate-200 bg-white p-0 shadow-2xl backdrop:bg-slate-900/40"
    >
      <div className="p-6">
        {step === "review" ? (
          <>
            <h2 className="text-lg font-semibold text-slate-900">
              {mode === "republish" ? "Update live version" : "Publish form"}
            </h2>
            {mode === "republish" ? (
              <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
                Your draft has changes that aren&apos;t live yet. Updating will replace the public version.
              </p>
            ) : (
              <p className="mt-1 text-sm text-slate-500">Review your form before making it public.</p>
            )}

            <dl className="mt-4 space-y-2 rounded-xl bg-slate-50 p-4 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Title</dt>
                <dd className="font-medium text-slate-900">{formDef.title.trim() || "Untitled form"}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Pages</dt>
                <dd className="font-medium text-slate-900">{formDef.pages.length}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Fields</dt>
                <dd className="font-medium text-slate-900">{fieldCount(formDef)}</dd>
              </div>
            </dl>

            <div className="mt-4">
              <label htmlFor="publish-slug" className="mb-1 block text-xs font-medium text-slate-600">
                Public URL slug
              </label>
              <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                <span className="shrink-0 text-xs text-slate-400">/r/</span>
                <input
                  id="publish-slug"
                  type="text"
                  value={slugLocked ? existingSlug ?? effectiveSlug : slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                  readOnly={slugLocked}
                  className="min-w-0 flex-1 bg-transparent text-sm text-slate-900 focus:outline-none"
                  placeholder={suggestedSlug}
                />
              </div>
              {!slugLocked ? (
                <p className="mt-1 text-[11px] text-slate-400">Lowercase letters, numbers, and hyphens only.</p>
              ) : null}
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                {mode === "republish" ? "Update live version" : "Publish form"}
              </button>
            </div>
          </>
        ) : null}

        {step === "publishing" ? (
          <div className="py-8 text-center">
            <div className="mx-auto size-10 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-600" />
            <p className="mt-4 text-sm font-medium text-slate-700">Publishing your form…</p>
          </div>
        ) : null}

        {step === "success" ? (
          <>
            <div className="flex flex-col items-center text-center">
              <div className="flex size-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                <svg className="size-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <h2 className="mt-4 text-lg font-semibold text-slate-900">Your form is live</h2>
              <p className="mt-1 text-sm text-slate-500">Share this link with anyone to collect responses.</p>
            </div>

            <PublicLinkPanel
              publicUrl={publicUrl}
              emptyMessage="Published successfully. Share link will appear once the API returns a slug."
            />

            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                Done
              </button>
            </div>
          </>
        ) : null}

        {step === "error" ? (
          <>
            <h2 className="text-lg font-semibold text-slate-900">Could not publish</h2>
            <p className="mt-2 text-sm text-rose-600">{error ?? "Something went wrong. Please try again."}</p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => setStep("review")}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                Try again
              </button>
            </div>
          </>
        ) : null}
      </div>
    </dialog>
  );
}
