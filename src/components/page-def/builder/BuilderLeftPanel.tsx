"use client";

import type { FormDef } from "./pageDef";
import ComponentPalette from "./ComponentPalette";
import { PageOperationsPanel } from "./PageOperationsPanel";

type BuilderLeftPanelProps = {
  formDef: FormDef;
  activePageId: string;
  onActivePageChange: (pageId: string) => void;
  onFormDefChange: (updater: (prev: FormDef) => FormDef) => void;
  onClearSelection: () => void;
};

export default function BuilderLeftPanel({
  formDef,
  activePageId,
  onActivePageChange,
  onFormDefChange,
  onClearSelection,
}: BuilderLeftPanelProps) {
  return (
    <div className="flex h-full min-h-0 flex-col bg-white">
      <div className="max-h-[36%] min-h-0 shrink-0 overflow-auto border-b border-slate-200">
        <header className="sticky top-0 z-10 border-b border-slate-100 bg-white px-3 py-2">
          <h2 className="text-xs font-semibold text-slate-800">Pages</h2>
        </header>
        <div className="p-2">
          <PageOperationsPanel
            formDef={formDef}
            activePageId={activePageId}
            onActivePageChange={onActivePageChange}
            onFormDefChange={onFormDefChange}
            onClearSelection={onClearSelection}
          />
        </div>
      </div>
      <div className="flex min-h-0 flex-1 flex-col">
        <ComponentPalette />
      </div>
    </div>
  );
}
