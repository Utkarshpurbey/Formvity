"use client";

import type { FormDef } from "./pageDef";
import { FormRuntime } from "../runtime/FormRuntime";

type BuilderPreviewProps = {
  open: boolean;
  formDef: FormDef;
  onClose: () => void;
};

export function BuilderPreview({ open, formDef, onClose }: BuilderPreviewProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-slate-900/40 backdrop-blur-sm">
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4">
        <div>
          <p className="text-sm font-semibold text-slate-900">Respondent preview</p>
          <p className="text-xs text-slate-500">Intake step → form pages (submit is local only)</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Close preview
        </button>
      </div>
      <div className="min-h-0 flex-1 overflow-auto">
        <FormRuntime formDef={formDef} preview standalone />
      </div>
    </div>
  );
}
