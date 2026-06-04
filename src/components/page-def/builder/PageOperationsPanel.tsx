"use client";

import type { FormDef, FormPageDef } from "./pageDef";
import { duplicatePage, getPageIndex, newPageId } from "../../../lib/normalizeFormDef";

const inputClass =
  "min-w-0 flex-1 rounded-md border border-slate-200 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400";

const iconBtn =
  "flex size-7 shrink-0 items-center justify-center rounded-md border border-slate-200 text-sm leading-none text-slate-700 hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-35";

type PageOperationsPanelProps = {
  formDef: FormDef;
  activePageId: string;
  onActivePageChange: (pageId: string) => void;
  onFormDefChange: (updater: (prev: FormDef) => FormDef) => void;
  onClearSelection: () => void;
};

export function PageOperationsPanel({
  formDef,
  activePageId,
  onActivePageChange,
  onFormDefChange,
  onClearSelection,
}: PageOperationsPanelProps) {
  const activePage = formDef.pages.find((p) => p.id === activePageId) ?? formDef.pages[0]!;
  const activeIndex = getPageIndex(formDef, activePage.id);

  const updateActivePage = (updater: (prev: FormPageDef) => FormPageDef) => {
    onFormDefChange((prev) => ({
      ...prev,
      pages: prev.pages.map((p) => (p.id === activePageId ? updater(p) : p)),
    }));
  };

  const addPage = () => {
    const id = newPageId();
    const page: FormPageDef = {
      id,
      title: `Page ${formDef.pages.length + 1}`,
      description: "",
      components: [],
    };
    onFormDefChange((prev) => ({ ...prev, pages: [...prev.pages, page] }));
    onActivePageChange(id);
    onClearSelection();
  };

  const deletePage = (pageId: string) => {
    if (formDef.pages.length <= 1) return;
    const remaining = formDef.pages.filter((p) => p.id !== pageId);
    onFormDefChange((prev) => ({ ...prev, pages: remaining }));
    if (activePageId === pageId) {
      onActivePageChange(remaining[0]?.id ?? "");
    }
    onClearSelection();
  };

  const movePage = (dir: -1 | 1) => {
    const idx = getPageIndex(formDef, activePage.id);
    const target = idx + dir;
    if (idx < 0 || target < 0 || target >= formDef.pages.length) return;
    onFormDefChange((prev) => {
      const pages = [...prev.pages];
      const [item] = pages.splice(idx, 1);
      pages.splice(target, 0, item!);
      return { ...prev, pages };
    });
  };

  const duplicateActivePage = () => {
    const copy = duplicatePage(activePage);
    onFormDefChange((prev) => ({ ...prev, pages: [...prev.pages, copy] }));
    onActivePageChange(copy.id);
    onClearSelection();
  };

  return (
    <div className="rounded-lg border border-slate-200/80 bg-white p-2 shadow-sm">
      <div className="flex items-center gap-1.5">
        <label htmlFor="fb-page-picker" className="sr-only">
          Active page
        </label>
        <select
          id="fb-page-picker"
          value={activePageId}
          aria-label="Select page"
          onChange={(e) => {
            onActivePageChange(e.target.value);
            onClearSelection();
          }}
          className="min-w-0 flex-1 rounded-md border border-slate-200 bg-white py-1 pl-2 pr-7 text-xs font-medium text-slate-800 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        >
          {formDef.pages.map((page, index) => (
            <option key={page.id} value={page.id}>
              {index + 1}. {page.title.trim() || `Page ${index + 1}`} ({page.components.length})
            </option>
          ))}
        </select>
        <span className="shrink-0 text-[10px] tabular-nums text-slate-400">
          {activeIndex + 1}/{formDef.pages.length}
        </span>
        <div className="ml-auto flex gap-0.5">
          <button
            type="button"
            title="Move page up"
            aria-label="Move page up"
            disabled={activeIndex === 0}
            onClick={() => movePage(-1)}
            className={iconBtn}
          >
            ↑
          </button>
          <button
            type="button"
            title="Move page down"
            aria-label="Move page down"
            disabled={activeIndex === formDef.pages.length - 1}
            onClick={() => movePage(1)}
            className={iconBtn}
          >
            ↓
          </button>
        </div>
      </div>

      <div className="mt-1.5 flex items-center gap-1.5">
        <label htmlFor="fb-page-title" className="sr-only">
          Page name
        </label>
        <input
          id="fb-page-title"
          type="text"
          value={activePage.title}
          onChange={(e) => updateActivePage((prev) => ({ ...prev, title: e.target.value }))}
          className={inputClass}
          placeholder={`Page ${activeIndex + 1}`}
          aria-label="Page name"
        />
      </div>

      <div className="mt-1.5 flex flex-wrap gap-1">
        <button
          type="button"
          onClick={addPage}
          className="rounded-md bg-indigo-600 px-2 py-1 text-[11px] font-semibold text-white hover:bg-indigo-700"
        >
          + Page
        </button>
        <button
          type="button"
          onClick={duplicateActivePage}
          className="rounded-md border border-slate-200 px-2 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-50"
          title="Duplicate current page"
        >
          Copy
        </button>
        <button
          type="button"
          disabled={formDef.pages.length <= 1}
          onClick={() => deletePage(activePage.id)}
          className="rounded-md border border-rose-200 px-2 py-1 text-[11px] font-medium text-rose-600 hover:bg-rose-50 disabled:pointer-events-none disabled:opacity-40"
          title="Delete page"
        >
          Delete
        </button>
      </div>

      <details className="mt-1.5 border-t border-slate-100 pt-1.5">
        <summary className="cursor-pointer select-none text-[11px] font-medium text-slate-500 hover:text-slate-700">
          Page notes <span className="font-normal text-slate-400">(optional, builder only)</span>
        </summary>
        <label htmlFor="fb-page-notes" className="sr-only">
          Internal page notes
        </label>
        <textarea
          id="fb-page-notes"
          value={activePage.description ?? ""}
          onChange={(e) =>
            updateActivePage((prev) => ({
              ...prev,
              description: e.target.value || undefined,
            }))
          }
          rows={2}
          className="mt-1.5 w-full rounded-md border border-slate-200 px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
          placeholder="Not shown to respondents"
        />
      </details>
    </div>
  );
}
