"use client";

import { useEffect, useRef } from "react";

const STEPS = [
  {
    title: "Set up respondent intake",
    body: "Use the Intake tab to collect name, email, or custom fields before respondents see your form questions.",
  },
  {
    title: "Drag fields onto the canvas",
    body: "Switch to Form pages, then drag components from the sidebar. v2 adds rating, scale, sections, file upload, and signature fields.",
  },
  {
    title: "Configure each field",
    body: "Click a field on the canvas to edit labels, validation, options, and appearance in the right panel.",
  },
  {
    title: "Preview and publish",
    body: "Use Preview to walk through intake + form as a respondent. Save your draft, then Publish to get a shareable link.",
  },
];

type BuilderGuideModalProps = {
  open: boolean;
  onClose: () => void;
};

export function BuilderGuideModal({ open, onClose }: BuilderGuideModalProps) {
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
      className="fixed inset-0 z-50 m-auto w-[min(100%-2rem,32rem)] rounded-2xl border border-slate-200 bg-white p-0 shadow-2xl backdrop:bg-slate-900/50"
    >
      <div className="border-b border-slate-100 px-6 py-5">
        <h2 className="text-lg font-bold text-slate-900">How to build great forms</h2>
        <p className="mt-1 text-sm text-slate-500">Four steps to go from blank canvas to a live form.</p>
      </div>
      <ol className="max-h-[min(60vh,24rem)] space-y-4 overflow-auto px-6 py-5">
        {STEPS.map((step, i) => (
          <li key={step.title} className="flex gap-4">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-violet-100 text-sm font-bold text-violet-700">
              {i + 1}
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-900">{step.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">{step.body}</p>
            </div>
          </li>
        ))}
      </ol>
      <div className="flex justify-end gap-2 border-t border-slate-100 px-6 py-4">
        <button
          type="button"
          onClick={onClose}
          className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700"
        >
          Got it — let&apos;s build
        </button>
      </div>
    </dialog>
  );
}
