"use client";

import { useEffect, useRef } from "react";
import { Spinner } from "../ui/Spinner";

type UnpublishConfirmModalProps = {
  open: boolean;
  formTitle: string;
  unpublishing: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export function UnpublishConfirmModal({
  open,
  formTitle,
  unpublishing,
  onClose,
  onConfirm,
}: UnpublishConfirmModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    else if (!open && el.open) el.close();
  }, [open]);

  if (!open) return null;

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="fixed inset-0 z-50 m-auto w-[min(100%-2rem,24rem)] rounded-2xl border border-slate-200 bg-white p-0 shadow-2xl backdrop:bg-slate-900/40"
    >
      <div className="p-6">
        <div className="flex size-11 items-center justify-center rounded-full bg-rose-50 text-rose-600">
          <svg className="size-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
          </svg>
        </div>
        <h2 className="mt-4 text-lg font-semibold text-slate-900">Take form offline?</h2>
        <p className="mt-2 text-sm text-slate-600">
          <span className="font-medium text-slate-800">{formTitle.trim() || "Untitled form"}</span> will no longer
          be available at its public link. Respondents will see an unavailable message.
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={unpublishing}
            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={unpublishing}
            className="inline-flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {unpublishing ? (
              <>
                <Spinner size="sm" className="border-white/30 border-t-white" />
                Unpublishing…
              </>
            ) : (
              "Unpublish"
            )}
          </button>
        </div>
      </div>
    </dialog>
  );
}
