"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { FormDef } from "../page-def/builder/pageDef";
import { MultiPageForm } from "../page-def/runtime/MultiPageForm";
import type { TemplateCatalogEntry } from "../../lib/templates";
import { TemplateDetailSidebar } from "./TemplateDetailSidebar";

type TemplatePreviewModalProps = {
  entry: TemplateCatalogEntry;
  formDef: FormDef;
  onClose: () => void;
  onEdit: (key: string) => void;
};

export function TemplatePreviewModal({ entry, formDef, onClose, onEdit }: TemplatePreviewModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-6">
      <button
        type="button"
        aria-label="Close preview"
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="template-preview-title"
        className="relative flex h-[min(92vh,900px)] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-2xl shadow-slate-900/25"
      >
        <div className="z-10 flex shrink-0 items-start justify-between gap-4 border-b border-slate-200 bg-white px-5 py-4 sm:px-6">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold uppercase tracking-wide text-violet-600">
              {entry.categoryLabel}
            </p>
            <h2 id="template-preview-title" className="mt-0.5 text-lg font-semibold text-slate-900 sm:text-xl">
              {entry.pageDef.title}
            </h2>
            <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-slate-600">
              {entry.longDescription}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                {entry.pageDef.components.length} fields
              </span>
              <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                ~{entry.estimatedMinutes} min
              </span>
              <span className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                {entry.preview.cta}
              </span>
              {entry.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-lg bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-700"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
            aria-label="Close preview"
          >
            <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto lg:grid lg:grid-cols-[minmax(0,1fr)_300px] lg:overflow-hidden">
          <div className="p-4 sm:p-5 lg:min-h-0 lg:overflow-y-auto">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Live preview
            </p>
            <MultiPageForm formDef={formDef} />
          </div>

          <div className="border-t border-slate-200 bg-white p-5 lg:min-h-0 lg:overflow-y-auto lg:border-l lg:border-t-0">
            <TemplateDetailSidebar entry={entry} />
          </div>
        </div>

        <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-slate-200 bg-white px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Close
          </button>
          <button
            type="button"
            onClick={() => onEdit(entry.key)}
            className="rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-violet-700"
          >
            Edit in Formvity
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
